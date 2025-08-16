"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
	repoUrl: string;
	projectName: string;
	githubToken?: string;
};

const CreatePage = () => {
	const { register, handleSubmit, reset } = useForm<FormInput>();
	const createProject = api.project.createProject.useMutation();
	const refetch = useRefetch();

	function onSubmit(data: FormInput) {
		createProject.mutate(
			{
				githubUrl: data.repoUrl,
				name: data.projectName,
				githubToken: data.githubToken,
			},
			{
				onSuccess: () => {
					toast.success("Project Created Successfully!");
					refetch();
					reset();
				},
				onError: () => {
					toast.error("Failed to create the project!");
				},
			},
		);
		return true;
	}

	return (
		<div className="flex h-full items-center justify-center gap-12">
			<div>
				<div>
					<h1 className="text-2xl font-semibold">
						Link Your Github Repository
					</h1>
					<p className="text-muted-foreground text-sm">
						Enter the URL of your repository to link it to Blaze
					</p>
				</div>
				<div className="h-4"></div>
				<div>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Input
							{...register("projectName", { required: true })}
							placeholder="Your Project Name"
							required
						/>
						<div className="h-2"></div>
						<Input
							{...register("repoUrl", { required: true })}
							placeholder="Your GitHub URL"
							type="url"
							required
						/>
						<div className="h-2"></div>
						<Input
							{...register("githubToken", { required: false })}
							placeholder="Github Token (Optional)"
						/>
						<div className="h-4"></div>
						<Button
							type="submit"
							disabled={createProject.isPending}
							className="cursor-pointer"
						>
							Create Project
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreatePage;
