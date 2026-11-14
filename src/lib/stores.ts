import { atom } from "nanostores";
import { getSyncStatus, type SyncStatus, subscribeSyncStatus } from "./progressSync";

function defaultSyncStatus(): SyncStatus {
  try {
    return getSyncStatus();
  } catch {
    return {
      userId: null,
      lastSyncedAt: null,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastError: null,
      lastRemoteUpdatedAt: null,
      pending: false,
      retryCount: 0,
      nextRetryAt: null,
      history: [],
      conflictCount: 0,
      phase: "idle",
      online: true,
      configured: false,
    } as SyncStatus;
  }
}

export const syncStatusAtom = atom<SyncStatus>(defaultSyncStatus());

let initialized = false;
let cleanup: (() => void) | null = null;

export function initSyncStatusStore(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  if (!initialized) {
    initialized = true;
    try {
      syncStatusAtom.set(getSyncStatus());
      cleanup = subscribeSyncStatus((status) => {
        syncStatusAtom.set(status);
      });
    } catch {
      cleanup = null;
    }
  }
  return () => {
    // Keep shared subscription alive across hook consumers.
  };
}
