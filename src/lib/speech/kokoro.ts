import type { KokoroStatus } from "./types";

const UNAVAILABLE_MESSAGE = "La voz HQ (Kokoro) no está incluida en esta versión para reducir el tamaño de la app.";

const unavailableStatus: KokoroStatus = {
  state: "error",
  progress: 0,
  message: UNAVAILABLE_MESSAGE,
  device: null,
  error: "No disponible en esta versión.",
};

const listeners = new Set<(status: KokoroStatus) => void>();

export function getPreferredKokoroChunkSize(): number {
  return 120;
}

export function getKokoroStatus(): KokoroStatus {
  return unavailableStatus;
}

export function subscribeKokoroStatus(listener: (status: KokoroStatus) => void): () => void {
  listeners.add(listener);
  try {
    listener(unavailableStatus);
  } catch {}
  return () => listeners.delete(listener);
}

export function kokoroIsCached(): boolean {
  return false;
}

export function isKokoroReady(): boolean {
  return false;
}

export function isKokoroLoading(): boolean {
  return false;
}

export function canAutoLoadKokoroInBackground(): boolean {
  return false;
}

export function markKokoroAutoInitStarted(): void {
  // no-op
}

export function stopKokoroPlayback(): void {
  // no-op
}

export async function loadKokoro(): Promise<boolean> {
  for (const listener of listeners) {
    try {
      listener(unavailableStatus);
    } catch {}
  }
  return false;
}

export function maybeWarmKokoroInBackground(): void {
  // no-op
}

export async function speakWithKokoro(_text: string, _button?: HTMLElement | null): Promise<boolean> {
  return false;
}
