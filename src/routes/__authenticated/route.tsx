import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogOut, MessageSquare, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/__authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (error || !user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-serif text-xl tracking-tight">
            <BookOpen className="h-5 w-5 text-accent" />
            <span>PFE Atlas</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-foreground [&.active]:bg-accent/10 [&.active]:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" /> Library
            </Link>
            <Link
              to="/ask"
              search={{ documentId: undefined }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-foreground [&.active]:bg-accent/10 [&.active]:text-foreground"
            >
              <MessageSquare className="h-4 w-4" /> Ask
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
