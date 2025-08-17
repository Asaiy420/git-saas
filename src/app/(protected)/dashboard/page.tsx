"use client";

import useProject from "@/hooks/use-project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import TeamMembers from "./team-members";
import dynamic from "next/dynamic";

const InviteButton = dynamic(() => import('./invite-button'), { ssr: false })

const DashboardPage = () => {
  const { project } = useProject();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* GITHUB LINK */}
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TeamMembers /> 
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Commit Log</h2>
          <CommitLog />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
