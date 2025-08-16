import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
});

/**
 * Summarize a git diff into short, high-signal release notes.
 *
 * Contract
 * - input: full unified git diff (string)
 * - output: concise markdown string
 */
export const aiSummarizeCommit = async (diff: string) => {
	const prompt = `You are an expert programmer. Summarize the following git diff into concise, high-signal notes a teammate can read in under 30 seconds.

Reminders about the git diff format:
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aADF691..bFE0f03 100644
a/lib/index.js
b/lib/index.js
--- a/path/old
+++ b/path/new
// A line starting with '+' means it was added.
// A line starting with '-' means it was removed.
// Context lines (space/no prefix) are not part of the change itself.
\`\`\`

Guidelines:
- Write 4-8 bullet points, each a complete, imperative sentence.
- Put impacted files or modules at the end of the line in square brackets, e.g. [src/api/users.ts].
- Prefer substance over noise: call out new features, behavior changes, bug fixes, API/contracts, data/model changes, security and performance.
- Note breaking changes explicitly with the prefix BREAKING:.
- Ignore pure formatting, comments, snapshots, lockfiles, or generated code unless they matter.
- If tests were added/changed, mention coverage or intent, not every file name.

Example summary comments:
- Raise maximum returned recordings from 10 to 100 [packages/server/recordings_api.ts]
- Fix typo in GitHub Action name [.github/workflows/ci.yml]
- Extract Octokit initialization to its own module [src/octokit.ts, src/index.ts]
- Add OpenAI completions API and wire up endpoint [packages/utils/apis/openai.ts]
- Lower numeric tolerance for unit tests [packages/server/constants.ts]

Output format:
- Do not wrap in code fences.
- A tight bullet list only. No intro/outro text.

Now summarize this commit:
DIFF START
\`\`\`
${diff}
\`\`\`
DIFF END`;

	const result = await model.generateContent(prompt);
	const text = result.response?.text?.() ?? "";
	return text.trim();
};

export async function summarizeCode(doc: Document) {
	// Safe, visible logging regardless of missing metadata
	const source = (doc as any)?.metadata?.source ?? "(unknown source)";
	const code = doc?.pageContent ? doc.pageContent.slice(0, 10000) : "";
	console.log(
		"summarizeCode: getting summary for",
		source,
		"len:",
		code.length,
	);

	if (!code) {
		console.warn("summarizeCode: no pageContent provided for", source);
		return "";
	}

	try {
		const response = await model.generateContent([
			`You are an intelligent senior software engineer who specializes in onboarding junior engineers onto projects.
You are onboarding a junior software engineer and explaining to them the purpose of the file: ${source}
Here is the code:
---
${code}
---
Give me a concise summary (<= 100 words) of the code above.`,
		]);

		return response.response.text();
	} catch (err) {
		console.error("summarizeCode: generation failed for", source, err);
		return "";
	}
}

export async function generateEmbedding(summary: string) {
	try {
		const model = genAI.getGenerativeModel({
			model: "text-embedding-004",
		});

		console.log(
			`Generating embedding for summary: ${summary.substring(0, 50)}...`,
		);
		const result = await model.embedContent(summary);
		const embedding = result.embedding;
		console.log(
			`Successfully generated embedding with ${embedding.values.length} dimensions`,
		);
		return embedding.values;
	} catch (error) {
		console.error("Error generating embedding:", error);
		throw error; // Rethrow to handle in the caller
	}
}
