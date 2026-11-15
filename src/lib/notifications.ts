import { Capacitor } from "@capacitor/core";
import type { ProgressSettings } from "./progress";

const REMINDER_ID = 7001;

function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function parseTime(time: string): { hour: number; minute: number } {
  const m = /^(\d{2}):(\d{2})$/.exec(time || "");
  const hour = m ? Math.min(23, Math.max(0, Number(m[1]))) : 20;
  const minute = m ? Math.min(59, Math.max(0, Number(m[2]))) : 0;
  return { hour, minute };
}

export async function syncStreakReminder(settings: ProgressSettings): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    // Clear previous schedule to keep it clean and idempotent
    try {
      await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    } catch {}

    if (!settings.reminders?.enabled) return;

    const perm = await LocalNotifications.checkPermissions();
    let display = perm.display;
    if (display === "prompt" || display === "prompt-with-rationale") {
      const req = await LocalNotifications.requestPermissions();
      display = req.display;
    }
    if (display !== "granted") return;

    const { hour, minute } = parseTime(settings.reminders.time);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "No pierdas tu racha en RuntimeEnglish",
          body: "Dedica unos minutos hoy: una sesión corta o práctica rápida.",
          schedule: { on: { hour, minute }, allowWhileIdle: true },
          smallIcon: "ic_stat_icon_config_sample",
          sound: undefined,
          actionTypeId: "",
          extra: { route: "/" },
        },
      ],
    });
  } catch {
    // Plugin unavailable or permissions denied: ignore silently
  }
}

export async function ensureReminderChannel(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const maybeLocalNotifications = LocalNotifications as unknown as {
      createChannel?: (channel: {
        id: string;
        name: string;
        description?: string;
        importance?: number;
        visibility?: number;
      }) => Promise<void> | void;
    };

    if (typeof maybeLocalNotifications.createChannel === "function") {
      await maybeLocalNotifications.createChannel({
        id: "streak-reminders",
        name: "Recordatorios de racha",
        description: "Recordatorios diarios para practicar",
        importance: 3,
        visibility: 1,
      });
    }
  } catch {}
}
