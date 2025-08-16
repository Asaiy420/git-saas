import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
export const loadGithubRepo = async (
	githubUrl: string,
	githubToken?: string,
) => {
	const loader = new GithubRepoLoader(githubUrl, {
		accessToken: githubToken || "",
		branch: "main",
		ignoreFiles: [
			"package-lock.json",
			"yarn.lock",
			"pnpm-lock.yaml",
			"bun.lockb",
		],
		recursive: true,
		unknown: "warn",
		maxConcurrency: 5,
	});

	const docs = await loader.load();
	return docs;
};

export const indexGithubRepo = async (
	projectId: string,
	githubUrl: string,
	githubToken?: string,
) => {
	const docs = await loadGithubRepo(githubUrl, githubToken);
	const allEmbeddings = await generateEmbeddings(docs);
	await Promise.allSettled(
		allEmbeddings.map(async (embedding, idx) => {
			console.log(`Processing ${idx} of ${allEmbeddings.length}`);
			if (!embedding) return;

			try {
				const sourceCodeEmbedding = await db.sourceCodeEmbedding.create(
					{
						data: {
							summary: embedding.summary,
							sourceCode: embedding.sourceCode,
							fileName: embedding.fileName,
							projectId,
						},
					},
				);

				console.log(
					`Created embedding record for ${embedding.fileName} with ID: ${sourceCodeEmbedding.id}`,
				);

				// Fixed raw query without semicolons
				await db.$executeRaw`
          UPDATE "SourceCodeEmbedding" 
          SET "summaryEmbedding" = ${embedding.embedding}::vector 
          WHERE id = ${sourceCodeEmbedding.id}
        `;
				console.log(`Updated vector for ID: ${sourceCodeEmbedding.id}`);
			} catch (error) {
				console.error(
					`Error processing embedding ${idx} for file ${embedding.fileName}:`,
					error,
				);
			}
		}),
	);
};

const generateEmbeddings = async (docs: Document[]) => {
	return await Promise.all(
		docs.map(async (doc) => {
			try {
				console.log(
					`Processing document: ${doc.metadata?.source || "unknown"}`,
				);

				// Generate summary
				const summary = await summarizeCode(doc);
				if (!summary) {
					console.warn(
						`No summary generated for ${doc.metadata?.source || "unknown"}, skipping`,
					);
					return null;
				}

				// Generate embedding
				const embedding = await generateEmbedding(summary);
				if (!embedding) {
					console.warn(
						`No embedding generated for ${doc.metadata?.source || "unknown"}, skipping`,
					);
					return null;
				}

				return {
					summary,
					embedding,
					sourceCode: JSON.stringify(doc.pageContent).slice(1, -1), // Remove quotes but preserve escaping
					fileName: doc.metadata?.source || "unknown",
				};
			} catch (error) {
				console.error(
					`Error processing document ${doc.metadata?.source || "unknown"}:`,
					error,
				);
				return null; // Return null for failed documents
			}
		}),
	).then((results) => results.filter(Boolean)); // Filter out nulls from failed processing
};
