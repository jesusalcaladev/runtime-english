import { useStore } from "@nanostores/preact";
import { useEffect } from "preact/hooks";
import type { SyncStatus } from "../lib/progressSync";
import { initSyncStatusStore, syncStatusAtom } from "../lib/stores";

export function useSyncStatus(): SyncStatus {
  useEffect(() => {
    initSyncStatusStore();
  }, []);
  return useStore(syncStatusAtom);
}
