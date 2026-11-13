export type Level = "A1-A2" | "B1-B2";
export type Cefr = "A1" | "A2" | "B1" | "B2";

export interface VocabItem {
  en: string;
  es: string;
  example?: string;
  note?: string;
}

export type ContentBlock =
  | { type: "technique"; name: string; desc: string }
  | { type: "text"; title?: string; body: string }
  | { type: "vocab"; title?: string; items: VocabItem[] }
  | { type: "table"; title?: string; columns: string[]; rows: string[][] }
  | { type: "phrases"; title?: string; items: { en: string; es: string }[] }
  | {
      type: "tenses";
      items: { name: string; tag: string; formula: string; cases: string[] }[];
    }
  | { type: "slang"; title?: string; ids: string[] }
  | {
      type: "callout";
      tone: "tip" | "warning" | "info";
      title: string;
      body: string;
    };

export interface ChoiceExercise {
  id: string;
  type: "choice";
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface BuilderExercise {
  id: string;
  type: "builder";
  prompt: string;
  words: string[];
  answer: string;
  explanation: string;
}

export interface WriteExercise {
  id: string;
  type: "write";
  prompt: string;
  answer: string;
  accept?: string[];
  hint?: string;
  explanation: string;
}

export type Exercise = ChoiceExercise | BuilderExercise | WriteExercise;

export interface Session {
  id: string;
  slug: string;
  title: string;
  step: string;
  cefr: Cefr;
  minutes: number;
  summary: string;
  objectives: string[];
  blocks: ContentBlock[];
  pronunciation?: string;
  exercises: Exercise[];
}

export interface Module {
  id: string;
  code: string;
  level: Level;
  title: string;
  shortTitle: string;
  description: string;
  featured?: boolean;
  sessions: Session[];
}

export interface SlangEntry {
  id: string;
  term: string;
  category: "ai" | "dev" | "work" | "internet";
  register: "profesional" | "casual" | "meme";
  status: "consolidado" | "en alza" | "2026";
  meaningEs: string;
  meaningEn: string;
  example: string;
  exampleEs: string;
  updated: string;
  caution?: string;
}
