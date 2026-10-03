import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askQuestion } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/__authenticated/ask")({
  validateSearch: (s: Record<string, unknown>) => ({ documentId: typeof s.documentId === "string" ? s.documentId : undefined }),
  head: () => ({
    meta: [
      { title: "Ask — PFE Atlas" },
      { name: "description", content: "Ask any question and get grounded answers with citations from your PFE library." },
    ],
  }),
  component: AskPage,
});

type Turn = {
  q: string;
  a?: string;
  model?: string;
  sources?: { n: number; title: string; documentId: string; excerpt: string; similarity: number }[];
  loading?: boolean;
};

function AskPage() {
  const { documentId } = Route.useSearch();
  const askFn = useServerFn(askQuestion);
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const submit = async () => {
    const q = question.trim();
    if (!q) return;
    setQuestion("");
    const idx = turns.length;
    setTurns((t) => [...t, { q, loading: true }]);
    try {
      const res = await askFn({ data: { question: q, documentId } });
      if (!res || typeof res.answer !== "string") {
        throw new Error("The chatbot could not return an answer. Please try again.");
      }
      setTurns((t) => t.map((x, i) => (i === idx ? { q, a: res.answer, model: res.model ?? undefined, sources: res.sources } : x)));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setTurns((t) => t.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Ask your library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {documentId ? "Answers are drawn from this single report." : "Answers are drawn from every uploaded report, with citations."}
        </p>
      </header>

      <div className="space-y-6">
        {turns.map((t, i) => (
          <div key={i} className="space-y-3">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-sm font-medium text-secondary-foreground">{t.q}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              {t.loading ? (
                <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</p>
              ) : (
                <>
                  <p className="whitespace-pre-wrap leading-relaxed">{t.a}</p>
                  {t.model && <p className="mt-3 text-xs text-muted-foreground">Answered by {t.model}</p>}
                  {t.sources && t.sources.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Sources</p>
                      {t.sources.map((s) => (
                        <div key={s.n} className="text-xs">
                          <span className="text-accent">[{s.n}]</span> <span className="font-medium">{s.title}</span>{" "}
                          <span className="text-muted-foreground">— {s.excerpt}…</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 rounded-2xl border border-border/60 bg-card p-3 shadow-lg">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which projects used TensorFlow for medical imaging?"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={submit} disabled={!question.trim()}>
            <Sparkles className="h-4 w-4" /> Ask
          </Button>
        </div>
      </div>
    </div>
  );
}
