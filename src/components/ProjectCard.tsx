import { MoreHorizontal, Clock, ArrowRight } from "lucide-react";
import { type Project } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const statusColors = {
    active: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-success/10 text-success border-success/20",
    archived: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Link 
      href={`/projects/${project.id}`}
      className="group block bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider", statusColors[project.status])}>
          {project.status}
        </span>
      </div>

      <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
        {project.description}
      </p>

      <div className="mt-auto">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-primary transition-all" />
      </div>
    </Link>
  );
}
