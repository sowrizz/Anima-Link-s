Exactly. The correct build rule is:

Try to build every major feature properly first. Only hardcode/fallback when a feature blocks the demo.

That means:

LLM is real.

Memory storage + retrieval is real.

Backend is real.

Expo app is real.

Camera/voice are attempted properly.

Only if something breaks near demo time, you switch that module to fallback mode.

Your pitch already depends heavily on persistent semantic memory, LLM-based CBT reasoning, adaptive character routing, and ChromaDB/RAG-style memory recall. The project document specifically says memory should store emotional tags, thought-pairs, MSI history, date-linked snippets, and recall similar patterns later instead of restarting from zero.  The architecture slide also shows React Native/Expo, FastAPI, Gemini/Gemma, ChromaDB, SQLite, OpenCV/MediaPipe, and deterministic safety routing as the intended stack.  The idea document frames the core system flow as Sense → Understand → Validate → Remember → Restructure → Act → Adapt → Audit, so the build phases should follow that pipeline.

Final Build Principle

You will build real first, fallback second.

Each module has 3 levels:

Level

Meaning

When to use

Level A: Proper

Real API, real LLM, real DB, real retrieval

Start here

Level B: Assisted

Real frontend/backend, but simplified logic

Use if time is low

Level C: Fallback

Hardcoded demo response

Use only if module breaks

So you should not start by hardcoding. You only hardcode if something is failing and you are close to demo.

Overall Architecture

Frontend

Use:

React Native + Expo Go
Expo Router
TypeScript
NativeWind or StyleSheet
AsyncStorage for local UI state
Expo Camera
Expo AV / audio recording if time allows

Backend

Use:

FastAPI
Python
Gemini API / OpenAI-compatible LLM if available
ChromaDB for vector memory
SQLite for structured logs
Pydantic models for strict JSON

Database split

Use two memory layers:

1. SQLite — structured memory

Stores exact events:

user messages
LLM analysis
MSI score
distortion
character used
game completed
thought → reframe pair
tiny wins
reminders
session logs

2. ChromaDB — semantic memory

Stores searchable memories:

exam stress memories
meeting anxiety memories
thought → reframe memories
tiny win proof
character effectiveness summaries

This is better than only ChromaDB because SQLite gives reliable display/report data, and ChromaDB gives semantic recall.

Team Split

You — Person A: Frontend + Demo Flow

You own the app screens, navigation, interaction, and demo polish.

Your major areas:

Expo setup
navigation
onboarding
home
chat UI
voice room UI
missions UI
character council
thought monster screens
camera mission screens
focus boss UI
memory graph UI
privacy/safety UI
report UI
final demo rehearsal

Friend — Person B: Backend + AI + Database

Friend owns the intelligence and storage.

Their major areas:

FastAPI setup
LLM client
structured prompts
SQLite schema
ChromaDB memory
message analysis
memory retrieval
CBT engine
character router
camera analysis API
voice transcript pipeline
game APIs
report generator
safety router
fallback responses

The split is not “frontend vs backend” only. It is:

You make the product feel alive. Friend makes the product think and remember.

Phase 1 — Project Setup

Goal

Both app and backend running, connected, and testable on Expo Go.

Person A — Frontend setup

Create Expo project:

npx create-expo-app anima-link --template
cd anima-link
npm install expo-router react-native-safe-area-context react-native-screens
npm install @react-native-async-storage/async-storage
npm install expo-camera expo-av expo-image-picker
npm install lucide-react-native

Suggested structure:

anima-link/
  app/
    _layout.tsx
    index.tsx
    onboarding/
      splash.tsx
      welcome.tsx
      privacy.tsx
      companion.tsx
      features.tsx
      tutorial.tsx
    tabs/
      _layout.tsx
      home.tsx
      chat.tsx
      missions.tsx
      memory.tsx
      safety.tsx
    games/
      thought-monster.tsx
      camera-mission.tsx
      focus-boss.tsx
      tiny-win.tsx
      cbt-arena.tsx
      npc-practice.tsx
      voice-spell.tsx
    reports/
      weekly.tsx

  components/
    AnimaOrb.tsx
    MoodMirror.tsx
    CharacterCard.tsx
    MissionCard.tsx
    AnalysisBadge.tsx
    BattleHPBar.tsx
    MemoryCard.tsx
    ThoughtGraph.tsx
    ConsentToggle.tsx

  services/
    api.ts
    storage.ts

  constants/
    theme.ts
    characters.ts

Run:

npx expo start

Test on Expo Go.

Person B — Backend setup

Create backend:

mkdir backend
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic python-dotenv requests chromadb sentence-transformers sqlalchemy

Structure:

backend/
  main.py
  .env
  app/
    routes/
      health.py
      analyze.py
      memory.py
      games.py
      camera.py
      reports.py
      safety.py
    services/
      llm.py
      memory_store.py
      sqlite_store.py
      prompts.py
      character_router.py
      msi_engine.py
      fallback.py
    models/
      schemas.py
    data/
      anima.db
      chroma/

Run:

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Expose to phone:

ngrok http 8000

or use local IP:

http://YOUR_LAPTOP_IP:8000

Deliverable

Frontend calls:

GET /health

and shows:

Backend connected
LLM connected
Memory connected

Phase 2 — Database + Memory Foundation

This is the most important backend phase. Build it properly.

Your documents make memory central: persistent memory should enable contextual recall, pattern detection, behavioral history modeling, emotional tagging, clustering, memory decay, and cross-session continuity.  So do this before games.

Person B — SQLite schema

Create tables:

users
sessions
messages
analyses
memories
thought_pairs
tiny_wins
character_feedback
game_events
reports

Minimum useful schema:

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  role TEXT,
  content TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  message_id TEXT,
  emotion TEXT,
  msi_score INTEGER,
  msi_label TEXT,
  distortion TEXT,
  trigger TEXT,
  absolutist_words TEXT,
  recommended_path TEXT,
  suggested_action TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  memory_type TEXT,
  title TEXT,
  content TEXT,
  emotion TEXT,
  trigger TEXT,
  distortion TEXT,
  msi_label TEXT,
  character TEXT,
  intervention TEXT,
  importance INTEGER,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS thought_pairs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  original_thought TEXT,
  reframe TEXT,
  distortion TEXT,
  trigger TEXT,
  character TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS tiny_wins (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  proof_type TEXT,
  linked_thought TEXT,
  counter_evidence TEXT,
  character TEXT,
  created_at TEXT
);

Person B — ChromaDB memory

Use Chroma collection:

anima_memories

Each memory should store:

{
  "user_id": "demo_user",
  "memory_type": "thought_pair",
  "trigger": "exam stress",
  "emotion": "high_stress",
  "distortion": "overgeneralization",
  "msi_label": "High Strain",
  "character": "Nova",
  "intervention": "CBT reframe"
}

Document text example:

Exam stress memory. Original thought: I always mess up before exams. Reframe: I can start with one section. What helped: Nova CBT and Arlo focus sprint.

Memory endpoints

Build:

POST /memory/add
POST /memory/search
GET /memory/all
GET /memory/graph

Person A — Memory UI

Build a real Memory Core screen with:

Search memory
Exam Stress
Meeting Anxiety
Focus Wins
Reframes
Tiny Wins
Character History

For each memory, show:

title
trigger
distortion
reframe
character
date

Fallback rule

If ChromaDB breaks:

Use SQLite keyword search temporarily.

Fallback is not hardcoding. It is a simpler real retrieval method.

Phase 3 — LLM Client + Structured Output

The slide says the AI should perform structured reasoning, not just conversation, with specialized agents for signal interpretation, memory retrieval, CBT reasoning, intervention routing, tone, governance, and therapist summary.  So use strict JSON everywhere.

Person B — LLM service

Create one central LLM function:

call_llm_json(prompt, schema_name)

Rules:

temperature low
JSON only
validate with Pydantic
retry once if invalid
fallback if still invalid

Core schemas

Create Pydantic schemas:

MessageAnalysis
MemorySearchResult
ThoughtMonsterGame
CharacterRoute
CameraAnalysis
FocusBossPlan
TinyWinResult
ReportSummary
SafetyRoute

Message analysis output

Real LLM should return:

{
  "emotion": "high_stress",
  "msi_score": 82,
  "msi_label": "High Strain",
  "absolutist_words": ["never", "always"],
  "distortion": "overgeneralization",
  "trigger": "exam_assignment_pressure",
  "intent": "needs_cbt_support",
  "recommended_path": ["Kael", "Nova", "Arlo"],
  "memory_query": ["exam stress", "assignment pressure", "never finish"],
  "suggested_game": "thought_monster_battle",
  "safe_response": "You used 'never' and 'always'. Before we believe that thought, let’s test it."
}

Person A — Chat UI

Chat screen should:

send message to backend

show loading

receive structured analysis

display badges

show memory recall

show recommended path

route to Thought Monster

Fallback rule

If LLM fails:

Use rule-based detector:

never / always / impossible → overgeneralization
everything will go wrong → catastrophizing
perfect / useless → all-or-nothing

But only after the LLM call fails.

Phase 4 — Chat Core + Real Memory Recall

The core demo must prove:

user message → LLM analysis → memory search → character route → intervention.

Backend flow

When /analyze-message is called:

1. Save message to SQLite
2. Run safety pre-check
3. Run LLM analysis
4. Use analysis.memory_query to search ChromaDB
5. Compute MSI using LLM + deterministic weighting
6. Save analysis
7. Return analysis + memory results + route

Add seed memories

Before demo, seed 8–12 memories:

Exam stress memory
Meeting anxiety memory
Focus win memory
Previous reframe memory
Tiny win proof memory
Character feedback memory
Low-energy day memory
Presentation fear memory

Example:

April 12 · Exam week
Original thought: I always mess up before exams.
Reframe: I can start with one section.
What helped: Nova reframe + Arlo 5-minute sprint.

Frontend output

After user enters:

I’ll never finish this assignment. I always mess up before exams.

Show:

Mood: High Stress
Absolutist words: never, always
Distortion: Overgeneralization
MSI: 82 · High Strain
Memory recalled: April 12 exam week
Recommended path: Kael → Nova → Arlo

This directly matches the demo flow in your slides, where the app recalls a previous exam-night pattern and routes the user into CBT + focus mode instead of generic reassurance.

Phase 5 — Adaptive Character Engine

The character engine should not be a dropdown. It should use state + memory.

Backend

Create /characters/route.

Input:

{
  "analysis": {},
  "memory_results": [],
  "user_preference": "challenge_me"
}

Routing logic:

High Strain → Kael first
Distortion detected → Nova
Action needed → Arlo
Low energy → Sera
Overwhelm / acceptance → Zen

Return:

{
  "recommended_path": ["Kael", "Nova", "Arlo"],
  "reason": "User shows high strain and overgeneralization; stabilize first, then reframe, then act.",
  "character_lines": {
    "Kael": "Breathe first. We slow the storm before solving.",
    "Nova": "The word 'never' is the part we need to test.",
    "Arlo": "One section. One timer. No perfection."
  }
}

Frontend

Companion Council page:

Sera — healer/mirror
Kael — shield/grounding
Nova — strategist/CBT
Zen — monk/mindfulness
Arlo — motivator/action

Show route visually:

Kael → Nova → Arlo

Fallback

If API fails, use local character rules.

Phase 6 — Thought Monster Battle

This is one of your signature features. It should be real LLM-generated, not hardcoded.

The features document says Thought Monster Battle turns a detected cognitive distortion into a monster and defeats it through CBT actions like evidence checking, past proof, and smallest next step.

Backend endpoint

POST /games/thought-monster/start
POST /games/thought-monster/round
POST /games/thought-monster/complete

Start input

{
  "message": "I’ll never finish this assignment.",
  "analysis_id": "...",
  "memory_results": [...]
}

Start output

{
  "monster_name": "Never-Finish Beast",
  "monster_type": "Overgeneralization",
  "trigger_words": ["never", "always"],
  "weakness": "Evidence Check",
  "guide": "Nova",
  "hp": 100,
  "rounds": [
    {
      "title": "Detect the Trick",
      "question": "What is this thought trying to make you believe?"
    },
    {
      "title": "Evidence Check",
      "question": "What evidence does not fully support the word 'never'?"
    },
    {
      "title": "Memory Proof",
      "question": "What past moment shows this was not completely true?"
    },
    {
      "title": "Tiny Step",
      "question": "What is one action under 5 minutes?"
    }
  ]
}

Complete output

{
  "original_thought": "I’ll never finish this assignment.",
  "reframe": "I do not need to finish everything right now. I can start with one section.",
  "reward": "Reality Sword",
  "memory_to_store": {
    "type": "thought_pair",
    "trigger": "exam stress",
    "distortion": "overgeneralization",
    "character": "Nova"
  }
}

Frontend

Build:

monster spawn screen
HP bar
round question cards
memory proof card
answer input/buttons
final reframe card
reward unlock animation

Fallback

If LLM fails, use a generic CBT template but still save the user’s actual thought and reframe.

Phase 7 — Camera Missions

Do real camera capture with Expo. Use real LLM vision if possible.

Your notes say camera should turn the real room into a game map: phone as Distraction Goblin, notebook as Focus Portal, water as Health Potion, assignment as Boss Gate.

Person A — Expo camera

Install and request permission:

expo-camera
expo-image-picker

Build:

Camera Mission screen
Take Photo
Preview Photo
Analyze Workspace
Result Cards
Start Focus Boss

Person B — Vision backend

Endpoint:

POST /camera/analyze-workspace

Input:

{
  "image_base64": "...",
  "mode": "room_transformation"
}

Prompt:

Analyze this workspace image.
Return JSON only.
Identify visible objects relevant to studying, focus, grounding, and distraction.
Map each object to an Anima-Link game label.
Do not analyze faces.
Do not diagnose emotions.
Use likely/unclear/high confidence.

Output:

{
  "scene_type": "workspace",
  "objects": [
    {
      "name": "phone",
      "confidence": "likely",
      "game_label": "Distraction Goblin",
      "category": "distraction"
    },
    {
      "name": "notebook",
      "confidence": "likely",
      "game_label": "Focus Portal",
      "category": "focus"
    },
    {
      "name": "water bottle",
      "confidence": "likely",
      "game_label": "Health Potion",
      "category": "grounding"
    }
  ],
  "recommended_mission": "Move one distraction away and open the focus object."
}

Fallback

If vision API fails:

Use “manual scan result” button that fills from sample JSON.

This is acceptable because camera APIs and network image upload can be fragile.

Phase 8 — Focus Boss Fight

Focus Boss should be partly real and partly UI-driven.

The features document says Focus Boss turns focus into a boss battle where actions like moving phone away, opening notebook, starting timer, writing one line, and completing a focus block damage the boss.

Backend

Endpoint:

POST /games/focus-boss/create

Input:

{
  "goal": "I need to do DBMS but I don’t know where to start.",
  "linked_thought": "I’ll never finish this assignment.",
  "camera_objects": [...]
}

Output:

{
  "boss_name": "Deadline Demon",
  "main_task": "DBMS assignment",
  "tiny_step": "Open the assignment and start Question 1.",
  "estimated_time_minutes": 5,
  "battle_plan": [
    "Move phone away",
    "Open notebook",
    "Start timer",
    "Write one line",
    "Capture tiny win"
  ],
  "character": "Arlo"
}

Frontend

Real UI:

boss HP
timer
step checklist
Arlo messages
completion

HP changes when steps complete.

Fallback

If backend fails, create local boss from goal.

Phase 9 — Tiny Win Proof

This should be real storage.

Frontend

Screen:

What did you complete?
- Wrote one line
- Opened notebook
- Moved phone away
- Finished one question
- Cleaned one part of desk
- Completed breathing

Then:

Which thought does this proof weaken?
- I never finish.
- I can’t focus.
- I always waste time.

Optional camera capture:

Show your tiny win

Backend

Endpoint:

POST /tiny-win/store

It should:

1. save tiny win in SQLite
2. create Chroma memory
3. update graph data
4. return reward artifact

Output:

{
  "stored": true,
  "artifact": "Tiny Win Crystal",
  "room": "Proof Mountain",
  "counter_evidence": "Started Section 1",
  "graph_updates": [
    "Tiny Win → supports → Proof Memory",
    "Proof Memory → weakens → I never finish"
  ]
}

Fallback

No fallback needed. This is simple and should work.

Phase 10 — Thought Graph / Memory Museum

Build this properly enough to impress.

The slides say Thought Graph visualizes emotion clusters, repeated triggers, connected journal entries, MSI-linked memory nodes, and thought → reframe breakthroughs.

Backend

Endpoint:

GET /memory/graph

Return:

{
  "nodes": [
    {
      "id": "exam_stress",
      "label": "Exam Stress",
      "type": "trigger"
    },
    {
      "id": "never_finish",
      "label": "Never-Finish Beast",
      "type": "monster"
    },
    {
      "id": "overgeneralization",
      "label": "Overgeneralization",
      "type": "distortion"
    },
    {
      "id": "nova_reframe",
      "label": "Nova Reframe",
      "type": "reframe"
    },
    {
      "id": "tiny_win",
      "label": "Tiny Win Crystal",
      "type": "proof"
    }
  ],
  "edges": [
    {
      "from": "exam_stress",
      "to": "never_finish",
      "label": "triggered"
    },
    {
      "from": "never_finish",
      "to": "overgeneralization",
      "label": "detected as"
    },
    {
      "from": "nova_reframe",
      "to": "tiny_win",
      "label": "strengthened by"
    }
  ]
}

Frontend

For speed, do not use a heavy graph library first. Use a beautiful card-based graph:

Exam Stress
   ↓ triggered
Never-Finish Beast
   ↓ detected as
Overgeneralization
   ↓ reframed by
Nova Reframe
   ↓ supported by
Tiny Win Crystal

If time remains, use a real graph visualization.

Fallback

If graph endpoint fails, display graph from latest local session state.

Phase 11 — Voice Room + Voice Spell

Build it as real as possible.

The features document says Voice Spell should route commands like “Anima, shield me,” “Anima, battle this thought,” “Anima, memory check,” and “Anima, boss fight.”

Person A

Build Voice Room:

Vent Mode
Calm Me Mode
Challenge Me Mode
Hype Me Mode
Plan With Me Mode

UI:

large waveform
record button
timer
transcript
analysis result
route to mission

Build Voice Spell:

Speak or type spell
Recognized spell
Route

Person B

Endpoint:

POST /voice/analyze-transcript
POST /voice/route-spell

For actual speech:

Try:

expo-av recording → backend transcription

But this may take time.

Practical approach:

Use real typed transcript fallback.
Use real LLM analysis after transcript.

That means voice capture can fallback, but voice intelligence is real.

Phase 12 — CBT Arena + NPC Practice

Build these if the main flow is stable.

Your notes include CBT response comparison for “teammate hasn’t pushed code” and exposure-style NPC practice for meeting a future boss.

Backend endpoints

POST /games/cbt-arena/score
POST /games/npc-practice/start
POST /games/npc-practice/respond

CBT Arena LLM output

{
  "scores": {
    "aggression": 82,
    "clarity": 48,
    "solution_focus": 25,
    "specificity": 35
  },
  "detected_patterns": ["absolutist language", "blame framing"],
  "rewrite_goal": "specific request with deadline",
  "suggested_reply": "Can you push your part by 8 PM so I can integrate it?"
}

NPC output

{
  "npc_reply": "Hi, good to meet you. Tell me a little about yourself.",
  "scores": {
    "calmness": 64,
    "clarity": 78,
    "confidence": 52
  },
  "feedback": "Try a slower first sentence and one clear introduction."
}

Fallback

Preset scenarios if LLM fails.

Phase 13 — Safety, Privacy, Reports

This should not be LLM-only. Your slide explicitly says safety is deterministic and crisis routing bypasses the LLM.

Safety router

Backend safety should run before LLM:

input message
→ safety keyword/risk check
→ if normal: continue LLM
→ if high-risk: bypass LLM and return safety UI route

Keep demo non-graphic and general:

{
  "route": "breathing_reset",
  "llm_bypass": true,
  "message": "High strain detected. Normal chat paused. Starting a grounding reset."
}

Privacy page

Show:

Allow chat analysis
Allow voice analysis
Allow camera missions
Allow memory storage
Allow therapist export
Allow trusted-contact SOS

Transparency:

PII stripping: Active
Raw biometric data sent to LLM: No
Memory snippets used: 2
Cloud AI: Optional
Local fallback: Available

Reports

Endpoint:

GET /reports/weekly

Generate from SQLite:

MSI peak
top trigger
top distortion
interventions used
thought → reframe breakthroughs
tiny wins
character effectiveness

Output:

MSI peak: High Strain
Trigger: exam deadline
Distortion: overgeneralization
Intervention: CBT + Focus Boss
Breakthrough: “I can start with one section.”
Tiny Win: Started Section 1

Actual 7-Hour Phase Schedule

Hour 0:00–0:30 — Fast setup

You

Expo app
Expo Go test
folder structure
basic theme
bottom tabs
API base URL

Friend

FastAPI app
health route
.env
LLM API test
SQLite connection
Chroma connection

Must finish

Phone app can call backend /health.

Hour 0:30–1:30 — Memory + database first

You

Memory screen UI
Memory cards
Search bar
empty graph screen

Friend

SQLite tables
Chroma collection
seed demo memories
/memory/add
/memory/search
/memory/all

Must finish

Searching “exam stress” returns April 12 memory.

This is your biggest credibility piece.

Hour 1:30–2:30 — Real LLM chat analysis

You

Chat screen
message input
analysis badges
memory recall card
recommended path card
buttons to games

Friend

/analyze-message
LLM JSON prompt
Pydantic validation
safety pre-check
memory search integration
store message + analysis

Must finish

Input:

I’ll never finish this assignment. I always mess up before exams.

Output:

High Stress
never, always
Overgeneralization
MSI 82
April 12 memory recalled
Kael → Nova → Arlo

Hour 2:30–3:15 — Companion Council + routing

You

Companion Council screen
5 character cards
recommended route animation/card
character response cards

Friend

/characters/route
character prompt/tone logic
character effectiveness write

Must finish

Chat can open Companion Council with route.

Hour 3:15–4:15 — Thought Monster Battle

You

Monster screen
HP bar
round UI
memory proof card
final reframe card
reward card

Friend

/games/thought-monster/start
/games/thought-monster/complete
LLM CBT round generation
store thought_pair in SQLite + Chroma

Must finish

Battle creates and stores:

Original: I’ll never finish this assignment.
Reframe: I can start with one section.
Reward: Reality Sword

Hour 4:15–5:15 — Camera Mission

You

Expo camera/image picker
preview image
analyze button
game label cards
start focus boss button

Friend

/camera/analyze-workspace
vision prompt
JSON validation
fallback sample JSON if vision fails

Must finish

A real image or selected image returns:

Phone → Distraction Goblin
Notebook → Focus Portal
Water → Health Potion
Assignment → Boss Gate

Hour 5:15–6:00 — Focus Boss + Tiny Win

You

Focus Boss screen
timer
HP bar
checklist
Tiny Win screen
reward card

Friend

/games/focus-boss/create
/tiny-win/store
graph update logic

Must finish

Focus Boss completes and stores Tiny Win Crystal.

Hour 6:00–6:30 — Thought Graph + Report

You

Thought Graph UI
Report screen
Privacy screen
Safety screen

Friend

/memory/graph
/reports/weekly
/safety/check

Must finish

Graph shows:

Exam Stress → Never-Finish Beast → Nova Reframe → Arlo Sprint → Tiny Win → Proof Memory

Hour 6:30–7:00 — Voice + fallback locks + demo polish

You

Voice Room UI
Voice Spell UI
final UI cleanup
demo rehearsals

Friend

/voice/route-spell
typed transcript fallback
API fallback responses
bug fixes

Must finish

Voice Spell typed input:

Anima, battle this thought

routes to Thought Monster.

Fallback Strategy

You should create fallback files from the beginning.

Backend fallback file

fallback.py

Contains:

fallback_analysis
fallback_thought_monster
fallback_camera_analysis
fallback_focus_boss
fallback_report

But backend should only use fallback if:

LLM timeout
invalid JSON twice
camera API failure
Chroma unavailable

Frontend fallback display

Show a subtle badge:

Demo fallback active

Only if necessary. Do not show it during judging unless asked.

Priority Ranking

Non-negotiable

Backend health
SQLite memory
Chroma/semantic search or strong keyword fallback
LLM message analysis
Chat UI
Memory recall
Character routing
Thought Monster
Thought pair storage
Tiny Win storage
Thought Graph

Strongly needed

Camera Mission
Focus Boss
Reports
Privacy/Safety

Nice if time

Voice Room
Voice Spell
CBT Arena
NPC Practice
Mood Quest

What to tell your friend

Tell them this:

Your first job is not games. Your first job is memory + LLM JSON + storage.

Build in this order:
1. FastAPI health
2. SQLite schema
3. Chroma memory add/search
4. Gemini/OpenAI JSON client
5. /analyze-message
6. /games/thought-monster
7. /camera/analyze-workspace
8. /games/focus-boss
9. /tiny-win/store
10. /memory/graph
11. /reports/weekly

Every endpoint must return clean JSON. If LLM fails, return fallback JSON from fallback.py so frontend never breaks.

What you should do

You build screens in this order:

1. Tabs + theme
2. Home
3. Chat
4. Memory
5. Companion Council
6. Thought Monster
7. Camera Mission
8. Focus Boss
9. Tiny Win
10. Thought Graph
11. Safety/Privacy
12. Reports
13. Voice Room
14. Extra games

Do not build random screens before the main flow.

Final Demo Flow

The final demo should prove everything is connected:

1. Home shows Storm Cave active.
2. Chat receives user stress message.
3. LLM returns structured analysis.
4. Memory retrieves April 12 exam memory.
5. Companion Council recommends Kael → Nova → Arlo.
6. Thought Monster spawns Never-Finish Beast.
7. User completes CBT battle.
8. Reframe is stored into memory.
9. Camera scans workspace.
10. Assignment becomes Boss Gate.
11. Focus Boss creates Deadline Demon.
12. User completes one tiny action.
13. Tiny Win Crystal is stored.
14. Thought Graph updates.
15. Report summarizes MSI, trigger, distortion, intervention, and breakthrough.
16. Safety page shows LLM bypass and privacy controls.

That is not dumbed down. That is a proper hackathon MVP: real backend, real LLM, real memory, real retrieval, real app, and controlled fallbacks only when needed.