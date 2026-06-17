// src/pages/api/get-spaces.ts
export async function GET({ url }) {
  const userEmail = url.searchParams.get("userEmail") || "";
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwfpjk3Y2gzDt0T_JS7c2OhQajr_UildmeqEgQVPQxIFAjYnYG8alaQF0XmGjeI-_uzkQ/exec";

  try {
    const targetUrl = `${SCRIPT_URL}?action=getSpaces&userEmail=${encodeURIComponent(userEmail)}`;

    const response = await fetch(targetUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch spaces" }), {
      status: 500,
    });
  }
}
