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

      return project;
    }),
});
