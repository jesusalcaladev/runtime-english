import { useEffect, useState } from "preact/hooks";
import { getKokoroStatus, subscribeKokoroStatus, type KokoroStatus } from "../lib/speech";

export function useKokoroStatus(): KokoroStatus {
  const [kokoro, setKokoro] = useState<KokoroStatus>(() => getKokoroStatus());
  useEffect(() => subscribeKokoroStatus(setKokoro), []);
  return kokoro;
}
