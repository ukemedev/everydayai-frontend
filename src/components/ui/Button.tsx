import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "glass";
  size?: "sm" | "default" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 hover:-translate-y-0.5",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border-2 border-border bg-transparent hover:bg-secondary/50 hover:border-primary/30 text-foreground",
      ghost: "bg-transparent hover:bg-secondary/60 text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20",
      glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 shadow-xl",
    };

    const sizes = {
      default: "h-11 px-5 py-2.5",
      sm: "h-9 px-4 text-sm",
      lg: "h-14 px-8 text-lg",
      icon: "h-11 w-11 p-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
