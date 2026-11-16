import { z } from 'zod'

export const learningGoalSchema = z.enum(['daily', 'interviews', 'work', 'all'])
export const immersionSchema = z.enum(['auto', 'es', 'mixed', 'en'])
export const themeSchema = z.enum(['light', 'dark'])
export const ttsEngineSchema = z.enum(['system', 'kokoro'])

export const remindersSchema = z.object({
  enabled: z.boolean().catch(false),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .catch('20:00'),
  lastNudgeDate: z.string().nullable().catch(null),
})

export const diagnosticSchema = z
  .object({
    level: z.enum(['A1', 'A2', 'B1', 'B2']),
    score: z.number().refine(Number.isFinite).min(0).max(100).catch(0),
    completedAt: z
      .number()
      .refine(Number.isFinite)
      .catch(() => Date.now()),
  })
  .nullable()
  .optional()

export const studyPlanSchema = z
  .object({
    dailyMinutes: z.number().refine(Number.isFinite).catch(10),
    dailyExercises: z.number().refine(Number.isFinite).catch(6),
    weeklySessions: z.number().refine(Number.isFinite).catch(4),
    weeklyExercises: z.number().refine(Number.isFinite).catch(24),
    monthlySessions: z.number().refine(Number.isFinite).catch(14),
    monthlyExercises: z.number().refine(Number.isFinite).catch(90),
    focus: learningGoalSchema.catch('all'),
    level: z.string().optional(),
  })
  .nullable()
  .optional()

export const settingsSchema = z.object({
  theme: themeSchema.catch('light'),
  immersion: immersionSchema.catch('auto'),
  ttsEnabled: z.boolean().catch(true),
  ttsRate: z.number().refine(Number.isFinite).catch(1),
  ttsEngine: ttsEngineSchema.catch('system'),
  reminders: remindersSchema.catch({ enabled: false, time: '20:00', lastNudgeDate: null }),
  name: z.string().catch(''),
  onboarded: z.boolean().catch(false),
  goal: learningGoalSchema.catch('all'),
  diagnostic: diagnosticSchema.catch(null),
  plan: studyPlanSchema.catch(null),
  planIntroDismissed: z.boolean().optional(),
})

export const streakSchema = z.object({
  current: z.number().refine(Number.isFinite).catch(0),
  longest: z.number().refine(Number.isFinite).catch(0),
  lastActiveDate: z.string().nullable().catch(null),
})

export const certificateSchema = z
  .object({
    id: z.string().transform((v) => v.trim().toUpperCase()),
    name: z.string().catch(''),
    issuedAt: z.string().catch(() => new Date().toISOString()),
    completionDate: z.string().catch(''),
    status: z.enum(['local', 'pending', 'issued', 'verified', 'revoked', 'error']).optional(),
    userId: z.string().nullable().optional(),
    issuedBy: z.enum(['local', 'server']).optional(),
    lastVerifiedAt: z.string().nullable().optional(),
    shareUrl: z.string().nullable().optional(),
    lastError: z.string().nullable().optional(),
  })
  .nullable()

export const numberRecordSchema = z.record(z.string(), z.number().refine(Number.isFinite))

export const compactSettingsSchema = z
  .object({
    th: z.enum(['light', 'dark']).optional(),
    im: z.enum(['auto', 'es', 'mixed', 'en']).optional(),
    tts: z.boolean().optional(),
    rate: z.number().optional(),
    eng: z.enum(['system', 'kokoro']).optional(),
    name: z.string().optional(),
    ob: z.boolean().optional(),
    goal: z.enum(['daily', 'interviews', 'work', 'all']).optional(),
    rem: z
      .object({
        en: z.boolean().optional(),
        tm: z.string().optional(),
        ld: z.string().nullable().optional(),
      })
      .optional(),
  })
  .loose()

export const compactStateSchema = z
  .object({
    v: z.number().optional(),
    xp: z.number().optional(),
    st: z.number().optional(),
    ce: z.record(z.string(), z.number()).optional(),
    cs: z.record(z.string(), z.number()).optional(),
    at: z.record(z.string(), z.number()).optional(),
    sr: z.record(z.string(), z.unknown()).optional(),
    ss: z.array(z.string()).optional(),
    pb: z.record(z.string(), z.unknown()).optional(),
    cert: z.unknown().nullable().optional(),
    ac: z.record(z.string(), z.number()).optional(),
    sk: z
      .object({
        current: z.number().optional(),
        longest: z.number().optional(),
        lastActiveDate: z.string().nullable().optional(),
      })
      .optional(),
    se: compactSettingsSchema.optional(),
  })
  .loose()

export function parseCompactState(raw: unknown): z.infer<typeof compactStateSchema> | null {
  const parsed = compactStateSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export const errorEventSchema = z
  .object({
    id: z.string().optional(),
    exerciseId: z.string(),
    sessionId: z.string().optional(),
    exerciseType: z.string().optional(),
    prompt: z.string().optional(),
    userAnswer: z.string().optional(),
    correctAnswer: z.string().optional(),
    skills: z.array(z.string()).optional(),
    at: z.number().optional(),
  })
  .loose()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function sanitizeSettings(input: unknown, defaults: z.infer<typeof settingsSchema>) {
  if (!isRecord(input)) return defaults

  const rawReminders = isRecord(input.reminders) ? input.reminders : {}
  const parsed = settingsSchema.safeParse({
    ...defaults,
    ...input,
    reminders: { ...(defaults.reminders ?? {}), ...rawReminders },
  })
  const out = parsed.success ? parsed.data : defaults

  // Preserve onboarding inference behavior from legacy data.
  if (input.onboarded === undefined && typeof input.name === 'string' && input.name.trim()) {
    out.onboarded = true
  }
  if (input.planIntroDismissed !== undefined) {
    out.planIntroDismissed = Boolean(input.planIntroDismissed)
  }
  if (input.diagnostic === null) out.diagnostic = null
  if (input.plan === null) out.plan = null
  return out
}

export function sanitizeStreak(input: unknown, defaults: z.infer<typeof streakSchema>) {
  const parsed = streakSchema.safeParse(isRecord(input) ? { ...defaults, ...input } : defaults)
  return parsed.success ? parsed.data : defaults
}

export function sanitizeCertificate(input: unknown) {
  const parsed = certificateSchema.safeParse(input)
  if (!parsed.success || !parsed.data?.id) return null
  return parsed.data
}
