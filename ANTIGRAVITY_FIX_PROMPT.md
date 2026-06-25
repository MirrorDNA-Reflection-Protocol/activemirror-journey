# ANTIGRAVITY MISSION: Fix Active Mirror Demo

## THE PROBLEM

Active Mirror at https://activemirror.ai/demo/ has a critical bug:

1. User selects a model (Qwen, Llama, or Phi)
2. Model downloads successfully to 100%
3. Chat interface appears briefly
4. **Then it crashes back to the model selection page**

Error seen in debug: `"object has already been disposed"`

This is a WebLLM/WebGPU memory management issue where the engine is being garbage collected or disposed prematurely.

## YOUR MISSION

Fix this demo so it works perfectly. The model should load, chat should work, and it should NEVER crash back to the start.

## REPO LOCATION

```
~/Documents/GitHub/activemirror-site/demo/
```

## CURRENT FILES

- `index.html` - Simple HTML structure
- `app.js` - Main app (~150 lines)
- `app.css` - Styles
- `mirror-os.js` - Storage layer (IndexedDB)
- `i18n.js` - Internationalization (not currently used)

## WHAT WE'VE TRIED

1. Storing engine on `window.mirrorState` - still crashes
2. Removing service workers - didn't help
3. Simplifying to minimal code - still crashes
4. Adding try/catch everywhere - error still happens

## TECHNICAL CONTEXT

- Using WebLLM: `import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm"`
- Models: Qwen2.5-3B, Llama-3.2-3B, Phi-3-mini (all q4f16_1-MLC variants)
- The engine IS created successfully (we see 100% and chat view appears)
- Something disposes it AFTER creation, possibly:
  - WebGPU context loss
  - Memory pressure
  - A re-render or DOM change triggering cleanup
  - The esm.run import doing something weird

## POTENTIAL FIXES TO INVESTIGATE

1. **Keep engine alive**: Maybe we need to do a dummy operation to keep it referenced
2. **WebGPU context loss handling**: Add event listeners for context loss/restore
3. **Different WebLLM import**: Try unpkg or skypack instead of esm.run
4. **Delayed transition**: Wait longer before showing chat view
5. **Engine warmup**: Do a small inference immediately after creation to "lock" it
6. **Check WebLLM docs**: There may be a known issue or required pattern

## REQUIREMENTS FOR THE FIX

1. **Must work reliably** - No crashes, no "disposed" errors
2. **Must be simple** - Keep the code minimal and readable
3. **Must be sovereign** - Everything runs in browser, no external APIs
4. **Test thoroughly** - Try multiple models, multiple messages, page refresh

## SUCCESS CRITERIA

A user can:
1. Visit https://activemirror.ai/demo/
2. Click any of the 3 models
3. Wait for download
4. See chat interface
5. Type a message and get a response
6. Continue chatting without crashes

## HOW TO TEST

```bash
cd ~/Documents/GitHub/activemirror-site
python3 -m http.server 8000
# Then open http://localhost:8000/demo/ in Chrome
```

Or just push to GitHub and test live at https://activemirror.ai/demo/

## GIT WORKFLOW

```bash
cd ~/Documents/GitHub/activemirror-site
git add -A
git commit -m "your message"
git push origin main
```

Changes deploy automatically via GitHub Pages.

## CONTEXT ABOUT ACTIVE MIRROR

This is a sovereign AI demo - runs entirely in browser, no cloud. It's meant to show that useful AI can exist without surveillance capitalism. The demo MUST work reliably to prove this point.

## GO

Read the current code, research WebLLM issues, find the fix, implement it, test it, push it. Use as many tool calls as needed. Don't stop until it works.
