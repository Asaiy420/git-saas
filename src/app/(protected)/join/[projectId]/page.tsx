"use client";

import { db } from "@/server/db";
import { useAuth } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";

type Props = {
  params: { projectId: string };
};

const JoinHandler = ({ params }: Props) => {
  const { projectId } = params;
  const { userId, isLoaded } = useAuth();
  const { setProjectId } = useProject();
  const router = useRouter();
  const joinProject = api.project.joinProject.useMutation({
    onSuccess: () => {
      setProjectId(projectId);
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to join project:", error);
      router.push("/dashboard");
    },
  });

  useEffect(() => {
    if (!isLoaded) return; // Wait for auth to load

    if (!userId) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(`/join/${projectId}`)}`,
      );
      return;
    }

    joinProject.mutate({ projectId });
  }, [isLoaded, userId, projectId]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Joining project...</h1>
        <p className="text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  );
};

export default JoinHandler;
