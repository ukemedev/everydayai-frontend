import { useHealthCheck } from "@workspace/api-client-react";
import { Bell, Search, Activity } from "lucide-react";
import { Input } from "./ui/Input";

export function Header() {
  const { data: health, isError } = useHealthCheck();

  const isHealthy = health?.status === "ok";

  return (
    <header className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="max-w-md w-full relative group">
        <Input 
          placeholder="Search projects, tasks..." 
          icon={<Search className="w-4 h-4" />}
          className="bg-secondary/50 border-transparent focus-visible:bg-background"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
          <div className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? 'bg-success' : 'bg-destructive'}`}></span>
          </div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {isHealthy ? "API Online" : "API Offline"}
          </span>
        </div>

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
        </button>
        
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-border/50 shadow-sm cursor-pointer hover:border-primary transition-colors">
          <img 
            src={`${import.meta.env.BASE_URL}images/avatar.png`} 
            alt="User avatar" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
