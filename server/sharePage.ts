import fs from "fs";
import path from "path";
import { buildResultShareMeta, type ResultShareMeta } from "../client/src/lib/quizShare.ts";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderShareHtml(indexHtmlPath: string, origin: string, meta: ResultShareMeta) {
  const canonicalUrl = new URL(meta.canonicalPath, origin).toString();
  const imageUrl = new URL(meta.imagePath, origin).toString();
  const indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");

  const tags = [
    `<title>${escapeHtml(`${meta.headline} • QuiZoeira`)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="QuiZoeira" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${escapeHtml(meta.headline)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(`${meta.headline} - ${meta.resultTitle}`)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.headline)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(`${meta.headline} - ${meta.resultTitle}`)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
  ].join("\n    ");

  return indexHtml
    .replace(/<title>.*?<\/title>/, tags)
    .replace('<html lang="en">', '<html lang="pt-BR">');
}

export function renderResultShareHtml(indexHtmlPath: string, origin: string, quizId: string, percentage: number) {
  return renderShareHtml(indexHtmlPath, origin, buildResultShareMeta(quizId, percentage));
}

export function renderResultShareHtmlFromMeta(indexHtmlPath: string, origin: string, meta: ResultShareMeta) {
  return renderShareHtml(indexHtmlPath, origin, meta);
}

export function resolveIndexHtmlPath(staticPath: string) {
  return path.join(staticPath, "index.html");
}
