import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderKanban, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-72 bg-card border-r border-border/50 hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-display font-bold text-xl">N</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tight">Nexus</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  !isActive && "group-hover:scale-110"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border/50">
        <button className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
