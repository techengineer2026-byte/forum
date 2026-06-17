/**
 * Question Engine - Static Version
 * Optimized for Firebase Hosting (No SSR needed)
 */

import { formatContent } from '../utils/formatContent'; // ✅ IMPORT FORMATTER

export interface Question {
    question: string;
    slug: string;
    answers?: string[];
}

export interface RankedQuestion extends Question {
    score: number;
}

/* ---------------------------------------------------- */
/* Clean text into meaningful keywords */
export function cleanText(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w -]+/g, "")
        .split(" ")
        .filter((word: string) => word.length > 3);
}

/* ---------------------------------------------------- */
/* Get all questions from localStorage (with build-time safety) */
export function getAllQuestions(): Question[] {
    if (typeof window === "undefined") return []; // Prevents error during 'npm run build'
    const stored = localStorage.getItem("questions");
    return stored ? JSON.parse(stored) : [];
}

/* ---------------------------------------------------- */
/* Generate URL-friendly slug */
export function slugify(text: string): string {
    // ✅ Clean out code blocks before making the slug!
    const cleanText = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`]+`/g, "").trim();
    return cleanText
        .toLowerCase()
        .replace(/[^\w -]+/g, "")
        .replace(/ +/g, "-");
}

/* ---------------------------------------------------- */
/* Search questions by keyword ranking */
export function searchQuestions(query: string): RankedQuestion[] {
    const queryWords: string[] = cleanText(query);
    const questions: Question[] = getAllQuestions();

    const ranked: RankedQuestion[] = [];

    questions.forEach((q: Question) => {
        const questionWords: string[] = cleanText(q.question);
        let score = 0;

        queryWords.forEach((word: string) => {
            if (questionWords.includes(word)) score++;
        });

        if (score > 0) {
            ranked.push({ ...q, score });
        }
    });

    ranked.sort((a, b) => b.score - a.score);
    return ranked;
}

/* ---------------------------------------------------- */
/* Find related questions by keyword overlap */
export function findRelated(
    text: string,
    all: Question[],
    limit: number = 6
): RankedQuestion[] {
    const keywords: string[] = cleanText(text);
    const ranked: RankedQuestion[] = [];

    all.forEach((q: Question) => {
        if (q.question === text) return;

        const words: string[] = cleanText(q.question);
        let score = 0;

        keywords.forEach((k: string) => {
            if (words.includes(k)) score++;
        });

        if (score > 0) {
            ranked.push({ ...q, score });
        }
    });

    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, limit);
}

/* ---------------------------------------------------- */
/* Highlight matched words */
export function highlight(text: string, words: string[]): string {
    let result = text;
    words.forEach((word: string) => {
        const regex = new RegExp(`(${word})`, "gi");
        result = result.replace(regex, "<mark>$1</mark>");
    });
    return result;
}

/* ---------------------------------------------------- */
/* Load single question into page (Updated for Static) */
export function renderQuestionPage(): void {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    
    if (!slug) return;

    const questions: Question[] = getAllQuestions();
    const current = questions.find((q: Question) => q.slug === slug);

    const titleEl = document.getElementById("question-title");
    const countEl = document.getElementById("answer-count");
    const answersContainer = document.getElementById("answers-container");

    if (!titleEl || !countEl || !answersContainer) return;

    if (!current) {
        titleEl.innerText = "Question not found";
        return;
    }

    // ✅ CHANGED: Use innerHTML + formatContent so code blocks render beautifully!
    titleEl.innerHTML = formatContent(current.question);
    countEl.innerText = (current.answers?.length || 0) + " Answers";

    answersContainer.innerHTML = "";

    if (current.answers) {
        current.answers.forEach((answer: string) => {
            const div = document.createElement("div");
            div.className = "answer-item";
            // ✅ CHANGED: Format answers too, in case they contain code!
            div.innerHTML = formatContent(answer);
            answersContainer.appendChild(div);
        });
    }

    const related = findRelated(current.question, questions);
    const relatedContainer = document.getElementById("related-questions");
    if (!relatedContainer) return;

    relatedContainer.innerHTML = "";
    related.forEach((q: Question) => {
        const a = document.createElement("a");
        a.href = `/question?slug=${q.slug}`;
        a.className = "related-item";
        a.innerText = q.question; // Keep related links as plain text for clean UI
        relatedContainer.appendChild(a);
    });
}

/* ---------------------------------------------------- */
/* Render search results (Updated for Static) */
export function renderSearchResults(): void {
    const params = new URLSearchParams(window.location.search);
    const query: string = params.get("q") || "";

    const queryWords: string[] = cleanText(query);
    const results = searchQuestions(query);

    const resultsContainer = document.getElementById("results");
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <p>We couldn't find any results for '${query}'.</p>
                <button class="add-question-btn">Add question</button>
            </div>`;
        return;
    }

    results.forEach((q: Question) => {
        const a = document.createElement("a");
        a.href = `/question?slug=${q.slug}`;
        a.className = "result-item";
        a.innerHTML = highlight(q.question, queryWords);
        resultsContainer.appendChild(a);
    });
}