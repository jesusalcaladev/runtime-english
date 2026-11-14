import { useEffect, useMemo, useState } from "preact/hooks";
import { Award, Check, Cloud, Copy, ExternalLink, Info, Loader2, RefreshCw, ShieldCheck } from "lucide-preact";
import { route } from "../../lib/routes";
import { certificateShareUrl, issueCertificate, verifyCertificate } from "../../lib/certificates";
import { progressStore } from "../../lib/progress";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { useProgress } from "../../lib/useProgress";
import { emitToast } from "../../lib/toast";

interface Props {
  totalSessions: number;
  totalExercises: number;
}

type Theme = "pearl" | "white" | "dark";

function shortId(seed: number): string {
  return seed.toString(36).toUpperCase().slice(-6).padStart(6, "0");
}

const certStyles = `
  .font-mono-tech { font-family: 'JetBrains Mono', monospace; }
  .certificate-sheet, .certificate-sheet[data-theme="pearl"] {
    --bg-paper: #F9F8F6; --text-primary: #111111; --text-secondary: #4A4A4A; --text-muted: #737373;
    --border-outer: #D4D2CD; --border-inner: #1A1A1A; --badge-bg: transparent; --badge-border: #1A1A1A;
    --badge-text: #111111; --seal-stroke: #1A1A1A; --paper-noise-opacity: 0.035;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-paper); color: var(--text-primary);
    width: 100%; max-width: 1056px; aspect-ratio: 1.414 / 1; position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05);
    overflow: hidden;
  }
  .certificate-sheet[data-theme="white"] { --bg-paper:#FFFFFF; --text-primary:#0A0A0A; --text-secondary:#404040; --text-muted:#737373; --border-outer:#E5E5E5; --border-inner:#171717; --badge-bg:#171717; --badge-border:#171717; --badge-text:#FFFFFF; --seal-stroke:#171717; --paper-noise-opacity:0.015; }
  .certificate-sheet[data-theme="dark"] { --bg-paper:#121212; --text-primary:#F5F5F4; --text-secondary:#A8A29E; --text-muted:#78716C; --border-outer:#292524; --border-inner:#57534E; --badge-bg:rgba(255,255,255,0.06); --badge-border:#78716C; --badge-text:#F5F5F4; --seal-stroke:#D6D3D1; --paper-noise-opacity:0.04; }
  .paper-texture { position:absolute; inset:0; pointer-events:none; opacity:var(--paper-noise-opacity); background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); z-index:1; }
  .frame-outer { position:absolute; inset:22px; border:1px solid var(--border-outer); pointer-events:none; z-index:2; }
  .frame-inner { position:absolute; inset:28px; border:1px solid var(--border-inner); pointer-events:none; z-index:2; }
  .corner-tick { position:absolute; width:8px; height:8px; border-color:var(--border-inner); z-index:3; }
  .text-primary-theme { color: var(--text-primary) !important; }
  .text-secondary-theme { color: var(--text-secondary) !important; }
  .text-muted-theme { color: var(--text-muted) !important; }
  .level-badge { background-color: var(--badge-bg); border:1px solid var(--badge-border); color: var(--badge-text); }
  .divider-line { background-color: var(--border-outer); }
  .seal-svg { stroke: var(--seal-stroke); }
  @media print {
    @page { size: landscape; margin: 0; }
    body { background:none !important; padding:0 !important; margin:0 !important; display:block !important; }
    .no-print { display:none !important; }
    .studio-wrapper { padding:0 !important; min-height:auto !important; display:block !important; }
    .certificate-sheet { width:100vw !important; height:100vh !important; max-width:none !important; box-shadow:none !important; border-radius:0 !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
`;

export default function CertificateView({ totalSessions, totalExercises }: Props) {
  const state = useProgress();
  const [theme, setTheme] = useState<Theme>("pearl");
  const [issuing, setIssuing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setAuthed(Boolean(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(Boolean(session?.user)));
    return () => data.subscription.unsubscribe();
  }, []);

  const doneSessions = Object.keys(state.completedSessions).length;
  const doneExercises = Object.keys(state.completedExercises).length;
  let devMode = false;
  try {
    devMode = typeof window !== "undefined" && (window.localStorage.getItem("devlingo_dev") === "1" || window.localStorage.getItem("deveng_dev") === "1");
  } catch {}
  const complete = devMode || (doneSessions >= totalSessions && doneExercises >= totalExercises);

  const name = (state.settings.name || "").trim() || "Developer";
  const completionTimestamp = Math.max(0, ...Object.values(state.completedSessions), ...Object.values(state.completedExercises));
  const completionDate = new Date(completionTimestamp || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const derivedId = shortId(completionTimestamp || state.startedAt || Date.now());
  const cert = state.certificate;
  const issueId = (cert?.id || derivedId).toUpperCase();
  const issuedAtIso = cert?.issuedAt || new Date(completionTimestamp || Date.now()).toISOString();
  const displayDate = cert?.completionDate || completionDate;
  const shareUrl = useMemo(() => certificateShareUrl(issueId), [issueId]);
  const issueEndpointConfigured = Boolean(import.meta.env.PUBLIC_CERTIFICATE_ISSUE_URL);

  async function ensureLocalCertificate() {
    if (!complete) return;
    const record = {
      id: issueId,
      name,
      issuedAt: issuedAtIso,
      completionDate: displayDate,
      status: (cert?.status as any) || "local",
      issuedBy: (cert?.issuedBy as any) || "local",
      shareUrl,
      lastError: cert?.lastError || null,
      lastVerifiedAt: cert?.lastVerifiedAt || null,
    };
    progressStore.setCertificate(record as any);
  }

  async function doIssue(auto = false) {
    if (!complete) return;
    await ensureLocalCertificate();
    if (!issueEndpointConfigured) {
      progressStore.setCertificate({ id: issueId, name, issuedAt: issuedAtIso, completionDate: displayDate, status: "local", issuedBy: "local", shareUrl } as any);
      return;
    }
    setIssuing(true);
    const res = await issueCertificate({ id: issueId, name, issued_at: issuedAtIso, completion_date: displayDate });
    setIssuing(false);
    if (res.ok) {
      progressStore.setCertificate({
        id: issueId,
        name,
        issuedAt: issuedAtIso,
        completionDate: displayDate,
        status: "issued",
        issuedBy: "server",
        shareUrl,
        lastError: null,
      } as any);
      if (!auto) emitToast(authed ? "Certificado emitido y vinculado a tu cuenta." : "Certificado emitido en el registro verificable.", "success");
    } else {
      progressStore.setCertificate({
        id: issueId,
        name,
        issuedAt: issuedAtIso,
        completionDate: displayDate,
        status: cert?.status === "issued" || cert?.status === "verified" ? cert.status : "pending",
        issuedBy: cert?.issuedBy || "local",
        shareUrl,
        lastError: res.error || "No se pudo emitir en servidor.",
      } as any);
      if (!auto) emitToast(`No se pudo emitir en servidor: ${res.error || "error"}`, "error");
    }
  }

  async function doVerify() {
    setVerifying(true);
    const res = await verifyCertificate(issueId);
    setVerifying(false);
    if (res.ok && res.certificate) {
      progressStore.setCertificate({
        id: issueId,
        name: res.certificate.name || name,
        issuedAt: res.certificate.issued_at || issuedAtIso,
        completionDate: displayDate,
        status: "verified",
        issuedBy: "server",
        shareUrl,
        lastVerifiedAt: new Date().toISOString(),
        lastError: null,
      } as any);
      emitToast("Certificado verificado correctamente en el registro.", "success");
    } else {
      if (!autoIssueRan) await ensureLocalCertificate();
      if (cert?.status === "issued" || cert?.status === "verified") {
        progressStore.setCertificate({ ...(cert as any), status: "issued", lastError: res.error || "No verificado aún" } as any);
      }
      emitToast(res.error === "not_found" ? "Aún no aparece en el registro verificable. Intenta emitirlo." : `Verificación no disponible: ${res.error || "error"}`, res.error === "not_found" ? "info" : "error");
    }
  }

  const [autoIssueRan, setAutoIssueRan] = useState(false);
  useEffect(() => {
    if (!complete || autoIssueRan) return;
    setAutoIssueRan(true);
    void (async () => {
      await ensureLocalCertificate();
      await doIssue(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, issueId, name, issuedAtIso, displayDate]);

  if (!complete) {
    return (
      <div class="mx-auto max-w-2xl rounded-3xl bg-base-200 p-6 text-center sm:p-10">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/50">
          <Award class="h-7 w-7" />
        </div>
        <h1 class="font-pixel mt-5 text-[2.1rem] tracking-tight">Certificate locked</h1>
        <p class="mt-3 text-sm leading-7 text-base-content/60">Complete all sessions and exercises to unlock your certificate.</p>
        <p class="mt-4 font-mono text-[11px] text-base-content/45">{doneSessions}/{totalSessions} sessions · {doneExercises}/{totalExercises} exercises</p>
        <a href={route("/")} class="btn btn-primary mt-6 h-10 rounded-xl px-5">Continue learning</a>
      </div>
    );
  }

  const status = cert?.status || "local";
  const statusLabel = status === "verified" ? "Verificado en registro" : status === "issued" ? "Emitido en servidor" : status === "pending" ? "Emisión pendiente" : status === "error" ? "Error de emisión" : "Certificado local";
  const statusTone = status === "verified" || status === "issued" ? "text-success bg-success/10" : status === "pending" ? "text-warning bg-warning/10" : status === "error" ? "text-error bg-error/10" : "text-base-content/60 bg-base-100/70";

  const btn = (t: Theme, label: string) => (
    <button type="button" onClick={() => setTheme(t)} class={`rounded-full px-3.5 py-2 text-xs font-medium transition ${theme === t ? "bg-base-content text-base-100" : "bg-base-100/50 text-base-content/45 hover:bg-base-100 hover:text-base-content/70"}`}>{label}</button>
  );

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      emitToast("Enlace de verificación copiado.", "success");
    } catch {
      emitToast("No se pudo copiar el enlace.", "error");
    }
  }

  return (
    <div class="w-full">
      <style>{certStyles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div class="no-print mx-auto mb-4 w-full max-w-[1056px] space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-1.5">
            {btn("pearl", "Papel marfil")}
            {btn("white", "Blanco puro")}
            {btn("dark", "Edición oscura")}
          </div>
          <button type="button" onClick={() => window.print()} class="btn btn-primary btn-sm h-9 gap-2 rounded-xl px-4 font-semibold">
            <span>Imprimir / PDF</span>
          </button>
        </div>

        <div class="rounded-2xl bg-base-200/80 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusTone}`}>
                  <ShieldCheck class="h-3 w-3" /> {statusLabel}
                </span>
                {authed && <span class="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[10px] text-accent"><Cloud class="h-3 w-3" /> Vinculado a tu cuenta</span>}
              </div>
              <p class="mt-2 text-[11px] leading-relaxed text-base-content/60">
                ID <span class="font-mono font-semibold text-base-content/80">{issueId}</span>. {issueEndpointConfigured ? "Emisión automática en registro verificable" : "Registro verificable no configurado en este entorno"}{authed ? " y asociado a tu cuenta al emitir." : ". Inicia sesión para vincularlo a tu cuenta."}
              </p>
              {cert?.lastError && <p class="mt-1 text-[10px] text-error/80">Último aviso: {cert.lastError}</p>}
              {cert?.lastVerifiedAt && <p class="mt-1 text-[10px] text-success/80">Última verificación: {new Date(cert.lastVerifiedAt).toLocaleString()}</p>}
            </div>
            <div class="flex flex-wrap gap-2">
              {issueEndpointConfigured && (
                <button type="button" disabled={issuing} onClick={() => void doIssue(false)} class="flex items-center gap-1.5 rounded-xl bg-base-100 px-3 py-2 text-[11px] font-medium hover:bg-base-100/80 disabled:opacity-50">
                  {issuing ? <Loader2 class="h-3.5 w-3.5 animate-spin" /> : <RefreshCw class="h-3.5 w-3.5" />} Emitir/actualizar registro
                </button>
              )}
              <button type="button" disabled={verifying || !isSupabaseConfigured()} onClick={() => void doVerify()} class="flex items-center gap-1.5 rounded-xl bg-base-100 px-3 py-2 text-[11px] font-medium hover:bg-base-100/80 disabled:opacity-50">
                {verifying ? <Loader2 class="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck class="h-3.5 w-3.5" />} Verificar
              </button>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-base-100/50 p-2.5">
            <span class="min-w-0 flex-1 truncate font-mono text-[10px] text-base-content/55">{shareUrl}</span>
            <button type="button" onClick={() => void copyShare()} class="flex items-center gap-1 rounded-lg bg-base-200 px-2.5 py-1.5 text-[10px] font-medium hover:bg-base-300">
              {copied ? <Check class="h-3 w-3" /> : <Copy class="h-3 w-3" />} {copied ? "Copiado" : "Copiar enlace"}
            </button>
            <a href={shareUrl} target="_blank" rel="noreferrer" class="flex items-center gap-1 rounded-lg bg-base-200 px-2.5 py-1.5 text-[10px] font-medium hover:bg-base-300">
              <ExternalLink class="h-3 w-3" /> Abrir verificación
            </a>
          </div>
          <p class="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-base-content/40">
            <Info class="mt-0.5 h-3 w-3 shrink-0" /> Comparte el enlace para que terceros verifiquen el ID. Si no hay backend configurado, el certificado sigue disponible localmente y se incluirá en tu respaldo/sincronización.
          </p>
        </div>
      </div>

      <div class="studio-wrapper w-full flex items-center justify-center">
        <main id="certificate" data-theme={theme} class="certificate-sheet rounded-sm flex flex-col justify-between px-10 py-12 sm:px-20 sm:py-16 select-none">
          <div class="paper-texture"></div>
          <div class="frame-outer"></div>
          <div class="frame-inner"></div>
          <div class="corner-tick top-[28px] left-[28px] border-t-2 border-l-2"></div>
          <div class="corner-tick top-[28px] right-[28px] border-t-2 border-r-2"></div>
          <div class="corner-tick bottom-[28px] left-[28px] border-b-2 border-l-2"></div>
          <div class="corner-tick bottom-[28px] right-[28px] border-b-2 border-r-2"></div>

          <header class="relative z-10 flex flex-col items-center text-center pt-1 sm:pt-2">
            <div class="flex items-center gap-2.5 mb-4 sm:mb-5">
              <span class="text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-secondary-theme">DEVLINGO</span>
            </div>
            <div class="level-badge px-4 py-1 rounded-full">
              <span class="font-mono-tech text-[11px] sm:text-xs font-medium tracking-[0.2em]">A1 — B2</span>
            </div>
          </header>

          <section class="relative z-10 flex flex-col items-center text-center my-auto py-4">
            <p class="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-secondary-theme mb-3 sm:mb-4">CERTIFICATE OF COMPLETION</p>
            <h1 class="font-mono-tech text-2xl sm:text-4xl md:text-[42px] font-medium tracking-tight text-primary-theme leading-tight">
              <span class="text-muted-theme font-normal opacity-60 mr-1 sm:mr-2">[</span>English for Programmers<span class="text-muted-theme font-normal opacity-60 ml-1 sm:ml-2">]</span>
            </h1>
            <div class="w-12 h-[1px] divider-line my-5 sm:my-7"></div>
            <p class="text-xs sm:text-sm font-normal text-secondary-theme mb-1.5 sm:mb-2">Awarded to</p>
            <h2 class="text-3xl sm:text-5xl font-bold tracking-tight text-primary-theme mb-2.5 sm:mb-3">{name}</h2>
            <p class="text-xs sm:text-sm font-medium tracking-wide text-secondary-theme">Technical English for Developers</p>
          </section>

          <footer class="relative z-10 grid grid-cols-3 items-end pt-2 sm:pt-4 pb-1 sm:pb-2 px-2 sm:px-6">
            <div class="text-left">
              <p class="text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-theme mb-1">ISSUED ON</p>
              <p class="text-xs sm:text-sm font-medium text-primary-theme">{displayDate}</p>
              <p class="text-[10px] sm:text-xs text-muted-theme mt-0.5">Program: <span class="text-secondary-theme font-medium">DevLingo</span></p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 64 64" fill="none" class="w-full h-full seal-svg" stroke-width="1.2">
                  <circle cx="32" cy="32" r="28" stroke-dasharray="2 2" opacity="0.6" />
                  <circle cx="32" cy="32" r="23" />
                  <polyline points="26 26 20 32 26 38" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <polyline points="38 26 44 32 38 38" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <line x1="34" y1="24" x2="30" y2="40" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <span class="font-mono-tech text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-muted-theme">{status === "verified" ? "VERIFIED" : status === "issued" ? "REGISTERED" : "ISSUED"}</span>
            </div>
            <div class="text-right">
              <p class="text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-theme mb-1">CERTIFICATE ID</p>
              <p class="font-mono-tech text-xs sm:text-sm font-semibold tracking-wider text-primary-theme">{issueId}</p>
              <p class="text-[10px] sm:text-xs text-muted-theme mt-0.5 break-all">{shareUrl.replace(/^https?:\/\//, "")}</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
