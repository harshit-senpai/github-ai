import { pullCommit } from "~/lib/github";
import { createTRPCRouter, protectProcedure } from "../trpc";
import { createProjectSchema } from "~/schema";

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
});
