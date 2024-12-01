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

export default function CreatePage() {
  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      repoUrl: "",
      projectName: "",
      githubToken: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    window.alert(values);
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
              <Button type="submit" disabled={isSubmitting || !isValid}>
                Create Project
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
