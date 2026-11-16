import { useEffect, useState } from 'preact/hooks'
import { getKokoroStatus, type KokoroStatus, subscribeKokoroStatus } from '../lib/speech'

export function useKokoroStatus(): KokoroStatus {
  const [kokoro, setKokoro] = useState<KokoroStatus>(() => getKokoroStatus())
  useEffect(() => subscribeKokoroStatus(setKokoro), [])
  return kokoro
}
