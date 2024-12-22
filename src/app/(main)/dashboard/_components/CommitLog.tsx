"use client";

import useProject from "~/hooks/useProjects";
import { api } from "~/trpc/react";

export const CommitLog = () => {
  const { projectId } = useProject();

  const { data: commit } = api.project.getCommits.useQuery({ projectId });

  return <pre>{JSON.stringify(commit, null, 2)}</pre>;
};
