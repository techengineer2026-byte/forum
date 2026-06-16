// src/pages/api/get-spaces.ts
export async function GET({ url }) {
  const userEmail = url.searchParams.get("userEmail") || "";
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwS4kLCU7sm9LX0sGrBC4f8LNAuSyGwjaSS6fEJq3jbwQapxoVnX6Qs2VXQO2ePecs8rA/exec";

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
