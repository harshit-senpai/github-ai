import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { aiGenerateEmbeddings, summarizedCode } from "./ai";
import { db } from "~/server/db";

export const githubRepoLoader = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    recursive: true,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun-lockb",
    ],
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
  const docs = await githubRepoLoader(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  //   inserting embedding in db

  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
    console.log(`Processing ${index} of ${allEmbeddings.length}`);
    
    if(!embedding) return;

    // inserting source code embedding
    const sourceCodeEmbeddings = await db.sourceCodeEmbedding.create({
        data: {
            summary: embedding.summary,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            projectId,
        }
    })

    // inserting summary embedding as raw query
    
    await db.$executeRaw`
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding" = ${embedding.embedding}::vector
    WHERE "id" = ${sourceCodeEmbeddings.id}
    `
  }))
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (docs) => {
      const summary = await summarizedCode(docs);
      const embedding = await aiGenerateEmbeddings(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(docs)),
        fileName: docs.metadata.source,
      };
    }),
  );
};
