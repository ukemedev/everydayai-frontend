import React from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useCreateProject } from "@/hooks/use-projects";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: Props) {
  const { mutate: createProject, isPending } = useCreateProject();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject(
      { title, description, progress: 0, status: "active" },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          onClose();
        },
        onError: () => {
          // Intentional failure gracefully handled or ignored in UI for now
          // In a real app we'd toast this.
          onClose();
        }
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Initialize a new workspace for your team."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Project Title</label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Marketing Campaign"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Description</label>
          <textarea
            required
            className="flex w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 resize-none h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
