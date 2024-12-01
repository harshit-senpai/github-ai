"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createProjectSchema } from "~/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
export default function CreatePage() {
  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      repoUrl: "",
      projectName: "",
      githubToken: "",
    },
  });

  const createProject = api.project.createProject.useMutation();

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    createProject.mutate(
      {
        repoUrl: values.repoUrl,
        projectName: values.projectName,
        githubToken: values.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          form.reset();
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );
  };

  return (
    <section className="flex h-full items-center justify-center">
      <div>
        <div>
          <h1 className="text-2xl font-semibold text-black/80">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to Github-ai.
          </p>
        </div>
        <div className="mt-4">
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-sm"
                          placeholder="Enter your Project Name"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          className="text-sm"
                          placeholder="Enter your Github Repository URL"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="githubToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Github Token (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="text-sm"
                          placeholder="Enter your Github Repository URL"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !isValid || createProject.isPending}
              >
                Create Project
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
