import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummarizeCommit = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are few metadata lines, like (for example):
        \'\'\'
        diff --git a/lib/index.js b/lib/index.js
        index aaadf691..f8d91b1 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \'\'\'
        This means that \'lib/index.js\' was modified in this commit . Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \'+\' means that it was added
        A line starting with \'-\' means that it was deleted
        A line that starts neither with \'+\' nor \'-\' is code given for the context and better understanding.
        it is not part of the diff.
        [...]
        EXAMPLE SUMMARY CONTENTS:
        \`\`\
        + Raised the amount of returned reordering from \'10\' to \'100'\' [packages/server/recordings_api.ts]. [packages/server/constants.ts]
        + Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
        + Moved the \'octokit\' initialization to a separate file [src/octokit.ts], [src/lib/github.ts]
        + Added a new OpenAI API for completion [packages/utlis/apis/openai.ts]
        + Lowered numeric tolerance for the test files
        \`\`\
        Most commits will have less comments than this list.
        The last comment does not include the file names,
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given only an example of appropriate comments.
        'Please summarize the changes in the following diff file: \n\n${diff}'
        `,
  ]);

  return response.response.text();
};

export async function summarizedCode(docs: Document) {
  try {
    console.log(`getting summary for ${docs.metadata.source}`);

    const code = docs.pageContent.slice(0, 10000);

    const response = await model.generateContent([
      "You are an intelligent Senior software engineer who specialises in onboarding junior software engineers onto projects",
      `you are onboarding a junior software engineer and explaining to then the purpose of the ${docs.metadata.source} file Here is the code : 
    ---
    ${code}
    ---
    Give a summary no more than 200 words fo the code above`,
    ]);

    return response.response.text();
  } catch (err) {
    return "";
  }
}

export async function aiGenerateEmbeddings(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(summary);
  const embedding = result.embedding;
  return embedding.values;
}
