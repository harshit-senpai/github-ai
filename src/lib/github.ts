import { Octokit } from "octokit";
import { db } from "~/server/db";
import axios from "axios";
import { aiSummarizeCommit } from "./ai";

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid Github URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommit = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommit.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pullCommit = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

  const commitHashes = await getCommitHashes(githubUrl);

  console.log(`Total commits to process: ${commitHashes.length}`);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  console.log(`Unprocessed commits: ${unprocessedCommits.length}`);

  // const summaryResponses = await Promise.allSettled(
  //   unprocessedCommits.map((commit) => {
  //     return summarizeCommit(githubUrl, commit.commitHash);
  //   }),
  // );

  // const summaries = summaryResponses.map((response) => {
  //   if (response.status === "fulfilled") {
  //     return response.value;
  //   }
  //   return "";
  // });

  // const commit = await db.commit.createMany({
  //   data: summaries.map((summary, index) => {
  //     console.log(`Processing ${index} summaries`);
  //     return {
  //       projectId: projectId,
  //       commitHash: unprocessedCommits[index]!.commitHash,
  //       commitMessage: unprocessedCommits[index]!.commitMessage,
  //       commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
  //       commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
  //       commitDate: unprocessedCommits[index]!.commitDate,
  //       summary: summary,
  //     };
  //   }),
  // });

  // return commit;
  const BATCH_SIZE = 5;
  for (let i = 0; i < unprocessedCommits.length; i += BATCH_SIZE) {
    const batch = unprocessedCommits.slice(i, i + BATCH_SIZE);
    console.log(`Processing commit batch ${i / BATCH_SIZE + 1} of ${Math.ceil(unprocessedCommits.length / BATCH_SIZE)}`);

    for (const commit of batch) {
      try {
        console.log(`Processing commit: ${commit.commitHash}`);
        const summary = await summarizeCommit(githubUrl, commit.commitHash);

        await db.commit.create({
          data: {
            projectId,
            commitHash: commit.commitHash,
            commitMessage: commit.commitMessage,
            commitAuthorName: commit.commitAuthorName,
            commitAuthorAvatar: commit.commitAuthorAvatar,
            commitDate: commit.commitDate,
            summary,
          },
        });

        // Add delay between commits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process commit ${commit.commitHash}:`, error);
        continue;
      }
    }

    // Add delay between batches
    if (i + BATCH_SIZE < unprocessedCommits.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

async function summarizeCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  const summary = await aiSummarizeCommit(data);
  return summary;
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }

  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}
