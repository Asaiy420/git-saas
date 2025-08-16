"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type RouterOutputs } from "@/trpc/react";
import type { RouterOptions } from "express";
import { Loader2, VideoIcon } from "lucide-react";
import { issue } from "node_modules/zod/v4/core/util.cjs";
import React, { useState } from "react";

type Props = {
  meetingId: string;
};

const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    {
      refetchInterval: 4000,
    },
  );

  if (isLoading || !meeting) return <Loader2 />;

  return (
    <>
      <div className="p-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-6">
            <div className="rounded-full border bg-white p-3">
              <VideoIcon className="h-8 w-6" />
            </div>
            <h1>
              <div className="text-sm leading-6 text-gray-600">
                Meeting on {""}
                {meeting.createdAt.toLocaleDateString()}
              </div>
              <div className="mt-1 text-base leading-6 font-semibold text-gray-900">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meeting.issue.map((issues) => (
            <IssueCard key={issues.id} issues={issues} />
          ))}
        </div>
      </div>
    </>
  );
};

function IssueCard({
  issues,
}: {
  issues: NonNullable<
    RouterOutputs["project"]["getMeetingById"]
  >["issue"][number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{issues.gist}</DialogTitle>
            <DialogDescription>
              {issues.createdAt.toLocaleDateString()}
            </DialogDescription>
            <p className="text-gray-600">{issues.headline}</p>
            <blockquote className="mt-2 border-1 border-gray-300 bg-gray-50 p-4">
              <span className="text-sm text-gray-600">
                {issues.start} - {issues.end}
              </span>
              <p className="leading-relaxed font-medium text-gray-900 italic">
                {issues.summary}
              </p>
            </blockquote>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">{issues.gist}</CardTitle>
          <div className="border-b"></div>
          <CardDescription>{issues.headline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  );
}

export default IssuesList;
