import React from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { useProjects } from "@/hooks/use-projects";
import { Plus, AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { data: projects, isLoading, isError, refetch } = useProjects();

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="relative rounded-3xl overflow-hidden bg-foreground text-background p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img 
              src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
              alt="Banner background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Welcome back, Creator.
            </h1>
            <p className="text-lg text-background/80 mb-8 max-w-lg">
              You have 3 active projects this week. Keep up the great momentum and track your progress below.
            </p>
            <Button size="lg" variant="glass" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">Recent Projects</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-border/50 bg-card"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">API Connection Missing</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              The projects backend endpoint is not yet implemented. This UI gracefully handles the failure state to showcase the interface design.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              Simulate Create
            </Button>
          </motion.div>
        ) : projects?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-border/50 bg-card">
            <div className="w-16 h-16 rounded-2xl bg-secondary text-muted-foreground flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Get started by creating your first project workspace.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Layout>
  );
}
