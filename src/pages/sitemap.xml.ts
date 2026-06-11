// src/pages/sitemap.xml.ts
import type { APIRoute } from "astro";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxlZOW0AuGlzMPuNZ5bGKYiK_DNZp8geGUwrYopvp-lezOxlIjb761sS7aDLPJlRrqDHg/exec";

export const GET: APIRoute = async ({ site }) => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getPosts`);
    const posts = await response.json();

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/following", priority: "0.8", changefreq: "daily" },
      { url: "/notifications", priority: "0.5", changefreq: "never" },
    ];

    const dynamicPages = posts.map((post: any) => ({
      url: `/question/${post.slug}`,
      lastmod: new Date(post.created_at).toISOString(),
      priority: "0.9",
      changefreq: "weekly",
    }));

    const allPages = [...staticPages, ...dynamicPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${site}${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    return new Response("Error generating sitemap", { status: 500 });
  }
};
