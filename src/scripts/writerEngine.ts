import { writers, type Writer } from "../data/writers";

export function getAllWriters(): Writer[] {
    return writers;
}

export function searchWriters(query: string): Writer[] {
    const q = query.toLowerCase().trim();
    if (!q) return writers;

    return writers.filter((w) =>
        w.name.toLowerCase().includes(q) ||
        w.expertise.toLowerCase().includes(q) ||
        w.topics.some((t) => t.toLowerCase().includes(q))
    );
}

export function filterByTopic(topic: string): Writer[] {
    if (topic === "all") return writers;
    return writers.filter((w) =>
        w.topics.some((t) => t.toLowerCase() === topic.toLowerCase())
    );
}

export function getAllTopics(): string[] {
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