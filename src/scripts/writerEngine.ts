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
      w.topics.some((t) => t.toLowerCase().includes(q))
  );
}

/* Filter writers by topic */
export async function filterByTopic(topic: string): Promise<Writer[]> {
  const writers = await loadWriters();
  if (topic === "all") return writers;
  return writers.filter((w) =>
    w.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
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
export function renderWriters(list: Writer[]): HTMLElement[] {
  return list.map((w) => {
    const item = document.createElement("div");
    item.className = "person-item";
    item.setAttribute("data-id", w.id);

    /* Person Info Container */
    const personInfo = document.createElement("div");
    personInfo.className = "person-info";

    /* Avatar */
    const avatar = document.createElement("div");
    avatar.className = "person-avatar";
    avatar.style.backgroundColor = w.color;
    avatar.textContent = w.initials;

    /* If writer has a real avatar image, use it */
    if (w.avatar && w.avatar.startsWith("http")) {
      const img = document.createElement("img");
      img.src = w.avatar;
      img.alt = w.name;
      img.className = "person-avatar-img";
      avatar.replaceWith(img);
    }

    /* Details */
    const details = document.createElement("div");
    details.className = "person-details";

    const name = document.createElement("p");
    name.className = "p-name";
    name.textContent = w.name;

    const sub = document.createElement("p");
    sub.className = "p-sub";
    sub.textContent = w.expertise;

    details.appendChild(name);
    details.appendChild(sub);
    personInfo.appendChild(avatar);
    personInfo.appendChild(details);

    /* Check Button */
    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn";
    checkBtn.setAttribute("data-id", w.id);
    checkBtn.textContent = "+";
    checkBtn.type = "button";

    item.appendChild(personInfo);
    item.appendChild(checkBtn);

    return item;
  });
}