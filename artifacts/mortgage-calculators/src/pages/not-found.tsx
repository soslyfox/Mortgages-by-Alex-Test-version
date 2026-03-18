import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold">Page Not Found</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button size="lg">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
