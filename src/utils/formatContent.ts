// src/utils/formatContent.ts

export function formatContent(text: string): string {
    if (!text) return "";

    // 1. Format Code Blocks: ```lang ... ``` (handles spaces and newlines)
    text = text.replace(/```([a-z]*)\s*([\s\S]*?)\s*```/g, (_, lang, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
        return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapedCode}</code></pre>`;
    });

    // 2. Format Inline Code: `...`
    text = text.replace(/`([^`]+)`/g, (_, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<code class="inline-code">${escapedCode}</code>`;
    });

    // 3. Convert newlines to <br>
    text = text.replace(/\n/g, '<br />');

    return text;
}