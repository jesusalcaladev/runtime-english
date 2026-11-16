import {
  Headphones,
  ListOrdered,
  MessageSquare,
  Mic,
  MousePointerClick,
  PenLine,
  Wand2,
} from 'lucide-preact'
import type { Exercise } from '../../../lib/types'

export function ExerciseTypeIcon({ type }: { type: Exercise['type'] }) {
  if (type === 'choice') return <MousePointerClick class="h-4 w-4" />
  if (type === 'builder') return <ListOrdered class="h-4 w-4" />
  if (type === 'write') return <PenLine class="h-4 w-4" />
  if (type === 'listen') return <Headphones class="h-4 w-4" />
  if (type === 'speak') return <Mic class="h-4 w-4" />
  if (type === 'fill-blank') return <Wand2 class="h-4 w-4" />
  if (type === 'dialogue-order') return <MessageSquare class="h-4 w-4" />
  if (type === 'fix-error') return <PenLine class="h-4 w-4" />
  if (type === 'roleplay') return <MessageSquare class="h-4 w-4" />
  return <PenLine class="h-4 w-4" />
}
