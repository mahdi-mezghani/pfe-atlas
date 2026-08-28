import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/__authenticated/document/$id")({
  component: DocPage,
});

function DocPage() {
  const { id } = useParams({ from: "/__authenticated/document/$id" });
  const [doc, setDoc] = useState<any>(null);
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
          <h2 className="mb-3 font-serif text-xl">Summary</h2>
          <p className="text-muted-foreground leading-relaxed">{doc.summary}</p>
        </section>
      )}

      {doc.technologies?.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Technologies</h2>
          <div className="flex flex-wrap gap-2">
            {doc.technologies.map((t: any) => (
              <Badge key={t.name} className="bg-accent/15 text-accent-foreground hover:bg-accent/25">{t.name}</Badge>
            ))}
          </div>
        </section>
      )}

      {doc.keywords?.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {doc.keywords.map((k: any) => (
              <Badge key={k.keyword} variant="outline">{k.keyword}</Badge>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
