import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { signInSchema, signUpSchema } from "@/lib/validation";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — PFE Atlas" },
      { name: "description", content: "Sign in to search and analyze PFE reports with AI." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    const finalizeAuth = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          window.history.replaceState({}, "", window.location.pathname);
          navigate({ to: "/dashboard" });
          return;
        }

        const hash = window.location.hash.replace(/^#/, "");
        if (!hash.includes("access_token=") || !hash.includes("refresh_token=")) return;

        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (!accessToken || !refreshToken) return;

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;

        window.history.replaceState({}, "", window.location.pathname);
        navigate({ to: "/dashboard" });
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Could not finish sign-in");
      } finally {
        setLoading(false);
      }
    };

    void finalizeAuth();
  }, [navigate]);

  const getAuthErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes("email not confirmed") || message.includes("email_not_confirmed")) {
        return "Please confirm your email before signing in. Check your inbox or spam folder.";
      }
      if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
        return "Email or password is incorrect.";
      }
      return error.message;
    }
    return "Something went wrong";
  };

  const resendConfirmation = async () => {
    if (!email) {
      toast.error("Enter your email address to resend confirmation.");
      return;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      toast.success("Confirmation email resent. Check your inbox or spam folder.");
    } catch (e: unknown) {
      toast.error(getAuthErrorMessage(e));
    } finally {
      setResendLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = (mode === "signin" ? signInSchema : signUpSchema).safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    try {
      const creds = { email: parsed.data.email, password: parsed.data.password };
      const { data, error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword(creds)
          : await supabase.auth.signUp({
              ...creds,
              options: { emailRedirectTo: `${window.location.origin}/auth` },
            });
      if (error) throw error;
      if (mode === "signup" && !data?.session) {
        toast.success("Check your email to confirm your account. If you don’t see it, check spam or whitelist the sender.");
        setMode("signin");
        setShowResendButton(true);
        return;
      }
      toast.success(mode === "signin" ? "Welcome back" : "Account created");
      navigate({ to: "/dashboard" });
    } catch (e: unknown) {
      toast.error(getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const redirectUri = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUri },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <Link to="/" className="flex items-center justify-center gap-2 font-serif text-2xl">
          <BookOpen className="h-6 w-6 text-accent" />
          PFE Atlas
        </Link>
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-lg">
          <h1 className="mb-1 font-serif text-2xl">{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signin" ? "Access your PFE library." : "Start analyzing reports with AI."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={mode === "signup" ? 8 : 1} maxLength={72} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">At least 8 characters, with an uppercase letter, a lowercase letter, and a number.</p>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <div className="relative my-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
            <span className="relative bg-card px-3">or</span>
            <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>
          {showResendButton && (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={resendConfirmation}
              disabled={resendLoading}
            >
              {resendLoading ? "Resending…" : "Resend confirmation email"}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
