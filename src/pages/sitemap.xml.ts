import type { APIRoute } from "astro";
import { ALL_SESSIONS } from "../data/curriculum";

const staticPaths = [
  "/",
  "/search",
  "/practice",
  "/slang",
  "/achievements",
  "/dictionary",
  "/settings",
  "/certificate",
  "/verify",
];

function toHtmlPath(path: string): string {
  if (path === "/") return "/index.html";
  return `${path}.html`;
}

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString().replace(/\/$/, "") ?? "").trim();
  const urls = [
    ...staticPaths.map((p) => toHtmlPath(p)),
    ...ALL_SESSIONS.map(({ session }) => `/session/${session.slug}.html`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => {
    const loc = base ? `${base}${path}` : path;
    return `  <url><loc>${loc}</loc></url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
