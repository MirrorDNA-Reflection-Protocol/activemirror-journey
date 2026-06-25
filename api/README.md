# Mirror API (Node.js)

TypeScript/Node.js API layer for Active Mirror.

## Architecture

```
Frontend (React) → Node.js API (Hono) → LLM APIs
                         ↓
                  Python Judge Service (ML)
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your API keys
cp .env.example .env

# Start the Python judge service (in separate terminal)
python judge_service.py

# Start the Node.js API
npm run dev
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/mirror` | POST | Main chat endpoint (streaming) |
| `/mirror/simple` | POST | Non-streaming chat |

## Smart Router

Automatically routes queries to the optimal model:

| Tier | Model | Use Case |
|------|-------|----------|
| `fast` | Llama 3.3 70B (Groq) | General queries |
| `reasoning` | DeepSeek R1 | Code, math, logic |
| `creative` | Mistral Large | Writing, brainstorming |
| `vision` | Llama 4 Scout | Image analysis |
| `image_gen` | FLUX Schnell | Image generation |

## Development

```bash
npm run dev        # Watch mode
npm run build      # Compile TypeScript
npm run typecheck  # Type check without emitting
npm start          # Run compiled code
```

## Production

```bash
# Build
npm run build

# Run both services
python judge_service.py &
node dist/index.js
```
