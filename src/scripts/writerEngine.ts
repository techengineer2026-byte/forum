import { getWriters, type Writer } from "../data/writers";

/* Ensure we always load fresh data once per session */
let writersCache: Writer[] | null = null;

async function loadWriters(): Promise<Writer[]> {
  if (!writersCache) {
    writersCache = await getWriters();
  }
  return writersCache;
}

/* Clear cache (call after login/logout or when data changes) */
export function invalidateWritersCache(): void {
  writersCache = null;
}

/* Get all writers */
export async function getAllWriters(): Promise<Writer[]> {
  return loadWriters();
}

/* Search writers by query */
export async function searchWriters(query: string): Promise<Writer[]> {
  const writers = await loadWriters();
  const q = query.toLowerCase().trim();
  if (!q) return writers;

  return writers.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.expertise.toLowerCase().includes(q) ||
      w.topics.some((t) => t.toLowerCase().includes(q)),
  );
}

/* Filter writers by topic */
export async function filterByTopic(topic: string): Promise<Writer[]> {
  const writers = await loadWriters();
  if (topic === "all") return writers;
  return writers.filter((w) =>
    w.topics.some((t) => t.toLowerCase() === topic.toLowerCase()),
  );
}

/* Get all unique topics */
export async function getAllTopics(): Promise<string[]> {
  const writers = await loadWriters();
  const topics = new Set<string>();
  writers.forEach((w) => w.topics.forEach((t) => topics.add(t)));
  return Array.from(topics);
}

/* Render using DOM methods (NO innerHTML) */
/* Render using DOM methods */
export function renderWriters(list: Writer[]): HTMLElement[] {
  return list.map((w) => {
    const item = document.createElement("div");
    item.className = "person-item";
    item.setAttribute("data-id", w.id);

    /* 1. Avatar Container */
    const avatar = document.createElement("div");
    avatar.className = "person-avatar";

    if (w.avatar && w.avatar.startsWith("http")) {
      const img = document.createElement("img");
      img.src = w.avatar;
      img.alt = w.name;
      avatar.appendChild(img);
    } else {
      avatar.style.backgroundColor = w.color || "#b92b27";
      avatar.textContent = w.initials;
    }

    /* 2. Text Details Container */
    const details = document.createElement("div");
    details.className = "person-details";

    const name = document.createElement("span");
    name.className = "person-name";
    name.textContent = w.name;

    const sub = document.createElement("span");
    sub.className = "person-meta";
    sub.textContent = w.expertise;

    details.appendChild(name);
    details.appendChild(sub);

    /* 3. Check Button */
    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.setAttribute("data-id", w.id);
    checkBtn.type = "button";
    // Default state is a plus icon
    checkBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';

    /* Assemble: Avatar | Details | Button */
    item.appendChild(avatar);
    item.appendChild(details);
    item.appendChild(checkBtn);

    return item;
  });
}
