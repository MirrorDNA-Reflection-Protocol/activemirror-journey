import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// ===== CONFIG =====
const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

const SYSTEM_PROMPT = `You are MirrorMesh, demonstrating Active Mirror's governed AI.

STRICT BEHAVIORS:
1. NEVER give direct advice without asking at least one clarifying question first
2. ALWAYS tag your confidence on claims:
   - [FACT] = Verifiable information
   - [ESTIMATE] = Reasoned inference, could be wrong
   - [UNKNOWN] = Insufficient data
3. When asked "should I X?", provide a FRAMEWORK for thinking, not an answer
4. If you don't know, say [UNKNOWN] — never fabricate
5. Be warm but structured. Help users THINK, don't think FOR them.
6. Keep responses concise (2-4 paragraphs max)

You are running LOCALLY in this browser. Data never leaves this device.`;

const WELCOME_MESSAGE = `Welcome. I'm MirrorMesh — a reflection partner, not an answer machine.

I'll ask before I advise. I'll tag what I know vs. what I'm guessing: [FACT], [ESTIMATE], [UNKNOWN].

What's on your mind?`;

// ===== STATE =====
let engine = null;
let messages = [];
let isRedTeamEnabled = false;

// ===== DOM =====
const preLoad = document.getElementById('pre-load');
const loadingState = document.getElementById('loading-state');
const chatState = document.getElementById('chat-state');
const initBtn = document.getElementById('init-btn');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const progressDetail = document.getElementById('progress-detail');
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const redTeamToggle = document.getElementById('red-team-toggle');
const suggestions = document.getElementById('suggestions');
const latencyStat = document.getElementById('latency-stat');
const carbonStat = document.getElementById('carbon-stat');
const webgpuStatus = document.getElementById('webgpu-status');

// ===== INIT =====
async function checkWebGPU() {
    if (navigator.gpu) {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
            webgpuStatus.textContent = '✓ WebGPU supported';
            webgpuStatus.classList.add('success');
            return true;
        }
    }
    webgpuStatus.textContent = '✗ WebGPU not supported — try Chrome or Edge';
    webgpuStatus.classList.add('error');
    initBtn.disabled = true;
    return false;
}

checkWebGPU();

// ===== LOAD MODEL =====
initBtn.addEventListener('click', async () => {
    preLoad.classList.add('hidden');
    loadingState.classList.remove('hidden');

    try {
        engine = await CreateMLCEngine(MODEL_ID, {
            initProgressCallback: (report) => {
                const pct = Math.round(report.progress * 100);
                progressBar.style.width = `${pct}%`;
                progressPercent.textContent = `${pct}%`;
                progressDetail.textContent = report.text;
            },
        });

        // Success — show chat
        loadingState.classList.add('hidden');
        chatState.classList.remove('hidden');

        // Add welcome message
        appendMessage('ai', WELCOME_MESSAGE);

        // Enable input
        userInput.disabled = false;
        userInput.focus();

    } catch (err) {
        progressDetail.textContent = `Error: ${err.message}`;
        progressDetail.style.color = '#ef4444';
        console.error(err);
    }
});

// ===== CHAT =====
function appendMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    if (role === 'ai') {
        // Format truth tags
        let formatted = content
            .replace(/\[FACT\]/g, '<span class="tag tag-fact">FACT</span>')
            .replace(/\[ESTIMATE\]/g, '<span class="tag tag-estimate">ESTIMATE</span>')
            .replace(/\[UNKNOWN\]/g, '<span class="tag tag-unknown">UNKNOWN</span>');

        div.innerHTML = `<div class="sender"><span>⟡</span> MirrorMesh</div>${formatted}`;
    } else if (role === 'red-team') {
        div.innerHTML = content;
    } else {
        div.textContent = content;
    }

    chatHistory.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text || !engine) return;

    // Hide suggestions after first message
    if (suggestions) suggestions.style.display = 'none';

    // Add user message
    appendMessage('user', text);
    userInput.value = '';
    sendBtn.disabled = true;

    messages.push({ role: "user", content: text });

    // Prepare request
    const requestMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
    ];

    // Create AI message container
    const aiDiv = appendMessage('ai', '');
    let fullResponse = "";
    const startTime = performance.now();
    let firstToken = true;

    try {
        const stream = await engine.chat.completions.create({
            messages: requestMessages,
            stream: true,
            max_tokens: 500,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                if (firstToken) {
                    latencyStat.textContent = `⚡ ${Math.round(performance.now() - startTime)}ms`;
                    firstToken = false;
                }
                fullResponse += content;

                // Format and display
                let formatted = fullResponse
                    .replace(/\[FACT\]/g, '<span class="tag tag-fact">FACT</span>')
                    .replace(/\[ESTIMATE\]/g, '<span class="tag tag-estimate">ESTIMATE</span>')
                    .replace(/\[UNKNOWN\]/g, '<span class="tag tag-unknown">UNKNOWN</span>');

                aiDiv.innerHTML = `<div class="sender"><span>⟡</span> MirrorMesh</div>${formatted}`;
                scrollToBottom();
            }
        }

        messages.push({ role: "assistant", content: fullResponse });

        // Update carbon
        const currentCarbon = parseFloat(carbonStat.textContent.match(/[\d.]+/)?.[0] || 0);
        carbonStat.textContent = `🌱 ${(currentCarbon + 0.04).toFixed(2)}g`;

        // Red team
        if (isRedTeamEnabled) {
            await runRedTeam(fullResponse);
        }

    } catch (err) {
        aiDiv.innerHTML = `<div class="sender"><span>⟡</span> MirrorMesh</div>Error: ${err.message}`;
    }

    sendBtn.disabled = userInput.value.trim() === '';
}

async function runRedTeam(advice) {
    const prompt = `You are a Red Team auditor. In 2-3 sentences, critique this advice for unstated assumptions, missing risks, or logical gaps. Start with "⚠️":

${advice}`;

    const redDiv = appendMessage('red-team', '<em>Analyzing...</em>');

    try {
        const response = await engine.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
        });

        redDiv.textContent = response.choices[0].message.content;
        scrollToBottom();
    } catch (err) {
        redDiv.textContent = "⚠️ Red Team analysis failed.";
    }
}

// ===== EVENT LISTENERS =====
userInput.addEventListener('input', () => {
    sendBtn.disabled = userInput.value.trim() === '';
    // Auto-resize
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

sendBtn.addEventListener('click', handleSend);

redTeamToggle.addEventListener('change', (e) => {
    isRedTeamEnabled = e.target.checked;
});

// Suggested prompts
document.querySelectorAll('.suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
        userInput.value = btn.dataset.prompt;
        userInput.focus();
        sendBtn.disabled = false;
    });
});

// Export
document.getElementById('export-btn').addEventListener('click', () => {
    import('./mirror-export.js').then(module => {
        module.exportKernel(messages);
    });
});
