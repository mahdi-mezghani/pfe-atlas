import test from "node:test";
import assert from "node:assert/strict";

import { extractDeterministicMetadata, fillMetadataGaps, filterTechnologyKeywords, normalizeMetadata, parseMetadataCandidate } from "./document-metadata.ts";

const testReport = [
  [
    "Rapport PFE fictif — Mahdi Mezghani — Page 1",
    "RAPPORT DE PROJET DE FIN D'ÉTUDES",
    "Conception d’une plateforme intelligente de",
    "traitement et d’analyse automatisée des rapports",
    "techniques",
    "Présenté par : Mahdi Mezghani",
    "Encadrant : Dr. Yassine Gharbi",
    "Année universitaire : 2025–2026",
  ].join("\n"),
  [
    "Résumé",
    "Dans de nombreuses organisations, les rapports techniques contiennent des informations utiles, mais leur exploitation reste souvent manuelle.",
    "Le projet développe une plateforme d’ingestion de documents et de production de synthèses.",
    "Mots-clés : Data Engineering, NLP, ETL, Python, automatisation, traitement documentaire, LLM.",
  ].join("\n"),
  [
    "2.3 Environnement technique",
    "Technologie Rôle",
    "Python Développement des pipelines",
    "Pandas Transformation des données",
    "FastAPI Développement de l’API",
    "PostgreSQL Stockage des résultats",
    "Docker Conteneurisation",
    "Git Gestion des versions",
    "LLM Analyse et synthèse",
    "React Interface utilisateur",
  ].join("\n"),
].join("\n\n");

test("technology names are not repeated as keywords", () => {
  assert.deepEqual(
    filterTechnologyKeywords(["LLM", "Python", "NLP", "Data Engineering"], ["Python", "LLM"]),
    ["NLP", "Data Engineering"],
  );
});

test("metadata response parsing distinguishes invalid JSON from schema shape errors", () => {
  const invalidJson = parseMetadataCandidate("{not json");
  assert.equal(invalidJson.ok, false);
  if (!invalidJson.ok) {
    assert.equal(invalidJson.reason, "invalid_json");
    assert.ok(invalidJson.detail.length > 0);
  }

  const invalidShape = parseMetadataCandidate(JSON.stringify({ title: "Report", technologies: "Python" }));
  assert.equal(invalidShape.ok, false);
  if (!invalidShape.ok) {
    assert.equal(invalidShape.reason, "invalid_shape");
    assert.match(invalidShape.detail, /authors/);
    assert.match(invalidShape.detail, /technologies/);
  }

  const valid = parseMetadataCandidate(`\`\`\`json
${JSON.stringify({
  title: "Report",
  authors: ["A. Author"],
  supervisor: "",
  field: "",
  difficulty: "",
  summary: "",
  technologies: ["Python"],
  keywords: ["Data Engineering"],
})}
\`\`\``);
  assert.equal(valid.ok, true);
});

test("metadata validation accepts only values supported by report text", () => {
  const result = normalizeMetadata(testReport, {
    title: "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques",
    authors: ["Mahdi Mezghani"],
    supervisor: "Dr. Yassine Gharbi",
    field: "Data Science",
    difficulty: "Medium",
    summary:
      "Dans de nombreuses organisations, les rapports techniques contiennent des informations utiles, mais leur exploitation reste souvent manuelle. " +
      "Le projet développe une plateforme d’ingestion de documents afin de structurer leur contenu. " +
      "La solution combine un pipeline de traitement de données, des techniques de traitement automatique du langage et des modèles génératifs. " +
      "Elle prend en charge l’extraction de métadonnées, la segmentation des documents et la génération de synthèses. " +
      "Les informations obtenues sont organisées dans une base de données exploitable pour faciliter leur consultation. " +
      "Cette plateforme vise à réduire le travail manuel de consultation et à rendre les contenus documentaires plus faciles à exploiter.",
    technologies: ["Python", "Pandas", "FastAPI", "Not a real technology"],
    keywords: ["Data Engineering", "NLP"],
  });

  test("explicit report keywords take precedence over model-generated keywords", () => {
    const result = normalizeMetadata(testReport, {
      title: "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques",
      authors: ["Mahdi Mezghani"],
      supervisor: "Dr. Yassine Gharbi",
      field: "Data Science",
      difficulty: "Medium",
      summary: "",
      technologies: ["Python", "Pandas"],
      keywords: ["unsupported model guess"],
    }, ["Data Engineering", "NLP"]);

    assert.deepEqual(result.keywords, ["Data Engineering", "NLP"]);
    assert.ok(!result.reviewIssues.some((issue) => issue.startsWith("Keywords —")));
  });

  assert.equal(result.title, "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques");
  assert.deepEqual(result.authors, ["Mahdi Mezghani"]);
  assert.equal(result.supervisor, "Dr. Yassine Gharbi");
  assert.equal(result.field, "Data Science");
  assert.equal(result.difficulty, "Medium");
  assert.ok(result.summary);
  assert.deepEqual(result.technologies, ["FastAPI", "Pandas", "Python"]);
  assert.deepEqual(result.keywords, ["Data Engineering", "NLP"]);
  assert.ok(result.reviewIssues.some((issue) => issue.startsWith("Technologies —")));
});

test("summary validation rejects a short abstract-only summary", () => {
  const result = normalizeMetadata(testReport, {
    title: "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques",
    authors: ["Mahdi Mezghani"],
    supervisor: "Dr. Yassine Gharbi",
    field: "Data Science",
    difficulty: "Medium",
    summary: "Le projet développe une plateforme d’ingestion de documents et de production de synthèses.",
    technologies: ["Python"],
    keywords: ["Data Engineering"],
  });

  assert.equal(result.summary, null);
  assert.ok(result.reviewIssues.some((issue) => issue.startsWith("Summary —")));
});

test("summary validation preserves a useful English overview for a French report", () => {
  const result = normalizeMetadata(testReport, {
    title: "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques",
    authors: ["Mahdi Mezghani"],
    supervisor: "Dr. Yassine Gharbi",
    field: "Data Science",
    difficulty: "Medium",
    summary:
      "The project addresses the manual effort required to review technical reports and develops a document-processing platform to make their contents easier to use. " +
      "It combines an ingestion pipeline with natural-language processing and generative models to extract metadata, segment reports, and produce concise overviews. " +
      "The implementation organizes extracted information in a database so users can search and consult report content without repeatedly reading each full document. " +
      "The report describes a prototype that automates these steps and presents its results as a proof of concept, rather than evidence of measured production impact. " +
      "The platform therefore demonstrates how structured processing can support report discovery while preserving the distinction between reported prototype results and real-world outcomes.",
    technologies: ["Python", "Pandas", "FastAPI"],
    keywords: ["Data Engineering", "NLP"],
  });

  assert.ok(result.summary?.startsWith("The project addresses"));
  assert.ok(!result.reviewIssues.some((issue) => issue.startsWith("Summary —")));
});

test("deterministic fallback fills missing fields without replacing validated AI fields", () => {
  const ai = normalizeMetadata(testReport, {
    title: "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques",
    authors: [],
    supervisor: "Dr. Yassine Gharbi",
    field: "Data Science",
    difficulty: "Medium",
    summary:
      "Dans de nombreuses organisations, les rapports techniques contiennent des informations utiles, mais leur exploitation reste souvent manuelle. " +
      "Le projet développe une plateforme d’ingestion de documents afin de structurer leur contenu. " +
      "La solution combine un pipeline de traitement de données, des techniques de traitement automatique du langage et des modèles génératifs. " +
      "Elle prend en charge l’extraction de métadonnées, la segmentation des documents et la génération de synthèses. " +
      "Les informations obtenues sont organisées dans une base de données exploitable pour faciliter leur consultation. " +
      "Cette plateforme vise à réduire le travail manuel de consultation et à rendre les contenus documentaires plus faciles à exploiter.",
    technologies: [],
    keywords: ["Data Engineering", "not supported by report"],
  });
  const deterministic = extractDeterministicMetadata(testReport);
  const merged = fillMetadataGaps(ai, deterministic);

  assert.equal(merged.summary, ai.summary);
  assert.equal(merged.title, ai.title);
  assert.deepEqual(merged.authors, ["Mahdi Mezghani"]);
  assert.deepEqual(merged.technologies, deterministic.technologies);
  assert.deepEqual(merged.keywords, ["Data Engineering"]);
  assert.ok(merged.reviewIssues.some((issue) => issue.startsWith("Keywords —")));
});

test("deterministic fallback supplies the verbatim abstract when the AI summary is rejected", () => {
  const ai = normalizeMetadata(testReport, {
    title: "",
    authors: [],
    supervisor: "",
    field: "",
    difficulty: "",
    summary: "Too short.",
    technologies: [],
    keywords: [],
  });
  const deterministic = extractDeterministicMetadata(testReport);
  const merged = fillMetadataGaps(ai, deterministic);

  assert.equal(merged.summary, deterministic.summary);
  assert.deepEqual(merged.authors, deterministic.authors);
  assert.deepEqual(merged.technologies, deterministic.technologies);
  assert.deepEqual(merged.keywords, deterministic.keywords);
  assert.ok(merged.reviewIssues.some((issue) => issue.startsWith("Summary —")));
});

test("metadata validation leaves unsupported values empty rather than substituting heuristics", () => {
  const result = normalizeMetadata(testReport, {
    title: "A made-up title",
    authors: ["Someone not named in the report"],
    supervisor: "Unknown supervisor",
    field: "",
    difficulty: "",
    summary: "A summary that is too short.",
    technologies: ["ImaginaryStack"],
    keywords: [],
  });

  assert.equal(result.title, null);
  assert.deepEqual(result.authors, []);
  assert.equal(result.supervisor, null);
  assert.equal(result.field, null);
  assert.equal(result.difficulty, null);
  assert.equal(result.summary, null);
  assert.deepEqual(result.technologies, []);
  assert.deepEqual(result.keywords, []);
  assert.ok(result.reviewIssues.length > 0);
});

test("deterministic metadata extracts explicit labels and technical tables without inferring fields", () => {
  const metadata = extractDeterministicMetadata(testReport);

  assert.equal(metadata.title, "Conception d’une plateforme intelligente de traitement et d’analyse automatisée des rapports techniques");
  assert.deepEqual(metadata.authors, ["Mahdi Mezghani"]);
  assert.equal(metadata.supervisor, "Dr. Yassine Gharbi");
  assert.match(metadata.summary ?? "", /^Dans de nombreuses organisations/);
  assert.equal(metadata.field, null);
  assert.equal(metadata.difficulty, null);
  assert.deepEqual(metadata.technologies, ["Python", "Pandas", "FastAPI", "PostgreSQL", "Docker", "Git", "LLM", "React"]);
  assert.deepEqual(metadata.keywords, [
    "Data Engineering",
    "NLP",
    "ETL",
    "automatisation",
    "traitement documentaire",
  ]);
});

test("deterministic metadata extracts explicit technology and keyword lists", () => {
  const metadata = extractDeterministicMetadata([
    "Technologies: Python, PostgreSQL, Airflow, XGBoost, FastAPI, React et Docker.",
    "Mots-clés : Prévision énergétique, Data Engineering,",
    "Machine Learning.",
    "Abstract",
  ].join("\n"));

  assert.deepEqual(metadata.technologies, ["Python", "PostgreSQL", "Airflow", "XGBoost", "FastAPI", "React", "Docker"]);
  assert.deepEqual(metadata.keywords, ["Prévision énergétique", "Data Engineering", "Machine Learning"]);
});

test("deterministic metadata does not infer values from unrelated report mentions", () => {
  const metadata = extractDeterministicMetadata([
    "The report mentions AI, Python, a supervisor, and medium difficulty.",
    "This paragraph does not explicitly label any metadata fields.",
  ].join("\n\n"));

  assert.equal(metadata.title, null);
  assert.deepEqual(metadata.authors, []);
  assert.equal(metadata.supervisor, null);
  assert.equal(metadata.field, null);
  assert.equal(metadata.difficulty, null);
  assert.equal(metadata.summary, null);
  assert.deepEqual(metadata.technologies, []);
  assert.deepEqual(metadata.keywords, []);
});