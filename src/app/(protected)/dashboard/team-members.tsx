"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  return (
    <div className="flex items-center gap-2">
      {members?.map((member) => (
        <Avatar key={member.id} className="size-8">
          <AvatarImage
            src={member.user.imageUrl}
            alt={member.user.firstName || "Team member"}
          />
          <AvatarFallback>
            {member.user.firstName?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};

export default TeamMembers;
