import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

// Shared schemas for the frontend
export const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  status: z.enum(["active", "completed", "archived"]),
  progress: z.coerce.number().min(0).max(100),
  createdAt: z.coerce.date(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = Omit<Project, "id" | "createdAt">;

const API_BASE = "/api/projects";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useProjects() {
  return useQuery({
    queryKey: [API_BASE],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch projects. API endpoint may be missing.");
      const data = await res.json();
      return parseWithLogging(z.array(projectSchema), data, "projects.list");
    },
    retry: 1, // Don't retry infinitely if endpoint is missing
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProjectInput) => {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const result = await res.json();
      return parseWithLogging(projectSchema, result, "projects.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Project["status"] }) => {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const result = await res.json();
      return parseWithLogging(projectSchema, result, "projects.updateStatus");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}
