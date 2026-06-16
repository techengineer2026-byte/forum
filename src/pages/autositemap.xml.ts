import type { APIRoute } from "astro";

const SITE_URL = "https://forum.techengineer.co";
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbywCeoEu7CNLZtgRKyy4wsnvGw8B6wpNrP5ke0RoJ6XrVfwgsmBKAlIKvli79IVAWQJxQ/exec";

export const GET: APIRoute = async () => {
  let posts: any[] = [];
  let writers: any[] = [];

  try {
    // Fetch posts and writers in parallel to speed up build time
    const [postsRes, writersRes] = await Promise.all([
      fetch(`${SHEET_URL}?action=getPosts`),
      fetch(`${SHEET_URL}?action=getWriters`),
    ]);
    posts = await postsRes.json();
    writers = await writersRes.json();
  } catch (err) {
    console.error("Failed to fetch data for sitemap:", err);
  }

  // Static Pages
  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily" },
    { url: "/following", priority: "0.8", changefreq: "weekly" },
    { url: "/answer", priority: "0.8", changefreq: "weekly" },
    { url: "/answer/requests", priority: "0.7", changefreq: "weekly" },
    { url: "/answer/drafts", priority: "0.5", changefreq: "monthly" },
    { url: "/notifications", priority: "0.6", changefreq: "daily" },
    { url: "/search", priority: "0.7", changefreq: "monthly" },
    { url: "/space", priority: "0.8", changefreq: "weekly" },
    { url: "/about", priority: "0.5", changefreq: "monthly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
  ];

  const urls: string[] = [];

  // Add static URLs
  staticPages.forEach((page) => {
    urls.push(`
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  });

  // Add dynamic Question/Post URLs
  if (Array.isArray(posts)) {
    posts.forEach((post) => {
      const slug =
        post.slug ||
        post.heading
          ?.toLowerCase()
          .replace(/[^\w ]+/g, "")
          .replace(/ +/g, "-");
      if (slug) {
        const date = post.created_at
          ? new Date(post.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        urls.push(`
  <url>
    <loc>${SITE_URL}/question/${encodeURIComponent(slug)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
      }
    });
  }

  // Add dynamic User Profile URLs
  if (Array.isArray(writers)) {
    writers.forEach((writer) => {
      if (writer.name) {
        urls.push(`
  <url>
    <loc>${SITE_URL}/user?name=${encodeURIComponent(writer.name)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
