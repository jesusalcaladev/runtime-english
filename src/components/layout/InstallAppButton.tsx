import { useEffect, useMemo, useState } from "preact/hooks";
import { Download, Share } from "lucide-preact";
import { route } from "../../lib/routes";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  try {
    return typeof cap?.isNativePlatform === "function" && cap.isNativePlatform();
  } catch {
    return false;
  }
}

export default function InstallAppButton() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone() || isNativeApp()) {
      setHidden(true);
      return;
    }
    const ua = window.navigator.userAgent || "";
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    setPlatform(isiOS ? "ios" : isAndroid ? "android" : "other");

    const onBip = (e: any) => {
      e.preventDefault?.();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const apkUrl = useMemo(() => route("/runtimeenglish.apk"), []);

  if (hidden) return null;

  if (platform === "android") {
    return (
      <a
        href={apkUrl}
        download="RuntimeEnglish.apk"
        class="surface-soft hidden h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content sm:inline-flex"
        title="Descargar APK para Android"
        aria-label="Descargar APK"
      >
        <Download class="h-3.5 w-3.5" />
        <span>Descargar APK</span>
      </a>
    );
  }

  if (platform === "ios") {
    return (
      <div class="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          class="surface-soft inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content"
          aria-label="Instalar app"
          title="Instalar app (PWA)"
        >
          <Download class="h-3.5 w-3.5" />
          <span>Instalar app</span>
        </button>
        {open && (
          <div class="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-base-content/10 bg-base-100 p-3 text-left shadow-xl">
            <p class="text-xs font-semibold text-base-content">Instalar en iPhone/iPad</p>
            <ol class="mt-2 space-y-1.5 text-[11px] leading-relaxed text-base-content/70">
              <li class="flex items-start gap-2"><span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded bg-base-200 text-[10px]">1</span><span>Toca <Share class="inline h-3 w-3" /> <strong>Compartir</strong> en Safari.</span></li>
              <li class="flex items-start gap-2"><span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded bg-base-200 text-[10px]">2</span><span>Elige <strong>“Añadir a pantalla de inicio”</strong>.</span></li>
              <li class="flex items-start gap-2"><span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded bg-base-200 text-[10px]">3</span><span>Confirma para instalar la app (PWA).</span></li>
            </ol>
            <button type="button" onClick={() => setOpen(false)} class="mt-3 w-full rounded-xl bg-base-200 px-3 py-1.5 text-[11px] font-medium hover:bg-base-300">Entendido</button>
          </div>
        )}
      </div>
    );
  }

  // Other platforms: offer PWA install if available, else APK link as fallback
  if (deferred) {
    return (
      <button
        type="button"
        onClick={async () => {
          try {
            deferred.prompt();
            await deferred.userChoice;
          } catch {}
          setDeferred(null);
        }}
        class="surface-soft hidden h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content sm:inline-flex"
      >
        <Download class="h-3.5 w-3.5" />
        <span>Instalar app</span>
      </button>
    );
  }

  return (
    <a
      href={apkUrl}
      download="RuntimeEnglish.apk"
      class="surface-soft hidden h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-base-content/70 transition hover:bg-base-300 hover:text-base-content md:inline-flex"
      title="Descargar APK"
      aria-label="Descargar APK"
    >
      <Download class="h-3.5 w-3.5" />
      <span>Descargar APK</span>
    </a>
  );
}
