"use server";

import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "@ai-sdk/rsc";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();
  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  // Debug the query before execution
  console.log(`Executing query for project ID: ${projectId}`);
  console.log(`Query vector length: ${queryVector.length}`);

  let result: { fileName: string; sourceCode: string; summary: string }[] = [];
  let context = "";

  try {
    // Lower the similarity threshold to ensure more relevant documents are included
    result = (await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) AS similarity   
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
      ORDER BY 1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) DESC
      LIMIT 10
      `) as { fileName: string; sourceCode: string; summary: string }[];

    // Debug the query results
    console.log(`Query returned ${result.length} results`);

    // Add a check for empty results
    if (result.length === 0) {
      console.log("WARNING: No relevant code files found");
      context = "No relevant code files found in the repository.";
    } else {
      // Format the context more clearly
      for (const doc of result) {
        // Debug individual result items
        console.log(
          `Found file: ${doc.fileName} with similarity: ${(doc as any).similarity?.toFixed(2) || "N/A"}`,
        );

        // Only include code content if it exists
        const codeContent = doc.sourceCode || "No code content available";
        const summary = doc.summary || "No summary available";

        context += `File: ${doc.fileName}\n`;
        context += `Similarity score: ${(doc as any).similarity?.toFixed(2) || "N/A"}\n`;
        context += `Code content:\n${codeContent}\n`;
        context += `Summary: ${summary}\n\n`;
      }
    }

    // Generate response using AI
    (async () => {
      try {
        console.log("Generating AI response...");

        const { textStream } = await streamText({
          model: google("gemini-1.5-flash"),
          prompt: `You are a specialized code assistant who analyzes repositories and answers questions about code. Your target audience is developers who need help understanding codebases.
      The AI assistant is precise, technical, and offers practical solutions.

      The traits of this AI include technical accuracy, clarity, and helpfulness.
      AI maintains a professional tone and focuses on delivering value.
      AI is responsive and thorough, providing well-structured and complete answers.
      AI has deep knowledge of programming languages, frameworks, and best practices, and is able to accurately answer nearly any question about code.
      If the question is asking about specific code or files, AI will provide a detailed answer with explanations and examples.
      Always be precise with answer. If the question is not clear, ask for clarification. And make the response as short as you can with the text format.

      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK

      START QUESTION
      ${question}
      END OF QUESTION

      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I don't have enough information from the codebase to answer that question completely. Here's what I can tell you based on the available context..."
      AI assistant will not invent or assume code that is not present in the context.
      Answer in markdown syntax with code snippets as needed. Be as detailed as possible when answering technical questions.`,
        });

        for await (const delta of textStream) {
          stream.update(delta);
        }
        console.log("AI response generation completed");
        stream.done();
      } catch (error) {
        console.error("Error in text generation:", error);
        stream.update(
          "I'm sorry, but I encountered an error while processing your question. Please try again.",
        );
        stream.done();
      }
    })();
  } catch (e) {
    console.error("Error in text generation:", e);
  }
  return {
    output: stream.value,
    filesReferences: result,
  };
}
