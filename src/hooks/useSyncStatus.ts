import { useEffect, useState } from "preact/hooks";
import { getSyncStatus, subscribeSyncStatus, type SyncStatus } from "../lib/progressSync";

export function useSyncStatus(): SyncStatus {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    try {
      return getSyncStatus();
    } catch {
      return { phase: "idle", pending: false, lastSyncedAt: null, lastError: null, nextRetryAt: null, history: [] } as any;
    }
  });

  useEffect(() => {
    try {
      return subscribeSyncStatus(setSyncStatus);
    } catch {
      return;
    }
  }, []);

  return syncStatus;
}
