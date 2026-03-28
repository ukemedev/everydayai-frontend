import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { FileX2 } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mb-8 rotate-12 shadow-xl shadow-black/5">
          <FileX2 className="w-12 h-12 text-muted-foreground -rotate-12" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">Page not found</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="inline-block">
          <Button size="lg">Return to Dashboard</Button>
        </Link>
      </div>
    </Layout>
  );
}
