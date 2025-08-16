"use client";

import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import React, { useState } from "react";
import { askQuestion } from "./action";
import { readStreamableValue } from "@ai-sdk/rsc";
import CodeReferneces from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
	const { project } = useProject();
	const [open, setOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const [filesReferences, setFilesReferneces] = useState<
		{ fileName: string; sourceCode: string; summary: string }[]
	>([]);
	const [answer, setAnswer] = useState("");
	const saveAnswer = api.project.saveAnswer.useMutation();

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setAnswer("");
		setFilesReferneces([]);
		e.preventDefault();
		if (!project?.id) return;
		setLoading(true);

		const { output, filesReferences } = await askQuestion(
			question,
			project.id,
		);
		setOpen(true);
		setFilesReferneces(filesReferences);

		for await (const delta of readStreamableValue(output)) {
			if (delta) {
				setAnswer((ans) => ans + delta);
			}
		}

		setLoading(false);
	};

	const refetch = useRefetch();

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90vh] max-w-[90vw] overflow-hidden">
					<DialogHeader className="pb-4">
						<div className="flex items-center justify-between gap-4">
							<DialogTitle className="flex-1 text-left">
								{question}
							</DialogTitle>
							<Button
								variant="outline"
								disabled={saveAnswer.isPending}
								onClick={() => {
									saveAnswer.mutate(
										{
											projectId: project?.id!,
											question,
											answer,
											filesReferneces: filesReferences,
										},
										{
											onSuccess: () => {
												toast.success(
													"Answer saved successfully",
												);
												refetch();
											},
											onError: () => {
												toast.error(
													"Error saving answer",
												);
											},
										},
									);
								}}
							>
								Save Answer
							</Button>
						</div>
					</DialogHeader>

					<div className="flex-1 space-y-4 overflow-hidden">
						<MDEditor.Markdown
							source={answer}
							className="max-h-[40vh] overflow-y-auto rounded-md border p-4"
						/>

						<CodeReferneces filesReferences={filesReferences} />
					</div>

					<div className="flex justify-end pt-4">
						<Button
							type="button"
							disabled={loading}
							onClick={() => setOpen(false)}
						>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Card className="border-accent relative col-span-3">
				<CardHeader className="pb-4">
					<CardTitle className="text-center text-lg">
						Ask a question
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={onSubmit} className="space-y-4">
						<Textarea
							className="min-h-[120px] resize-none p-6 text-center"
							placeholder="Which file should i edit to change the home page?"
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
						/>

						<div className="flex justify-center">
							<Button
								type="submit"
								disabled={loading}
								className="px-8 cursor-pointer"
							>
								{loading ? "Asking..." : "Ask Githofy"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default AskQuestionCard;
