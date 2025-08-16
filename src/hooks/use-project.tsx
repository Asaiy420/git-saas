import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
	const { data: projects } = api.project.getProjects.useQuery();
	const [projectId, setProjectId] = useLocalStorage("blaze-project", "");
	const project = projects?.find((project) => projectId === projectId);

	return {
		projects,
		project,
		projectId,
		setProjectId,
	};
};

export default useProject;
