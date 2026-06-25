export function exportKernel(messages) {
    if (messages.length === 0) {
        alert("No conversation to save. Chat first!");
        return;
    }

    // Heuristic extraction
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const topics = extractTopics(userMessages);

    const seed = {
        "identity": {
            "origin": "web_demo_session",
            "timestamp": new Date().toISOString(),
            "style_imprint": detectStyle(userMessages),
            "interests": topics
        },
        "history_snip": messages.slice(-5) // Last 5 turns
    };

    const blob = new Blob([JSON.stringify(seed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-mirror-seed.json';
    a.click();
    URL.revokeObjectURL(url);

    // Show prompt
    if (confirm("Mirror Seed saved! Create your full identity?")) {
        window.open('https://id.activemirror.ai', '_blank');
    }
}

function extractTopics(msgs) {
    // Simple mock keyword extraction
    const keywords = ["investing", "coding", "philosophy", "startup", "meditation", "ai", "privacy", "crypto", "design"];
    const text = msgs.join(" ").toLowerCase();
    return keywords.filter(k => text.includes(k));
}

function detectStyle(msgs) {
    const text = msgs.join(" ");
    if (text.length === 0) return "Unknown";
    const avgLen = text.length / msgs.length;
    if (avgLen < 50) return "Concise";
    if (text.includes("?")) return "Inquisitive";
    if (text.length > 200) return "Verbose";
    return "Balanced";
}
