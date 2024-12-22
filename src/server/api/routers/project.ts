import { pullCommit } from "~/lib/github";
import { createTRPCRouter, protectProcedure } from "../trpc";
import { createProjectSchema } from "~/schema";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.repoUrl,
          projectName: input.projectName,
          userToProject: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await pullCommit(project.id);
      return project;
    }),
  getProjects: protectProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),
  getCommits: protectProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      pullCommit(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),
});
