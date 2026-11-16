import { isNativePlatform } from './speech/platform'
import { emitToast } from './toast'

/** Best-effort deep link into the Android app settings. Returns true if a link was opened. */
export async function openAppSettings(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (!isNativePlatform()) {
    emitToast('En web, ajusta los permisos desde la configuración del navegador/sitio.', 'info')
    return false
  }

  const urls = [
    'app-settings:',
    'intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:com.runtimeenglish.core;end',
    'package:com.runtimeenglish.core',
  ]
  let opened = false
  for (const url of urls) {
    try {
      window.location.href = url
      opened = true
      break
    } catch {}
  }

  if (!opened) {
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url: 'https://support.google.com/android/answer/9431959' })
      opened = true
    } catch {}
  }

  if (!opened) {
    emitToast(
      'No se pudo abrir Ajustes automáticamente. Ve a Ajustes del sistema > Apps > RuntimeEnglish > Permisos.',
      'error',
    )
  } else {
    emitToast('Abre la sección de permisos de la app y activa los que falten.', 'info')
  }

  return opened
}
