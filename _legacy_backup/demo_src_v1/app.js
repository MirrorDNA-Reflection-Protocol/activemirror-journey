// Active Mirror — Sovereign AI Demo
// Using Web Worker to prevent GPU context disposal

import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODELS = [
    {
        id: 'qwen',
        name: 'Qwen 2.5 3B',
        icon: '🌐',
        size: '1.9GB',
        desc: 'Best multilingual',
        modelId: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
        recommended: true
    },
    {
        id: 'llama',
        name: 'Llama 3.2 3B',
        icon: '⟡',
        size: '1.8GB',
        desc: 'Best reasoning',
        modelId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
    },
    {
        id: 'phi',
        name: 'Phi-3 Mini',
        icon: '◈',
        size: '2.2GB',
        desc: 'Complex tasks',
        modelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC'
    }
];

const SYSTEM = `You are Active Mirror — sovereign AI running locally in this browser.
Be direct, clear, concise. No data leaves this device.
Keep responses 1-2 paragraphs unless asked for more.`;

let engine = null;
let messages = [];

function show(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function renderModels() {
    const grid = document.getElementById('model-grid');
    grid.innerHTML = MODELS.map(m => `
        <button class="model-card" data-id="${m.id}">
            <div class="model-icon">${m.icon}</div>
            <div class="model-name">${m.name}</div>
            <div class="model-size">${m.size}</div>
            <div class="model-desc">${m.desc}</div>
            ${m.recommended ? '<div class="model-badge">Recommended</div>' : ''}
        </button>
    `).join('');

    grid.querySelectorAll('.model-card').forEach(card => {
        card.onclick = () => loadModel(card.dataset.id);
    });
}

async function loadModel(id) {
    const model = MODELS.find(m => m.id === id);
    if (!model) return;

    show('view-loading');

    const pct = document.getElementById('loading-percent');
    const status = document.getElementById('loading-status');
    const ring = document.getElementById('progress-ring');

    try {
        console.log('[ActiveMirror] Creating worker engine for:', model.name);

        // Create worker - the key fix for disposal issue
        const worker = new Worker(
            new URL('./worker.js', import.meta.url),
            { type: 'module' }
        );

        engine = await CreateWebWorkerMLCEngine(
            worker,
            model.modelId,
            {
                initProgressCallback: (report) => {
                    const p = Math.round(report.progress * 100);
                    if (pct) pct.textContent = p + '%';
                    if (status) status.textContent = report.text;
                    if (ring) ring.style.strokeDashoffset = 283 - (p / 100) * 283;
                }
            }
        );

        console.log('[ActiveMirror] Engine ready');
        messages = [];
        show('view-chat');
        document.getElementById('user-input').focus();
        addMessage('ai', "Ready. What's on your mind?");

    } catch (err) {
        console.error('[ActiveMirror] Error:', err);
        if (status) {
            status.textContent = 'Error: ' + err.message;
            status.style.color = '#ff4444';
        }
    }
}

function addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'chat-message ' + role;
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (!(role === 'ai' && text === "Ready. What's on your mind?")) {
        messages.push({ role: role === 'ai' ? 'assistant' : 'user', content: text });
    }
}

async function send() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('btn-send');
    const text = input ? input.value.trim() : '';

    if (!text || !engine) return;

    const suggestions = document.getElementById('suggestions');
    if (suggestions) suggestions.style.display = 'none';

    addMessage('user', text);
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-message ai';
    aiDiv.innerHTML = '<span class="thinking">⟡</span>';
    document.getElementById('chat-messages').appendChild(aiDiv);
    document.getElementById('chat-messages').scrollTop = 99999;

    let full = '';

    try {
        const stream = await engine.chat.completions.create({
            messages: [{ role: 'system', content: SYSTEM }, ...messages],
            stream: true,
            max_tokens: 500
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            full += delta;
            aiDiv.innerHTML = full.replace(/\n/g, '<br>');
            document.getElementById('chat-messages').scrollTop = 99999;
        }

        messages.push({ role: 'assistant', content: full });

    } catch (err) {
        console.error('[ActiveMirror] Generation error:', err);
        aiDiv.innerHTML = '<span style="color:#ff4444">Error: ' + err.message + '</span>';
    }

    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
}

// Initialize
renderModels();

document.getElementById('user-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

document.getElementById('user-input').addEventListener('input', e => {
    document.getElementById('btn-send').disabled = !e.target.value.trim();
});

document.getElementById('btn-send').addEventListener('click', send);

document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.onclick = () => {
        const input = document.getElementById('user-input');
        if (input) {
            input.value = chip.dataset.prompt;
            document.getElementById('btn-send').disabled = false;
        }
    };
});

console.log('[ActiveMirror] Initialized with Web Worker support');
