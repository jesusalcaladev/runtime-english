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
  audio?: string;
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

/** Dictation/listening: audio (or text TTS) is played and the user types what they hear. */
export interface ListenExercise {
  id: string;
  type: "listen";
  prompt: string;
  audioText: string;
  answer: string;
  accept?: string[];
  hint?: string;
  explanation: string;
}

/** Speaking practice: the user pronounces the phrase and it is compared using speech recognition. */
export interface SpeakExercise {
  id: string;
  type: "speak";
  prompt: string;
  answer: string;
  accept?: string[];
  hint?: string;
  explanation: string;
}

/** Fill in blanks in context. Use ___ (three underscores) for each blank in `template`. */
export interface FillBlankExercise {
  id: string;
  type: "fill-blank";
  prompt: string;
  template: string;
  blanks: string[]; // respuesta(s) correcta(s) en orden; usar | para alternativas en un hueco
  hint?: string;
  explanation: string;
}

/** Put dialogue lines in order. */
export interface DialogueOrderExercise {
  id: string;
  type: "dialogue-order";
  prompt: string;
  lines: string[]; // líneas en orden correcto
  explanation: string;
}

/** Correct an error in a sentence. */
export interface FixErrorExercise {
  id: string;
  type: "fix-error";
  prompt: string;
  sentence: string; // frase con el error
  answer: string; // frase corregida
  accept?: string[];
  hint?: string;
  explanation: string;
}

/** Guided role-play: the user responds in context (open answer with a reference). */
export interface RoleplayExercise {
  id: string;
  type: "roleplay";
  prompt: string;
  scenario: string;
  goal: string;
  answer: string;
  accept?: string[];
  hint?: string;
  explanation: string;
}

export type Exercise =
  | ChoiceExercise
  | BuilderExercise
  | WriteExercise
  | ListenExercise
  | SpeakExercise
  | FillBlankExercise
  | DialogueOrderExercise
  | FixErrorExercise
  | RoleplayExercise;

export interface Session {
  id: string;
  slug: string;
  title: string;
  step: string;
  cefr: Cefr;
  /** Duración estimada en minutos. Si se omite, se calcula automáticamente del contenido. */
  minutes?: number;
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
