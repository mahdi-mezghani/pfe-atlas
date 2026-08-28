import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/smtp")({
  head: () => ({
    meta: [
      { title: "SMTP Setup — PFE Atlas" },
      {
        name: "description",
        content: "Configure SMTP settings for Supabase email delivery.",
      },
    ],
  }),
  component: SmtpPage,
});

function SmtpPage() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("PFE Atlas");
  const [secure, setSecure] = useState(false);

  const configJson = useMemo(
    () =>
      JSON.stringify(
        {
          smtp_host: host,
          smtp_port: port ? Number(port) : undefined,
          smtp_username: username,
          smtp_password: password,
          smtp_sender_email: fromEmail,
          smtp_sender_name: fromName,
          smtp_ssl: secure,
        },
        null,
        2,
      ),
    [host, port, username, password, fromEmail, fromName, secure],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configJson);
      toast.success("SMTP config copied to clipboard");
    } catch {
      toast.error("Unable to copy config. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl space-y-8">
        <Link to="/" className="flex items-center justify-center gap-2 font-serif text-2xl">
          <BookOpen className="h-6 w-6 text-accent" />
          PFE Atlas
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-lg">
          <h1 className="mb-1 font-serif text-2xl">Supabase SMTP setup</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your SMTP provider details and copy the generated config for Supabase Authentication email settings.
          </p>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP host</Label>
              <Input
                id="smtp-host"
                value={host}
                onChange={(event) => setHost(event.target.value)}
                placeholder="smtp.example.com"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={port}
                  onChange={(event) => setPort(event.target.value)}
                  placeholder="587"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-secure">TLS / SSL</Label>
                <select
                  id="smtp-secure"
                  className="flex h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none"
                  value={secure ? "true" : "false"}
                  onChange={(event) => setSecure(event.target.value === "true")}
                >
                  <option value="false">StartTLS / no SSL</option>
                  <option value="true">SSL/TLS</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">Username</Label>
                <Input
                  id="smtp-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-from-email">From email</Label>
                <Input
                  id="smtp-from-email"
                  type="email"
                  value={fromEmail}
                  onChange={(event) => setFromEmail(event.target.value)}
                  placeholder="no-reply@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-from-name">From name</Label>
                <Input
                  id="smtp-from-name"
                  value={fromName}
                  onChange={(event) => setFromName(event.target.value)}
                  placeholder="PFE Atlas"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Generated SMTP payload</Label>
              <textarea
                readOnly
                className="h-44 w-full rounded-2xl border border-border/60 bg-background p-4 text-sm text-foreground outline-none"
                value={configJson}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto" onClick={handleCopy}>
                Copy SMTP config
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() =>
                  toast(
                    "Open Supabase Authentication → Settings → Email and paste these values.",
                  )
                }
              >
                Setup instructions
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/70 bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Supabase SMTP checklist</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>Use a verified sender email that matches your SMTP provider.</li>
              <li>Enable TLS/SSL if required by your provider.</li>
              <li>Set <code>From email</code> to the address you want users to receive mail from.</li>
              <li>Save and test email delivery in Supabase Auth settings.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
