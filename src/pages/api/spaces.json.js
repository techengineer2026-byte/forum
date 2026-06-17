// src/pages/api/spaces.json.js
export const prerenrer = false;

export async function GET({ url }) {
  const userEmail = url.searchParams.get("userEmail") || "";
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwS4kLCU7sm9LX0sGrBC4f8LNAuSyGwjaSS6fEJq3jbwQapxoVnX6Qs2VXQO2ePecs8rA/exec";

  try {
    const response = await fetch(
      `${SCRIPT_URL}?action=getSpaces&userEmail=${userEmail}`,
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
