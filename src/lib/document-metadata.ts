import { cleanText } from "./chunk.ts";

export const METADATA_FIELDS = [
  "",
  "AI",
  "Cybersecurity",
  "Data Science",
  "Networking",
  "IoT",
  "Mobile Development",
  "Web Development",
  "Software Engineering",
  "Embedded Systems",
  "Robotics",
  "Other",
] as const;

export const METADATA_DIFFICULTIES = ["", "Easy", "Medium", "Hard"] as const;

export type MetadataParseResult =
  | { ok: true; candidate: Partial<Record<string, unknown>> }
  | { ok: false; reason: "invalid_json" | "invalid_shape"; detail: string };

export function parseMetadataCandidate(value: string): MetadataParseResult {
  const normalized = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch (error) {
    return {
      ok: false,
      reason: "invalid_json",
      detail: error instanceof Error ? error.message.slice(0, 250) : "JSON parsing failed.",
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, reason: "invalid_shape", detail: "The top-level JSON value must be an object." };
  }

  const candidate = parsed as Record<string, unknown>;
  const stringFields = ["title", "supervisor", "field", "difficulty", "summary"];
  const listFields = ["authors", "technologies", "keywords"];
  const invalidFields = [
    ...stringFields.filter((field) => typeof candidate[field] !== "string"),
    ...listFields.filter((field) =>
      !Array.isArray(candidate[field]) || !(candidate[field] as unknown[]).every((item) => typeof item === "string"),
    ),
    ...Object.keys(candidate).filter((field) => !stringFields.includes(field) && !listFields.includes(field)),
  ];

  if (invalidFields.length > 0) {
    return {
      ok: false,
      reason: "invalid_shape",
      detail: `Schema mismatch; invalid, missing, or unexpected fields: ${invalidFields.join(", ")}.`,
    };
  }

  return { ok: true, candidate };
}

export function extractAbstractText(rawText: string): { text: string; language: "French" | "English" } | null {
  const pages = cleanText(rawText).split(/\n\s*\n+/);
  const abstractHeading = /^\s*(résumé|resume|abstract|executive summary|synthèse|synthese)\s*[:-]?\s*(.*)$/i;
  const sectionEnd = /^\s*(mots[- ]clés?|keywords?|abstract|résumé|resume|table des matières|table of contents|sommaire|introduction|chapitre\s+\d+)/i;

  for (const page of pages) {
    const lines = page.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const heading = abstractHeading.exec(lines[index]);
      if (!heading) continue;

      const sectionLines = heading[2].trim() ? [heading[2].trim()] : [];
      for (const line of lines.slice(index + 1)) {
        if (sectionEnd.test(line)) break;
        if (line.trim()) sectionLines.push(line.trim());
      }
      const abstract = sectionLines.join(" ").replace(/\s+/g, " ").trim();
      if (abstract.length >= 80) {
        const frenchHeading = /^(résumé|resume|synthèse|synthese)$/i.test(heading[1]);
        return { text: abstract.slice(0, 5000), language: frenchHeading ? "French" : "English" };
      }
    }
  }
  return null;
}

function firstLabeledValue(lines: string[], labels: RegExp): string | null {
  for (const line of lines) {
    const match = labels.exec(line);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

function firstLabeledListValue(lines: string[], labels: RegExp): string | null {
  for (let index = 0; index < lines.length; index += 1) {
    const match = labels.exec(lines[index]);
    if (!match?.[1]?.trim()) continue;

    let value = match[1].trim();
    let nextLine = index + 1;
    while (/[;,|]\s*$/.test(value)) {
      const continuation = lines[nextLine]?.trim();
      if (!continuation || /^(?:abstract|résumé|resume|mots[- ]clés?|keywords?|table des matières|table of contents|sommaire|introduction|chapitre\s+\d+)/i.test(continuation)) {
        break;
      }
      value += ` ${continuation}`;
      nextLine += 1;
    }
    return value;
  }
  return null;
}

function splitExplicitList(value: string | null): string[] {
  if (!value) return [];
  const items = value
    .replace(/\s+(?:et|and)\s+(?=[^,;|]+$)/i, ", ")
    .split(/[,;|]/)
    .map((item) => item.trim().replace(/[.;:]+$/, ""))
    .filter(Boolean);
  return Array.from(new Set(items));
}

function extractTechnologyTableValues(lines: string[]): string[] {
  const tableHeader = /^(?:technologie|technologies|technology|technologies)\s+(?:rôle|role|utilisation|usage)$/i;
  const roleStart = /\s+(?=(?:développement|development|transformation|manipulation|stockage|storage|conteneurisation|containerization|gestion|management|analyse|analysis|interface|orchestration|machine learning|modèle|model|api(?:\s|$)|utilisation|usage|prédiction|prediction)\b)/i;
  const values: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!tableHeader.test(lines[index].trim())) continue;

    for (const line of lines.slice(index + 1)) {
      const row = line.trim();
      if (!row || /^(?:chapitre|chapter)\s+\d+\b|^\d+(?:\.\d+)*\s+\S/i.test(row)) break;
      const roleBoundary = roleStart.exec(row);
      if (!roleBoundary || roleBoundary.index === 0) continue;
      const technology = row.slice(0, roleBoundary.index).trim().replace(/[,:;]+$/, "");
      if (technology) values.push(technology);
    }
  }

  return values;
}

export function extractDeterministicMetadata(rawText: string) {
  const pages = cleanText(rawText).split(/\n\s*\n+/);
  const reportLines = cleanText(rawText).split(/\r?\n/);
  const coverLines = (pages[0] ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const reportHeadingIndex = coverLines.findIndex((line) =>
    /^(?:rapport|report|mémoire|memoire|thesis|final year project|pfe report)\b/i.test(line) &&
    !/\bpage\s*\d+\b/i.test(line),
  );
  const metadataLabel = /^(?:présenté|presente|prepared|réalisé|realise|author|auteur|formation|filière|filiere|établissement|etablissement|organisme|encadrant|encadré|encadree|supervisor|academic year|année universitaire|annee universitaire)(?=\s|:|-|$)/i;
  const titleLines: string[] = [];
  if (reportHeadingIndex >= 0) {
    for (const line of coverLines.slice(reportHeadingIndex + 1)) {
      if (metadataLabel.test(line)) break;
      titleLines.push(line);
    }
  }
  const proposedTitle = titleLines.join(" ").replace(/\s+/g, " ").trim();
  const title = proposedTitle.length <= 200 && proposedTitle.split(/\s+/).length <= 24
    ? proposedTitle || null
    : null;

  const authorsValue = firstLabeledValue(
    coverLines,
    /^(?:présenté par|presente par|prepared by|authors?|auteurs?)\s*[:-]?\s*(.+)$/i,
  );
  const supervisor = firstLabeledValue(
    coverLines,
    /^(?:supervisor|supervised by|encadrant(?:e)?(?:\s+universitaire)?|encadré par|encadree par|directeur|tuteur|tutor|mentor)\s*[:-]?\s*(.+)$/i,
  );
  const fieldValue = firstLabeledValue(
    reportLines,
    /^(?:field|domain|domaine|specialty|spécialité)\s*[:-]\s*(.+)$/i,
  );
  const difficultyValue = firstLabeledValue(
    reportLines,
    /^(?:difficulty|complexité|complexity)\s*[:-]\s*(.+)$/i,
  );
  const technologyValue = firstLabeledListValue(
    reportLines,
    /^(?:technologies?|tools|outils)\s*[:-]\s*(.+)$/i,
  );
  const keywordValue = firstLabeledListValue(
    reportLines,
    /^\s*(?:mots[- ]clés?|keywords?)\s*[:-]\s*(.+)$/i,
  );
  const field = METADATA_FIELDS.find((value) => value && value.toLocaleLowerCase() === fieldValue?.toLocaleLowerCase()) ?? null;
  const difficulty = METADATA_DIFFICULTIES.find((value) => value && value.toLocaleLowerCase() === difficultyValue?.toLocaleLowerCase()) ?? null;
  const abstract = extractAbstractText(rawText);
  const technologies = Array.from(new Set([
    ...splitExplicitList(technologyValue),
    ...extractTechnologyTableValues(reportLines),
  ]));
  const keywords = splitExplicitList(keywordValue);

  return {
    title,
    authors: splitExplicitList(authorsValue),
    supervisor,
    field,
    difficulty,
    summary: abstract?.text ?? null,
    technologies,
    keywords: filterTechnologyKeywords(keywords, technologies),
  };
}

export function filterTechnologyKeywords(keywords: string[], technologies: string[]): string[] {
  const technologySet = new Set(technologies.map((technology) => technology.trim().toLocaleLowerCase()));
  return keywords.filter((keyword) => !technologySet.has(keyword.trim().toLocaleLowerCase()));
}

export type NormalizedMetadata = {
  title: string | null;
  authors: string[];
  supervisor: string | null;
  field: string | null;
  difficulty: string | null;
  summary: string | null;
  technologies: string[];
  keywords: string[];
  reviewIssues: string[];
};

export function fillMetadataGaps(
  validated: NormalizedMetadata | null,
  fallback: Omit<NormalizedMetadata, "reviewIssues">,
): NormalizedMetadata {
  if (!validated) return { ...fallback, reviewIssues: [] };

  return {
    title: validated.title ?? fallback.title,
    authors: validated.authors.length > 0 ? validated.authors : fallback.authors,
    supervisor: validated.supervisor ?? fallback.supervisor,
    field: validated.field ?? fallback.field,
    difficulty: validated.difficulty ?? fallback.difficulty,
    summary: validated.summary ?? fallback.summary,
    technologies: validated.technologies.length > 0 ? validated.technologies : fallback.technologies,
    keywords: validated.keywords.length > 0 ? validated.keywords : fallback.keywords,
    reviewIssues: validated.reviewIssues,
  };
}

function isLikelyTitle(value: string): boolean {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean || clean.length > 200) return false;
  if (/^(?:rapport|report|mémoire|memoire|thesis|final year project)\b/i.test(clean)) return false;
  if (/\b(university|université|faculty|faculté|institute|institut|ministry|department|département|academic year|année universitaire|presented by|présenté par|prepared by|supervised by|réalisé par|encadré par)\b/i.test(clean)) return false;
  if (/(^|\s)(page|chapter|section|figure|table|abstract|résumé|resume|introduction|conclusion|methodology|results|appendix|bibliography)\b/i.test(clean)) return false;
  if (/(?:[.!?]{2,}|\.{3,})/.test(clean)) return false;
  return clean.split(/\s+/).length <= 24;
}

function isLikelySummary(value: string): boolean {
  const clean = value.replace(/\s+/g, " ").trim();
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  const sentenceCount = clean.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  return wordCount >= 100 && wordCount <= 220 && clean.length <= 2000 && sentenceCount >= 4 && sentenceCount <= 7;
}

function titleMatchesCover(candidate: string, rawText: string): boolean {
  const normalize = (value: string) => value
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const lines = (cleanText(rawText).split(/\n\s*\n+/)[0] ?? "")
    .split(/\r?\n/)
    .map(normalize)
    .filter(Boolean);
  const title = normalize(candidate);

  for (let start = 0; start < lines.length; start += 1) {
    for (let count = 1; count <= 5 && start + count <= lines.length; count += 1) {
      if (lines.slice(start, start + count).join(" ") === title) return true;
    }
  }
  return false;
}

export function normalizeMetadata(
  rawText: string,
  candidate: Partial<Record<string, unknown>> | null | undefined,
  explicitKeywords: string[] = [],
): NormalizedMetadata {
  const reviewIssues: string[] = [];
  const normalizedReport = rawText.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
  const normalizeEvidence = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const hasEvidence = (value: string) => {
    const normalizedValue = normalizeEvidence(value);
    return normalizedValue.length > 0 && normalizedReport.includes(normalizedValue);
  };
  const parseStringList = (value: unknown, field: string): string[] => {
    if (!Array.isArray(value)) {
      if (value !== undefined) reviewIssues.push(`${field} — invalid value type; no value was accepted.`);
      return [];
    }
    if (value.some((item) => typeof item !== "string")) {
      reviewIssues.push(`${field} — some values were not text and were rejected.`);
    }
    return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  };
  const normalizeList = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));

  const candidateTitle = typeof candidate?.title === "string" ? candidate.title.trim() : "";
  const titleIsValid = isLikelyTitle(candidateTitle) && titleMatchesCover(candidateTitle, rawText);
  const candidateSummary = typeof candidate?.summary === "string" ? candidate.summary.trim() : "";
  const summaryIsValid = isLikelySummary(candidateSummary);
  const candidateAuthors = parseStringList(candidate?.authors, "Authors");
  const candidateTechnologies = parseStringList(candidate?.technologies, "Technologies");
  const candidateKeywords = explicitKeywords.length > 0
    ? explicitKeywords
    : parseStringList(candidate?.keywords, "Keywords");
  const authors = normalizeList(candidateAuthors.filter(hasEvidence));
  const technologies = normalizeList(candidateTechnologies.filter(hasEvidence));
  const keywords = filterTechnologyKeywords(normalizeList(candidateKeywords.filter(hasEvidence)), technologies);
  const candidateSupervisor = typeof candidate?.supervisor === "string" ? candidate.supervisor.trim() : "";
  const supervisorIsValid = Boolean(candidateSupervisor) && hasEvidence(candidateSupervisor);
  const candidateField = typeof candidate?.field === "string" ? candidate.field.trim() : "";
  const candidateDifficulty = typeof candidate?.difficulty === "string" ? candidate.difficulty.trim() : "";
  const fieldIsValid = METADATA_FIELDS.includes(candidateField as (typeof METADATA_FIELDS)[number]) && Boolean(candidateField);
  const difficultyIsValid = METADATA_DIFFICULTIES.includes(candidateDifficulty as (typeof METADATA_DIFFICULTIES)[number]) && Boolean(candidateDifficulty);

  if (!titleIsValid) reviewIssues.push("Title — the proposed title was not verified against the cover; no title was stored.");
  if (!summaryIsValid) {
    reviewIssues.push("Summary — the overview did not meet the required length or sentence-count checks; no summary was stored.");
  }
  if (candidateAuthors.some((author) => !hasEvidence(author))) {
    reviewIssues.push("Authors — one or more proposed names were not found in the report and were rejected.");
  }
  if (candidateAuthors.length === 0) reviewIssues.push("Authors — no author names were returned; verify the report cover.");
  if (candidateSupervisor && !supervisorIsValid) {
    reviewIssues.push("Supervisor — the proposed name was not found in the report and was rejected.");
  }
  if (!fieldIsValid) reviewIssues.push("Field — the AI did not return a supported category; no category was stored.");
  if (!difficultyIsValid) reviewIssues.push("Difficulty — the AI did not return a supported rating; no rating was stored.");
  if (candidateTechnologies.some((technology) => !hasEvidence(technology))) {
    reviewIssues.push("Technologies — one or more proposed items were not found in the report and were rejected.");
  }
  if (candidateTechnologies.length === 0) reviewIssues.push("Technologies — none were identified; verify the technical sections.");
  if (candidateKeywords.some((keyword) => !hasEvidence(keyword))) {
    reviewIssues.push("Keywords — one or more proposed terms were not found in the report and were rejected.");
  }
  if (candidateKeywords.length === 0) reviewIssues.push("Keywords — none were returned; verify the abstract or keyword section.");

  return {
    title: titleIsValid ? candidateTitle : null,
    authors,
    supervisor: supervisorIsValid ? candidateSupervisor : null,
    field: fieldIsValid ? candidateField : null,
    difficulty: difficultyIsValid ? candidateDifficulty : null,
    summary: summaryIsValid ? candidateSummary : null,
    technologies,
    keywords,
    reviewIssues,
  };
}
