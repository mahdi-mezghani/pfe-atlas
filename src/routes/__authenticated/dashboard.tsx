import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractPdfText } from "@/lib/pdf";
import { processDocument, semanticSearch } from "@/lib/documents.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Sparkles, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { validatePdfFile, hasPdfMagicBytes, sanitizeFileName, MAX_RAW_TEXT_CHARS } from "@/lib/validation";


export const Route = createFileRoute("/__authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Library — PFE Atlas" },
      { name: "description", content: "Browse, filter, and semantically search every uploaded PFE report." },
    ],
  }),
  component: Dashboard,
});

type Doc = {
  id: string;
  file_name: string;
  storage_path?: string;
  title: string | null;
  authors: string[] | null;
  supervisor: string | null;
  field: string | null;
  difficulty: string | null;
  summary: string | null;
  status: string;
  error: string | null;
  created_at: string;
  technologies?: { name: string }[];
};

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function Dashboard() {
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<{ id: string; similarity: number; excerpt: string }[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [techFilter, setTechFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);

  const processFn = useServerFn(processDocument);
  const searchFn = useServerFn(semanticSearch);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*, technologies(name)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else {
      const loadedDocs = (data ?? []) as Doc[];
      const staleBefore = Date.now() - 5 * 60 * 1000;
      const staleIds = loadedDocs
        .filter((doc) => doc.status === "extracting" && Date.parse(doc.updated_at) < staleBefore)
        .map((doc) => doc.id);

      if (staleIds.length) {
        const { error: recoveryError } = await supabase
          .from("documents")
          .update({ status: "failed", error: "Processing stopped before completion. Please upload the report again." })
          .in("id", staleIds);
        if (recoveryError) toast.error(`Could not recover stuck report: ${recoveryError.message}`);
        else {
          for (const doc of loadedDocs) {
            if (staleIds.includes(doc.id)) {
              doc.status = "failed";
              doc.error = "Processing stopped before completion. Please upload the report again.";
            }
          }
        }
      }
      setDocs(loadedDocs);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("docs")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const upload = async (file: File) => {
    const check = validatePdfFile(file);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    if (!(await hasPdfMagicBytes(file))) {
      toast.error("That file is not a valid PDF.");
      return;
    }

    setUploading(true);
    let createdDocumentId: string | null = null;
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("Your session expired. Please sign in again.");
      const uid = userRes.user.id;
      const safeName = sanitizeFileName(file.name);
      const path = `${uid}/${crypto.randomUUID()}-${safeName}`;

      setProgress("Uploading PDF…");
      const { error: upErr } = await supabase.storage
        .from("pfe-reports")
        .upload(path, file, { contentType: "application/pdf", upsert: false });
      if (upErr) throw upErr;

      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .insert({ uploader_id: uid, file_name: safeName, storage_path: path, status: "extracting" })
        .select()
        .single();
      if (docErr) throw docErr;
      createdDocumentId = doc.id;

      setProgress("Extracting text from PDF…");
      const text = (
        await withTimeout(extractPdfText(file), 60_000, "PDF text extraction timed out. Try a smaller or text-based PDF.")
      ).slice(0, MAX_RAW_TEXT_CHARS);
      if (text.length < 100) throw new Error("Could not extract enough text from this PDF.");

      setProgress("Analyzing with AI (metadata, summary, embeddings)…");
      await withTimeout(
        processFn({ data: { documentId: doc.id, rawText: text } }),
        120_000,
        "Report analysis timed out. Please try uploading it again.",
      );
      toast.success("Report analyzed");
    } catch (e: unknown) {
      if (createdDocumentId) {
        const { error: statusError } = await supabase
          .from("documents")
          .update({ status: "failed", error: "Processing failed. Please try uploading the report again." })
          .eq("id", createdDocumentId);
        if (statusError) toast.error(`Could not update report status: ${statusError.message}`);
        setDocs((current) =>
          current.map((doc) =>
            doc.id === createdDocumentId
              ? { ...doc, status: "failed", error: "Processing failed. Please try uploading the report again." }
              : doc,
          ),
        );
      }
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(null);
      load();
    }
  };


  const runSemantic = async () => {
    if (!query.trim()) {
      setSemanticResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await searchFn({ data: { query } });
      setSemanticResults(res as { id: string; similarity: number; excerpt: string }[]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      const doc = docs.find((item) => item.id === id);
      if (!doc) throw new Error("Report not found");

      if (doc.storage_path) {
        const { error: storageError } = await supabase.storage.from("pfe-reports").remove([doc.storage_path]);
        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase.from("documents").delete().eq("id", id);
      if (deleteError) throw deleteError;
      toast.success("Deleted");
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const allTech = useMemo(() => {
    const set = new Map<string, number>();
    docs.forEach((d) => d.technologies?.forEach((t) => set.set(t.name, (set.get(t.name) ?? 0) + 1)));
    return Array.from(set.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [docs]);

  const allFields = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => d.field && set.add(d.field));
    return Array.from(set);
  }, [docs]);

  const filtered = useMemo(() => {
    let list = docs;
    if (semanticResults) {
      const ids = new Set(semanticResults.map((r) => r.id));
      list = docs
        .filter((d) => ids.has(d.id))
        .sort((a, b) => {
          const ai = semanticResults.findIndex((r) => r.id === a.id);
          const bi = semanticResults.findIndex((r) => r.id === b.id);
          return ai - bi;
        });
    } else if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.file_name.toLowerCase().includes(q) ||
          d.summary?.toLowerCase().includes(q) ||
          d.technologies?.some((t) => t.name.toLowerCase().includes(q)),
      );
    }
    if (techFilter) list = list.filter((d) => d.technologies?.some((t) => t.name === techFilter));
    if (fieldFilter) list = list.filter((d) => d.field === fieldFilter);
    return list;
  }, [docs, query, semanticResults, techFilter, fieldFilter]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Your PFE Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload reports — AI extracts title, authors, tech, summary, and builds a semantic index.
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <span className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? progress ?? "Working…" : "Upload PDF"}
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title, tech, keyword…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSemanticResults(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && runSemantic()}
            />
          </div>
          <Button onClick={runSemantic} disabled={searching || !query.trim()} variant="secondary">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Semantic search
          </Button>
          <Button asChild variant="outline">
            <Link to="/ask" search={{ documentId: undefined }}>Ask a question</Link>
          </Button>
        </div>

        {(allTech.length > 0 || allFields.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allFields.map((f) => (
              <button
                key={f}
                onClick={() => setFieldFilter(fieldFilter === f ? null : f)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  fieldFilter === f ? "border-accent bg-accent/20 text-accent-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="mx-1 self-center text-border">·</span>
            {allTech.map(([name, count]) => (
              <button
                key={name}
                onClick={() => setTechFilter(techFilter === name ? null : name)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  techFilter === name ? "border-accent bg-accent/20 text-accent-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {name} · {count}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading library…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No reports yet. Upload a PDF to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((d) => (
              <article key={d.id} className="group relative rounded-2xl border border-border/60 bg-card p-5 transition hover:border-accent/50">
                <div className="flex items-start justify-between gap-2">
                  <Link to="/document/$id" params={{ id: d.id }} className="flex-1 space-y-1">
                    <h3 className="font-serif text-lg leading-snug">{d.title || d.file_name}</h3>
                    {d.authors?.length ? (
                      <p className="text-xs text-muted-foreground">{d.authors.join(", ")}{d.supervisor ? ` · Supervised by ${d.supervisor}` : ""}</p>
                    ) : null}
                  </Link>
                  <button onClick={() => del(d.id)} className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {d.status === "ready" ? (
                  <>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{d.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.field && <Badge variant="secondary">{d.field}</Badge>}
                      {d.difficulty && <Badge variant="outline">{d.difficulty}</Badge>}
                      {d.technologies?.slice(0, 5).map((t) => (
                        <Badge key={t.name} className="bg-accent/15 text-accent-foreground hover:bg-accent/25">{t.name}</Badge>
                      ))}
                    </div>
                  </>
                ) : d.status === "failed" ? (
                  <p className="mt-3 text-sm text-destructive">Failed: {d.error}</p>
                ) : (
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> {d.status}…</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
