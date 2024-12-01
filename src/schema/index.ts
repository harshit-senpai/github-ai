import { z } from "zod";

export const createProjectSchema = z.object({
  repoUrl: z.string({
    message: "Please enter a valid GitHub repository URL",
  }),
  projectName: z.string({
    message: "Please enter a project name",
  }),
  githubToken: z.string().optional(),
});
