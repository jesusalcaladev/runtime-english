import { getUiStage, type UiStage } from '../lib/i18n'
import { useProgress } from '../lib/useProgress'

/** Etapa de interfaz (es / mixed / en) derivada del progreso del usuario. */
export function useUiStage(): UiStage {
  return getUiStage(useProgress())
}
