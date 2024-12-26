"use client";

import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import useProject from "~/hooks/useProjects";
import { CommitLog } from "./_components/CommitLog";
import AskQuestionCard from "./_components/AskQuestionCard";

const DashboardPage = () => {
  const { project } = useProject();

  return (
    <main>
      <section className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-4 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                  target="_blank"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-2 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
        </div>
      </section>

      <section className="mt-8">
        <CommitLog />
      </section>
    </main>
  );
};
export default DashboardPage;
