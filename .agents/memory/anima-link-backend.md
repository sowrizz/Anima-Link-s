---
name: anima-link backend
description: In-memory store architecture, deterministic fallback, and LLM integration pattern for Anima-Link
---

**Architecture:** No DATABASE_URL required. All data stored in in-memory Maps in `artifacts/api-server/src/services/store.ts`. 8 seeded demo memories pre-loaded at startup covering exam stress, meetings, focus wins, and tiny wins.

**Deterministic fallback:** `artifacts/api-server/src/services/analyzer.ts` uses regex-based absolutist word detection (never/always/nothing etc.) and distortion pattern matching. This means full MSI scoring, character routing, and game suggestions work with zero API keys.

**LLM optional:** `artifacts/api-server/src/services/llm.ts` checks `process.env.OPENAI_API_KEY`. If present, calls gpt-4o-mini for analysis and thought-monster/focus-boss generation. Falls back silently to deterministic if absent or on error.

**Camera analysis:** Uses gpt-4o vision if API key is present. Falls back to SAMPLE_WORKSPACE_OBJECTS (4 seeded objects). Source field in response indicates: "vision_ai" vs "sample".

**Store resets on restart** — intentional for demo build. Production would swap to Drizzle + Postgres.
