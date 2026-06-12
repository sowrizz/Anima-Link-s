import { randomUUID } from "crypto";

export interface Memory {
  id: string;
  user_id: string;
  memory_type: string;
  title: string;
  summary: string;
  content: string;
  emotion: string;
  trigger: string;
  distortion: string;
  reframe: string;
  character: string;
  intervention: string;
  importance: number;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  message_id: string;
  emotion: string;
  msi_score: number;
  msi_label: string;
  distortion: string;
  trigger: string;
  absolutist_words: string[];
  recommended_path: string[];
  suggested_game: string;
  safe_response: string;
  created_at: string;
}

export interface ThoughtPair {
  id: string;
  user_id: string;
  original_thought: string;
  reframe: string;
  distortion: string;
  trigger: string;
  character: string;
  created_at: string;
}

export interface TinyWin {
  id: string;
  user_id: string;
  proof_type: string;
  completed_action: string;
  linked_thought: string;
  counter_evidence: string;
  character: string;
  created_at: string;
}

export interface GameEvent {
  id: string;
  user_id: string;
  game_type: string;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
}

const DEMO_MEMORIES: Memory[] = [
  {
    id: "mem_exam_001",
    user_id: "demo_user",
    memory_type: "thought_pair",
    title: "April 12 exam week",
    summary: "You completed one section after starting small.",
    content: "I always mess up before exams. Nova helped reframe this with evidence check. Started with one paragraph and finished the section.",
    emotion: "high_stress",
    trigger: "exam stress",
    distortion: "overgeneralization",
    reframe: "I can start with one section and build from there.",
    character: "Nova",
    intervention: "CBT reframe + evidence check",
    importance: 9,
    created_at: "2026-04-12T20:30:00Z",
  },
  {
    id: "mem_meeting_002",
    user_id: "demo_user",
    memory_type: "session",
    title: "Pre-meeting anxiety",
    summary: "Breathing reset before the presentation worked.",
    content: "Anxious before team meeting. Used Kael grounding technique. Meeting went fine.",
    emotion: "mild_anxiety",
    trigger: "meeting anxiety",
    distortion: "catastrophizing",
    reframe: "I have prepared well and I know this material.",
    character: "Kael",
    intervention: "grounding + breathing",
    importance: 7,
    created_at: "2026-04-18T09:00:00Z",
  },
  {
    id: "mem_focus_003",
    user_id: "demo_user",
    memory_type: "tiny_win",
    title: "Focus win: completed 3 problems",
    summary: "5-minute sprint with Arlo broke the procrastination loop.",
    content: "Stuck for 40 mins. Arlo suggested 5-minute sprint. Completed 3 problems in 20 mins after.",
    emotion: "low_energy",
    trigger: "focus friction",
    distortion: "all-or-nothing thinking",
    reframe: "Starting small breaks the block every time.",
    character: "Arlo",
    intervention: "5-minute focus sprint",
    importance: 8,
    created_at: "2026-05-02T15:00:00Z",
  },
  {
    id: "mem_reframe_004",
    user_id: "demo_user",
    memory_type: "thought_pair",
    title: "Never finish → Started small",
    summary: "Evidence check defeated the overgeneralization pattern.",
    content: "Original thought: I never finish anything. Reframe: I finish things when I break them into steps.",
    emotion: "high_stress",
    trigger: "assignment pressure",
    distortion: "overgeneralization",
    reframe: "I finish things when I break them into steps.",
    character: "Nova",
    intervention: "thought monster battle",
    importance: 9,
    created_at: "2026-05-08T21:00:00Z",
  },
  {
    id: "mem_win_005",
    user_id: "demo_user",
    memory_type: "tiny_win",
    title: "Proof: Finished section under pressure",
    summary: "Counter-evidence against never-finish belief.",
    content: "Despite high stress, completed Section 1 of assignment before midnight. This is proof the never-finish thought is distorted.",
    emotion: "recovery",
    trigger: "exam deadline",
    distortion: "overgeneralization",
    reframe: "I do finish when I start small.",
    character: "Arlo",
    intervention: "tiny win proof",
    importance: 10,
    created_at: "2026-05-09T00:30:00Z",
  },
  {
    id: "mem_sera_006",
    user_id: "demo_user",
    memory_type: "character_feedback",
    title: "Sera helped process low-energy day",
    summary: "Emotional mirroring reduced spiral intensity.",
    content: "Low motivation, felt empty. Sera reflected feelings without pushing. Helped break the shame loop.",
    emotion: "low_energy",
    trigger: "low energy",
    distortion: "emotional reasoning",
    reframe: "Low energy days are part of the rhythm, not proof of failure.",
    character: "Sera",
    intervention: "emotional mirroring",
    importance: 6,
    created_at: "2026-05-14T18:00:00Z",
  },
  {
    id: "mem_present_007",
    user_id: "demo_user",
    memory_type: "session",
    title: "Presentation fear before class",
    summary: "Zen acceptance + Kael grounding combo worked.",
    content: "Fear of presenting to class. Catastrophizing about embarrassment. Used Zen acceptance then Kael grounding.",
    emotion: "high_stress",
    trigger: "presentation fear",
    distortion: "catastrophizing",
    reframe: "The presentation is one moment, not a measure of my worth.",
    character: "Zen",
    intervention: "acceptance + grounding",
    importance: 7,
    created_at: "2026-05-20T10:00:00Z",
  },
  {
    id: "mem_zen_008",
    user_id: "demo_user",
    memory_type: "session",
    title: "Overwhelm spiral stopped",
    summary: "Slowing down broke the overwhelm loop.",
    content: "Three deadlines at once. Mind racing. Zen slowdown technique: one breath, one task, one moment.",
    emotion: "overwhelm",
    trigger: "multiple deadlines",
    distortion: "magnification",
    reframe: "I can only do one thing at a time, and that is enough.",
    character: "Zen",
    intervention: "mindfulness slowdown",
    importance: 8,
    created_at: "2026-05-25T14:00:00Z",
  },
];

const memories: Map<string, Memory> = new Map(
  DEMO_MEMORIES.map((m) => [m.id, m])
);
const messages: Map<string, Message> = new Map();
const analyses: Map<string, Analysis> = new Map();
const thoughtPairs: Map<string, ThoughtPair> = new Map();
const tinyWins: Map<string, TinyWin> = new Map();
const gameEvents: Map<string, GameEvent> = new Map();

export const store = {
  memories: {
    add(mem: Omit<Memory, "id" | "created_at">): Memory {
      const id = "mem_" + randomUUID().slice(0, 8);
      const created_at = new Date().toISOString();
      const full: Memory = { id, created_at, ...mem };
      memories.set(id, full);
      return full;
    },
    getAll(): Memory[] {
      return Array.from(memories.values()).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    search(query: string, category?: string): Memory[] {
      const q = query.toLowerCase();
      const keywords = q.split(/\s+/);
      return Array.from(memories.values())
        .filter((m) => {
          const searchable = [
            m.title,
            m.content,
            m.trigger,
            m.emotion,
            m.distortion,
            m.reframe,
            m.character,
            m.memory_type,
          ]
            .join(" ")
            .toLowerCase();
          const matchesQuery = keywords.some((kw) => searchable.includes(kw));
          const matchesCategory = !category || searchable.includes(category.toLowerCase());
          return matchesQuery && matchesCategory;
        })
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5);
    },
  },

  messages: {
    add(msg: Omit<Message, "id" | "created_at">): Message {
      const id = "msg_" + randomUUID().slice(0, 8);
      const created_at = new Date().toISOString();
      const full: Message = { id, created_at, ...msg };
      messages.set(id, full);
      return full;
    },
    getAll(): Message[] {
      return Array.from(messages.values());
    },
  },

  analyses: {
    add(a: Omit<Analysis, "id" | "created_at">): Analysis {
      const id = "ana_" + randomUUID().slice(0, 8);
      const created_at = new Date().toISOString();
      const full: Analysis = { id, created_at, ...a };
      analyses.set(id, full);
      return full;
    },
    getAll(): Analysis[] {
      return Array.from(analyses.values());
    },
  },

  thoughtPairs: {
    add(tp: Omit<ThoughtPair, "id" | "created_at">): ThoughtPair {
      const id = "tp_" + randomUUID().slice(0, 8);
      const created_at = new Date().toISOString();
      const full: ThoughtPair = { id, created_at, ...tp };
      thoughtPairs.set(id, full);
      return full;
    },
    getAll(): ThoughtPair[] {
      return Array.from(thoughtPairs.values());
    },
  },

  tinyWins: {
    add(tw: Omit<TinyWin, "id" | "created_at">): TinyWin {
      const id = "tw_" + randomUUID().slice(0, 8);
      const created_at = new Date().toISOString();
      const full: TinyWin = { id, created_at, ...tw };
      tinyWins.set(id, full);
      return full;
    },
    getAll(): TinyWin[] {
      return Array.from(tinyWins.values());
    },
  },

  gameEvents: {
    add(ge: Omit<GameEvent, "id" | "created_at">): GameEvent {
      const id = "ge_" + randomUUID().slice(0, 8);
      const created_at = new Date().toISOString();
      const full: GameEvent = { id, created_at, ...ge };
      gameEvents.set(id, full);
      return full;
    },
    getAll(): GameEvent[] {
      return Array.from(gameEvents.values());
    },
  },
};
