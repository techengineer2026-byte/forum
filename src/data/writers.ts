// src/data/writers.ts
export interface Writer {
  id: string;
  name: string;
  expertise: string;
  topics: string[];
  avatar: string;
  initials: string;
  color: string;
}

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwfpjk3Y2gzDt0T_JS7c2OhQajr_UildmeqEgQVPQxIFAjYnYG8alaQF0XmGjeI-_uzkQ/exec";

let cachedWriters: Writer[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getWriters(): Promise<Writer[]> {
  // Return cache if fresh
  if (cachedWriters && Date.now() - cacheTime < CACHE_TTL) {
    return cachedWriters;
  }

  try {
    const res = await fetch(`${SHEET_URL}?action=getWriters`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Writer[] = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      cachedWriters = data;
      cacheTime = Date.now();
      return data;
    }

    throw new Error("Empty or invalid response");
  } catch (e) {
    console.error("Failed to fetch writers:", e);
    // Return stale cache if available, otherwise empty array
    return cachedWriters || [];
  }
}
