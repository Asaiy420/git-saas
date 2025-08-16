"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import { useState } from "react";
import { Badge, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeeting.useQuery(
    { projectId },
    {
      refetchInterval: 4000,
    },
  );
  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No Meetings Found...</div>}
      {isLoading && <Loader2 size={30} className="animate-spin" />}
      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
              <div className="terxt-gray-500 flex items-center gap-x-2 text-xs">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toLocaleDateString()}
                </p>
                <p className="truncate">{meeting.issue.length} issues</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button variant="outline" className="cursor-pointer">
                  View Meetings
                </Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MeetingsPage;
