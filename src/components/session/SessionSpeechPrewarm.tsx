import { useEffect } from 'preact/hooks'
import { warmSessionPhrases } from '../../lib/speech'

/** Invisible island: prepares the lesson's phrases with the active TTS engine. */
export default function SessionSpeechPrewarm({ texts }: { texts: string[] }) {
  useEffect(() => {
    warmSessionPhrases(texts)
  }, [texts])

  return null
}
