import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

export interface AppUpdateManifest {
  versionName?: string;
  versionCode?: number | string;
  apkUrl?: string;
  title?: string;
  notes?: string;
  mandatory?: boolean;
}

export interface AppUpdateInfo {
  currentVersionName: string;
  currentBuild: number;
  latestVersionName: string;
  latestBuild: number;
  apkUrl: string;
  title: string;
  notes: string;
  mandatory: boolean;
}

const CHECK_INTERVAL_MS = 1000 * 60 * 30; // 30 min
const LAST_CHECK_KEY = "runtimeenglish_update_last_check_v1";
const DISMISSED_BUILD_KEY = "runtimeenglish_update_dismissed_build_v1";

function isNativeAndroidApp(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

function toInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toAbsoluteUrl(url: string, manifestUrl: string): string {
  try {
    return new URL(url, manifestUrl).toString();
  } catch {
    return url;
  }
}

export function getAppUpdateManifestUrl(): string | null {
  const explicit = (import.meta.env.PUBLIC_APP_UPDATE_URL as string | undefined)?.trim();
  if (explicit) return explicit;
  const base = (import.meta.env.PUBLIC_APP_URL as string | undefined)?.trim();
  if (base) {
    try {
      return new URL("/app-update.json", base).toString();
    } catch {
      // ignore
    }
  }
  return null;
}

export async function checkForAppUpdate(options?: { force?: boolean }): Promise<AppUpdateInfo | null> {
  if (typeof window === "undefined") return null;
  if (!isNativeAndroidApp()) return null;

  const manifestUrl = getAppUpdateManifestUrl();
  if (!manifestUrl) return null;

  const force = options?.force === true;
  const now = Date.now();
  try {
    const last = Number(window.localStorage.getItem(LAST_CHECK_KEY) || "0");
    if (!force && last && now - last < CHECK_INTERVAL_MS) return null;
  } catch {
    // ignore storage issues
  }

  try {
    const info = await App.getInfo();
    const currentBuild = toInt((info as any).build ?? (info as any).versionCode ?? 0);
    const currentVersionName = String((info as any).version ?? info.version ?? "").trim() || "0.0.0";

    const res = await fetch(`${manifestUrl}${manifestUrl.includes("?") ? "&" : "?"}t=${now}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const manifest = (await res.json()) as AppUpdateManifest;

    const latestBuild = toInt(manifest.versionCode);
    const latestVersionName = String(manifest.versionName || "").trim() || currentVersionName;
    const apkUrlRaw = String(manifest.apkUrl || "").trim();
    if (!latestBuild || !apkUrlRaw || latestBuild <= currentBuild) {
      try {
        window.localStorage.setItem(LAST_CHECK_KEY, String(now));
      } catch {}
      return null;
    }

    try {
      const dismissed = toInt(window.localStorage.getItem(DISMISSED_BUILD_KEY));
      if (!force && dismissed === latestBuild && !manifest.mandatory) {
        window.localStorage.setItem(LAST_CHECK_KEY, String(now));
        return null;
      }
    } catch {}

    try {
      window.localStorage.setItem(LAST_CHECK_KEY, String(now));
    } catch {}

    return {
      currentVersionName,
      currentBuild,
      latestVersionName,
      latestBuild,
      apkUrl: toAbsoluteUrl(apkUrlRaw, manifestUrl),
      title: String(manifest.title || "Nueva versión disponible").trim(),
      notes:
        String(manifest.notes || "Hay una actualización disponible. Descárgala e instálala para continuar con la última versión.").trim(),
      mandatory: Boolean(manifest.mandatory),
    };
  } catch (error) {
    console.warn("App update check failed", error);
    return null;
  }
}

export async function openAppUpdateDownload(apkUrl: string): Promise<void> {
  try {
    if (isNativeAndroidApp()) {
      await Browser.open({ url: apkUrl });
      return;
    }
  } catch (error) {
    console.warn("Browser.open failed, falling back to window.open", error);
  }
  if (typeof window !== "undefined") {
    window.open(apkUrl, "_blank", "noopener,noreferrer");
  }
}

export function dismissAppUpdate(build: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISSED_BUILD_KEY, String(toInt(build)));
  } catch {}
}

export function isNativeAndroid(): boolean {
  return typeof window !== "undefined" && isNativeAndroidApp();
}
