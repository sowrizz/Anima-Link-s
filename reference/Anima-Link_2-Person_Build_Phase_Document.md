Anima-Link
Two-Person Build Phase Document
React Native Expo + FastAPI + LLM + SQLite + ChromaDB + Camera/Voice Missions
Build rule
Build real first. If a module blocks the demo, switch only that module to fallback mode. The fallback must keep the same API shape so the other person is never blocked.

Final demo backbone
Home -> Chat/Voice -> LLM analysis -> Memory retrieval -> Companion Council -> Thought Monster -> Camera Mission -> Focus Boss -> Tiny Win -> Thought Graph -> Report/Safety.


# 1. Product Scope and Engineering Target

This document converts Anima-Link into a 6-7 hour two-person build plan. The goal is not to build a shallow mockup. The goal is to build a real full-stack MVP where the core intelligence is real and the fallback layer exists only to protect the final demo.

## 1.1 What must be real

Expo app running on Expo Go with real navigation and real API calls.
FastAPI backend with health, LLM, memory, game, camera, report, and safety routes.
LLM message analysis returning strict JSON: emotion, MSI, distortion, trigger, recommended path, and suggested game.
SQLite structured storage for messages, analyses, memories, thought-pairs, tiny wins, game events, and reports.
ChromaDB semantic memory retrieval for contextual recall, especially exam stress, meetings, reframes, and tiny wins.
Thought Monster Battle generated from real analysis and memory retrieval.
Focus Boss plan generated from a real goal and stored intervention context.
Tiny Win storage that updates memory and the graph.
Safety router that can bypass LLM for predefined high-risk routes and show deterministic UI.

## 1.2 What can fallback if time or APIs break

Module
Proper attempt
Fallback allowed
Camera Vision
Expo Camera/Image Picker -> backend vision model -> JSON labels
Manual sample workspace JSON with same output schema
Voice Recording
Expo AV recording -> transcription route -> analysis
Typed transcript route through same /analyze-message API
ChromaDB
Real Chroma collection with embeddings
SQLite keyword/tag search, still real stored data
LLM JSON
Gemini/OpenAI call with Pydantic validation
fallback.py returns JSON only after timeout/invalid JSON twice
System Daemon
Not realistic in Expo Go
Static device signals panel clearly described as prototype
SOS SMS
Do not send real SMS in demo
Preview message and trusted contact setup screen
rPPG/HRV
Optional future/prototype only
Signal card with “prototype / not medical-grade” wording


# 2. Two-Person Work Split

Non-blocking strategy
The backend person owns API contracts and can return temporary fallback JSON immediately. The frontend person builds screens against those contracts from minute one. Later, the backend swaps fallback internals for real LLM, DB, Chroma, and camera logic without breaking frontend.

Person
Owns
Must not own
Person A: You
Expo app, UI/UX, screens, navigation, demo flow, component library, state wiring, API client, final rehearsal.
Backend database schema, LLM prompt internals, Chroma setup, Python service debugging.
Person B: Friend
FastAPI backend, LLM, SQLite, ChromaDB, Pydantic schemas, memory retrieval, game APIs, safety router, fallback.py.
Screen design, layout polish, navigation design, animation polish, final demo UI decisions.

Shared boundary
Rule
API schemas
Both agree once in Phase 1. After that, do not rename fields unless both update together.
Demo scenario
Only one primary scenario is sacred: “I’ll never finish this assignment. I always mess up before exams.”
Fallbacks
Backend provides fallback JSON, frontend does not invent different local data shapes.
Git branches
Each person works on separate folders and branches. Merge only at phase checkpoints.
Integration
Frontend can continue using mock/fallback API responses while backend makes internals real.


# 3. Repository and Folder Structure

anima-link/  frontend/                     # Person A    app/      onboarding/      tabs/      games/      reports/    components/    services/    constants/    types/  backend/                      # Person B    main.py    app/      routes/      services/      models/      data/    requirements.txt    .env.example  docs/    API_CONTRACT.md    BUILD_LOG_PERSON_A.md    BUILD_LOG_PERSON_B.md    DEMO_SCRIPT.md  README.md

## 3.1 Branching plan

Branch
Who
Purpose
main
Both
Only stable integrated code.
frontend/phase-ui
You
Expo screens, components, navigation, API client.
backend/phase-ai-memory
Friend
FastAPI, SQLite, Chroma, LLM, APIs.
integration/demo-flow
Both
Short-lived branch for joining frontend + backend before final merge.

Git discipline
Before starting: git pull. Work only in your branch. Commit at the end of each phase. Merge to integration/demo-flow only when /health and the current phase endpoint works.


# 4. API Contracts First

This is what prevents both of you from blocking each other. Person B creates these routes early, even if they initially return fallback JSON. Person A connects the frontend to these routes immediately.
Endpoint
Owner
Frontend use
Phase
GET /health
Friend
Connection badge on app/debug screen
1
POST /memory/add
Friend
Save thought-pairs, tiny wins, session memories
2
POST /memory/search
Friend
Show recalled memories in Chat and Memory Core
2
GET /memory/graph
Friend
Thought Graph / Memory Museum
9
POST /analyze-message
Friend
Chat analysis, Voice Room transcript analysis
3
POST /characters/route
Friend
Companion Council recommended path
4
POST /games/thought-monster/start
Friend
Thought Monster screen
5
POST /games/thought-monster/complete
Friend
Store final reframe
5
POST /camera/analyze-workspace
Friend
Camera Mission labels
6
POST /games/focus-boss/create
Friend
Focus Boss plan
7
POST /tiny-win/store
Friend
Tiny Win proof and graph update
8
GET /reports/weekly
Friend
Report page
10
POST /safety/check
Friend
Safety routing before LLM where needed
10
POST /voice/route-spell
Friend
Voice Spell typed/audio route
11


# 5. Detailed Phase Plan


## Phase 1: Foundation and connectivity (0:00-0:30)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Create Expo project inside frontend/.• Install expo-router, AsyncStorage, Expo Camera, Expo AV, lucide icons.• Create tabs: Home, Chat, Missions, Memory, Safety.• Create services/api.ts with BASE_URL from a constant.• Create debug connection card on Home.
• Create FastAPI backend inside backend/.• Install fastapi, uvicorn, pydantic, python-dotenv, sqlalchemy, chromadb, sentence-transformers, requests/google-genai.• Create GET /health returning backend, llm_configured, sqlite_connected, chroma_connected.• Create .env.example and requirements.txt.• Run backend on 0.0.0.0:8000 and expose to phone via local IP/ngrok.
Expo app calls /health successfully from phone.


## Phase 2: Database and memory foundation (0:30-1:30)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Memory Core screen with search bar, category cards, memory list, and empty graph placeholder.• Build API methods: addMemory, searchMemory, getAllMemory, getGraph.• Create UI states: loading, empty, results, error.
• Create SQLite tables: messages, analyses, memories, thought_pairs, tiny_wins, character_feedback, game_events, reports.• Create Chroma collection anima_memories.• Seed 8-12 demo memories: exam stress, meeting anxiety, focus win, thought-pair, tiny win, presentation fear.• Implement /memory/add, /memory/search, /memory/all.• If Chroma fails, implement SQLite keyword/tag search with same response shape.
Searching “exam stress” returns the April 12 exam memory in frontend.


## Phase 3: Real LLM message analysis (1:30-2:30)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Chat screen: message list, input, quick mode buttons, analysis badge card, memory recall card, recommended path card.• Connect message submit to POST /analyze-message.• Show structured analysis and next action buttons: Battle Thought, Start Breathing, Open Focus Boss, Recall Past Proof, Switch Character.
• Create LLM JSON service with retry + Pydantic validation.• Implement /analyze-message flow: safety pre-check -> save message -> LLM analysis -> memory search -> store analysis -> return analysis + memories.• Return fields: emotion, msi_score, msi_label, absolutist_words, distortion, trigger, intent, recommended_path, memory_query, suggested_game, safe_response.• Add fallback.py only after LLM invalid JSON twice or timeout.
Demo sentence returns High Strain, never/always, Overgeneralization, April 12 memory, Kael->Nova->Arlo.


## Phase 4: Companion Council and adaptive routing (2:30-3:05)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Companion Council page with five character cards and recommended path visualization.• Add “Start recommended path” and “Choose manually”.• Show one line from each character.
• Implement /characters/route using analysis + memory results.• Routing: High Strain -> Kael, distortion -> Nova, action needed -> Arlo, low energy -> Sera, overwhelm/acceptance -> Zen.• Store optional character feedback endpoint later if time.
Chat analysis opens Council with Kael -> Nova -> Arlo and reason.


## Phase 5: Thought Monster Battle (3:05-4:10)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Thought Monster UI: monster spawn, HP bar, rounds, memory proof, answer buttons/input, final reframe, reward card.• Connect start to /games/thought-monster/start.• Connect completion to /games/thought-monster/complete.• After complete, navigate to Camera Mission or Focus Boss.
• Implement /games/thought-monster/start using message analysis + memory results + LLM CBT generator.• Implement /games/thought-monster/complete: store thought_pair in SQLite and Chroma.• Return monster_name, trigger_words, weakness, guide, rounds, final_reframe, reward.• Fallback uses generic CBT template but user thought remains real.
Never-Finish Beast appears, user completes CBT rounds, reframe stored as memory.


## Phase 6: Camera Missions (4:10-5:10)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Camera Mission screen: Take Photo / Pick Image, preview, Analyze Workspace, object labels, recommended mission, Start Focus Boss button.• Display game labels: Distraction Goblin, Focus Portal, Health Potion, Boss Gate.• Keep UI polished even if camera permissions are messy.
• Implement /camera/analyze-workspace: accept image_base64 and mode.• Call vision LLM if available; return JSON only.• Prompt must not analyze face or diagnose emotion; only workspace objects.• Add sample JSON fallback with same shape for API failure.
Real or selected image returns workspace object labels and mission recommendation.


## Phase 7: Focus Boss Fight (5:10-5:45)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Focus Boss UI: boss card, HP, battle plan checklist, timer, Arlo messages, completion screen.• HP changes as steps complete.• Route to Tiny Win after completion.
• Implement /games/focus-boss/create using goal, linked thought, and camera objects.• Return boss_name, main_task, tiny_step, estimated_time_minutes, battle_plan, character.• Store game_event in SQLite.
Deadline Demon plan is generated and timer/checklist works.


## Phase 8: Tiny Win Proof (5:45-6:10)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Tiny Win screen: choose completed action, optional proof image, link to thought, store proof, reward card.• After storage, navigate to Memory Graph.
• Implement /tiny-win/store: save in SQLite, add Chroma memory, update graph data, return artifact and graph_updates.• No hardcoding needed here; this is simple and should be real.
Tiny Win Crystal is stored as proof against “I never finish”.


## Phase 9: Thought Graph and Memory Museum (6:10-6:30)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build card-based graph first: Exam Stress -> Never-Finish Beast -> Overgeneralization -> Nova Reframe -> Arlo Sprint -> Tiny Win -> Proof Memory.• Show rooms: Storm Cave, Focus Forest, Proof Mountain, Breakthrough Gallery.• Use latest graph endpoint data.
• Implement /memory/graph using SQLite + Chroma metadata.• Return nodes and edges. If graph generation is incomplete, return deterministic graph from stored session events.
Graph updates after Tiny Win; user can see the journey.


## Phase 10: Reports, privacy, safety (6:30-6:45)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Report screen with MSI peak, trigger, distortion, interventions, breakthrough, tiny wins.• Build Privacy/Safety screen with toggles and transparency labels.• Build Offline/SOS preview screen if time.
• Implement /reports/weekly from SQLite.• Implement /safety/check with deterministic route before LLM.• Return LLM bypass, breathing reset, privacy flags, memory snippets used.
Report summarizes the session and Safety screen shows deterministic LLM bypass design.


## Phase 11: Voice Room and extra games (6:45-7:00)

You: Person A / Frontend
Friend: Person B / Backend
Checkpoint
• Build Voice Room UI and Voice Spell UI.• Typed transcript fallback is acceptable; voice recording can be attempted if Expo AV is stable.• Route spell commands to game screens.
• Implement /voice/route-spell using exact phrase matching first, LLM fallback second.• If actual speech-to-text is not stable, accept transcript text and run real /analyze-message.
“Anima, battle this thought” routes to Thought Monster. Voice intelligence uses real backend even if recording falls back.


# 6. Key JSON Contracts

These shapes should go into docs/API_CONTRACT.md and should not change without telling each other.

## 6.1 /analyze-message response

{  "analysis_id": "ana_001",  "message_id": "msg_001",  "emotion": "high_stress",  "msi_score": 82,  "msi_label": "High Strain",  "absolutist_words": ["never", "always"],  "distortion": "overgeneralization",  "trigger": "exam_assignment_pressure",  "intent": "needs_cbt_support",  "recommended_path": ["Kael", "Nova", "Arlo"],  "memory_query": ["exam stress", "assignment", "never finish"],  "suggested_game": "thought_monster_battle",  "safe_response": "You used 'never' and 'always'. Before we believe that thought, let's test it.",  "memory_results": [    {      "id": "mem_exam_001",      "title": "April 12 exam week",      "summary": "You completed one section after starting small.",      "trigger": "exam stress",      "reframe": "I can start with one section."    }  ]}

## 6.2 /games/thought-monster/start response

{  "monster_name": "Never-Finish Beast",  "monster_type": "Overgeneralization",  "trigger_words": ["never", "always"],  "weakness": "Evidence Check",  "guide": "Nova",  "hp": 100,  "rounds": [    {"title": "Detect the Trick", "question": "What is this thought trying to make you believe?"},    {"title": "Evidence Check", "question": "What evidence does not fully support the word 'never'?"},    {"title": "Memory Proof", "question": "What past moment shows this was not completely true?"},    {"title": "Tiny Step", "question": "What is one action under 5 minutes?"}  ],  "final_reframe_suggestion": "I do not need to finish everything right now. I can start with one section.",  "reward": "Reality Sword"}

## 6.3 /camera/analyze-workspace response

{  "scene_type": "workspace",  "objects": [    {"name": "phone", "confidence": "likely", "game_label": "Distraction Goblin", "category": "distraction"},    {"name": "notebook", "confidence": "likely", "game_label": "Focus Portal", "category": "focus"},    {"name": "water bottle", "confidence": "likely", "game_label": "Health Potion", "category": "grounding"},    {"name": "assignment sheet", "confidence": "unclear", "game_label": "Boss Gate", "category": "task"}  ],  "recommended_mission": "Move one distraction away and open the focus object."}

# 7. How to Work Without Blocking Each Other

Problem
Solution
Frontend waits for backend
Friend creates endpoint stubs with correct JSON in first 30 minutes. You build against those endpoints immediately. Internals become real later.
Backend breaks field names
All API contracts live in docs/API_CONTRACT.md. If a field changes, both update in the same integration checkpoint.
Both editing same files
You work in frontend/ only. Friend works in backend/ only. Shared docs are edited only during checkpoints.
Merge conflicts
Commit at every phase. Merge only phase-tested work into integration/demo-flow. Do not merge half-working rewrites.
Demo failure due to API timeout
Backend fallback.py returns same schema. Frontend shows stable UI.
Camera/voice instability
Keep typed transcript and image picker path ready. The intelligence still runs through real backend.
Too much feature chasing
Only build features that support the main demo backbone first. Extra games come after Thought Graph works.

Communication rhythm
Every 30 minutes: stop for 3 minutes. Person A says which screen is ready and which endpoint is needed next. Person B says which endpoint is real, which is fallback, and what field names changed. Then continue.


# 8. Phase Checklists


## Person A checklist

☐ Expo Go opens the app
☐ Tabs work
☐ Home looks polished
☐ Chat sends real API request
☐ Analysis badges render
☐ Memory screen renders backend data
☐ Companion route displays
☐ Thought Monster screen works
☐ Camera mission screen accepts image
☐ Focus Boss timer works
☐ Tiny Win proof stores
☐ Thought Graph updates
☐ Report/Safety screens are present
☐ Demo flow rehearsed twice

## Person B checklist

☐ FastAPI runs
☐ /health works from phone
☐ SQLite initialized
☐ Chroma initialized or SQLite fallback ready
☐ Seed memories loaded
☐ /memory/search works
☐ LLM JSON client works
☐ /analyze-message validates with Pydantic
☐ /characters/route works
☐ /games/thought-monster/start works
☐ /games/thought-monster/complete stores memory
☐ /camera/analyze-workspace works or fallback active
☐ /games/focus-boss/create works
☐ /tiny-win/store works
☐ /memory/graph works
☐ /reports/weekly works
☐ fallback.py covers all major endpoints

# 9. Fallback Rules

Fallbacks are not the starting point. They are a demo safety net. Each fallback must preserve the same schema as the proper endpoint.
If this fails
First fix attempt
Allowed fallback
LLM invalid JSON
Retry once with stricter JSON-only prompt
Return fallback_analysis from fallback.py
LLM timeout
Reduce prompt/context length and retry
Return fallback JSON with same schema
Chroma import/runtime issue
Use existing SQLite memories
SQLite keyword/tag retrieval
Expo camera permission issue
Use image picker
Upload sample image or sample JSON
Voice recording issue
Use typed transcript
Still send transcript to real /analyze-message
Graph endpoint slow
Build graph from SQLite latest session
Frontend uses latest local event state
ngrok/local IP fails
Same Wi-Fi local IP, restart backend
Use laptop web preview for demo


# 10. Final Demo Script

Open Home. Show Anima State, companion, suggested mission, and Memory preview.
Go to Chat. Type: “I’ll never finish this assignment. I always mess up before exams.”
Explain: backend runs LLM structured analysis and memory search.
Show High Strain, never/always, overgeneralization, April 12 memory, Kael -> Nova -> Arlo.
Open Companion Council. Show five characters and recommended path.
Start Thought Monster Battle. Show Never-Finish Beast and CBT rounds.
Complete battle. Store reframe: “I can start with one section.”
Open Camera Mission. Scan/select workspace image. Show objects mapped to game labels.
Start Focus Boss. Show Deadline Demon, timer, HP, and checklist.
Complete Tiny Win. Store Tiny Win Crystal as proof against “I never finish.”
Open Thought Graph. Show Exam Stress -> Monster -> Reframe -> Sprint -> Tiny Win -> Proof Memory.
Open Report/Safety. Show MSI peak, trigger, distortion, intervention, breakthrough, privacy toggles, and LLM bypass safety design.

# 11. What to Avoid

Do not start with CBT Arena, NPC Practice, or Mood Quest before Chat -> Thought Monster -> Focus Boss -> Tiny Win -> Graph works.
Do not let frontend invent local-only data shapes that backend does not return.
Do not make backend return plain paragraphs where frontend expects JSON.
Do not claim full HIPAA/GDPR compliance or medical-grade sensing. Use “inspired by”, “prototype”, and “deterministic safety routing”.
Do not spend the last 30 minutes adding features. Spend it stabilizing the demo.
Success definition
By the end, the app should prove one complete loop: the user expresses a thought, the system understands it, remembers context, restructures the thought, turns action into a mission, stores proof, updates the memory graph, and shows safe/privacy-aware reporting.
