import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, MessageSquare } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type MetadataReview = {
  source: "ai" | "unavailable" | "fallback" | "deterministic" | "partial";
  summary_source?: "ai" | "deterministic";
  issues: string[];
};

function isMetadataReview(value: unknown): value is MetadataReview {
  if (!value || typeof value !== "object") return false;
  const review = value as Record<string, unknown>;
  return (review.source === "ai" || review.source === "unavailable" || review.source === "fallback" || review.source === "deterministic" || review.source === "partial") &&
    (review.summary_source === undefined || review.summary_source === "ai" || review.summary_source === "deterministic") &&
    Array.isArray(review.issues) &&
    review.issues.every((issue) => typeof issue === "string");
}

export const Route = createFileRoute("/__authenticated/document/$id")({
  component: DocPage,
});

function DocPage() {
  const { id } = useParams({ from: "/__authenticated/document/$id" });
  type DocumentDetail = Tables<"documents"> & {
    technologies: Pick<Tables<"technologies">, "name">[] | null;
    keywords: Pick<Tables<"keywords">, "keyword">[] | null;
  };
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("documents")
        .select("*, technologies(name), keywords(keyword)")
        .eq("id", id)
        .single();
      setDoc(data);
      if (data?.storage_path) {
        const { data: signed } = await supabase.storage.from("pfe-reports").createSignedUrl(data.storage_path, 3600);
        setDownloadUrl(signed?.signedUrl ?? null);
      }
    })();
  }, [id]);

  if (!doc) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  const metadataReview = isMetadataReview(doc.metadata_review) ? doc.metadata_review : null;

  return (
    <article className="space-y-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <header className="space-y-3">
        <h1 className="font-serif text-4xl leading-tight">{doc.title || doc.file_name}</h1>
        {doc.authors?.length ? <p className="text-muted-foreground">{doc.authors.join(", ")}</p> : null}
        {doc.supervisor ? <p className="text-sm text-muted-foreground">Supervisor: {doc.supervisor}</p> : null}
        <div className="flex flex-wrap gap-2 pt-2">
          {doc.field && <Badge variant="secondary">{doc.field}</Badge>}
          {doc.difficulty && <Badge variant="outline">{doc.difficulty}</Badge>}
        </div>
      </header>

      {doc.status === "ready" && metadataReview && (
        <aside role="status" className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium">
            {metadataReview.source === "deterministic"
              ? "Model metadata failed validation; verbatim PDF values are shown where available."
              : metadataReview.source === "partial"
                ? "Some model fields failed validation; accepted AI values are kept and explicit PDF values fill missing fields."
              : metadataReview.source === "unavailable"
              ? "Metadata extraction failed; no substitute values were added."
              : metadataReview.source === "fallback"
                ? "This older report contains heuristic fallback values."
                : "Review these metadata fields:"}
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {metadataReview.issues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </aside>
      )}
      {doc.status === "ready" && doc.error && !metadataReview && (
        <p role="status" className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          Metadata needs review. This older report does not have field-level review details.
        </p>
      )}

      <section className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/ask" search={{ documentId: id } as never}><MessageSquare className="h-4 w-4" /> Ask about this report</Link>
        </Button>
        {downloadUrl && (
          <Button asChild variant="ghost">
            <a href={downloadUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /> Original PDF</a>
          </Button>
        )}
      </section>

      {doc.summary && (
        <section className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="mb-3 font-serif text-xl">
            {metadataReview?.source === "deterministic" ||
            (metadataReview?.source === "partial" && metadataReview.summary_source === "deterministic")
              ? "Verbatim abstract"
              : "Report overview"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{doc.summary}</p>
        </section>
      )}

      {doc.technologies && doc.technologies.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {doc.technologies.map((t) => (
              <Badge key={t.name} className="bg-accent/15 text-accent-foreground hover:bg-accent/25">{t.name}</Badge>
            ))}
          </div>
        </section>
      )}

      {doc.keywords && doc.keywords.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {doc.keywords.map((k) => (
              <Badge key={k.keyword} variant="outline">{k.keyword}</Badge>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
