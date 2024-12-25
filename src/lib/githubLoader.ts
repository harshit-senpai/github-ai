import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { aiGenerateEmbeddings, summarizedCode } from "./ai";
import { db } from "~/server/db";

export const githubRepoLoader = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_TOKEN,
    branch: "main",
    recursive: true,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun-lockb",
    ],
    unknown: "warn",
    maxConcurrency: 2
  });

  const docs = await loader.load();
  console.log(`Loaded ${docs.length} documents from ${githubUrl}`);

  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await githubRepoLoader(githubUrl, githubToken);

  //   inserting embedding in db

  // await Promise.allSettled(
  //   allEmbeddings.map(async (embedding, index) => {
  //     console.log(`Processing ${index} of ${allEmbeddings.length}`);

  //     if (!embedding) return;

  //     console.log("Summary: 🎉", embedding.summary);

  //     // inserting source code embedding
  //     const sourceCodeEmbeddings = await db.sourceCodeEmbedding.create({
  //       data: {
  //         summary: embedding.summary,
  //         sourceCode: JSON.stringify(embedding.sourceCode),
  //         fileName: embedding.fileName,
  //         projectId,
  //       },
  //     });

  //     // inserting summary embedding as raw query

  //     await db.$executeRaw`
  //   UPDATE "SourceCodeEmbedding"
  //   SET "summaryEmbedding" = ${embedding.embedding}::vector
  //   WHERE "id" = ${sourceCodeEmbeddings.id}
  //   `;
  //   }),
  // );
  const BATCH_SIZE = 5;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(docs.length / BATCH_SIZE)}`);

    for (const doc of batch) {
      try {
        console.log(`Processing file: ${doc.metadata.source}`);
        const summary = await summarizedCode(doc);
        const embedding = await aiGenerateEmbeddings(summary);

        const sourceCodeEmbeddings = await db.sourceCodeEmbedding.create({
          data: {
            summary,
            sourceCode: JSON.stringify(doc),
            fileName: doc.metadata.source,
            projectId,
          },
        });

        await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embedding}::vector
          WHERE "id" = ${sourceCodeEmbeddings.id}
        `;

        // Add delay between files
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process ${doc.metadata.source}:`, error);
        continue;
      }
    }

    // Add delay between batches
    if (i + BATCH_SIZE < docs.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
