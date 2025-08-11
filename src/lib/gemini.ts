import { GoogleGenerativeAI } from "@google/generative-ai";

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
