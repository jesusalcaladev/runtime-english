import { useEffect, useState } from "preact/hooks";
import type { ProgressState } from "./progress";
import { progressStore } from "./progress";

export function useProgress(): ProgressState {
  const [state, setState] = useState<ProgressState>(() => progressStore.getState());

  useEffect(() => progressStore.subscribe(setState), []);

  return state;
}
