"use client";

import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });
  return (
    <>
      <ul className="space-y-8 ">
        {commits?.map((commit, idx) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  idx === commits.length - 1 ? "h-6" : "-bottom-6",
                  "absolute top-0 left-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg- dark:bg-gray-700"></div>
              </div>
              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit-avatar"
                  className="relative mt-3 size-8 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                />
                <div className="rounded-md flex-auto bg-neutral-200 p-3 ring-1 ring-gray-200 ring-inset dark:bg-background dark:ring-gray-700">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400"
                    >
                      <span className="tex-gray-900 font-medium dark:text-gray-200">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="inline-flex items-center">
                        commited
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-semibold dark:text-white">
                    {commit.commitMessage}
                  </span>
                  <pre className="mt-2 text-sm leading-6 whitespace-pre-wrap text-gray-500 dark:text-gray-400">
                    {commit.summary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
