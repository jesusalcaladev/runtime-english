import { useState } from "preact/hooks";
import { Award, Download } from "lucide-preact";
import { useProgress } from "../lib/useProgress";

interface Props {
  totalSessions: number;
  totalExercises: number;
}

function shortId(seed: number): string {
  return seed.toString(36).toUpperCase().slice(-6).padStart(6, "0");
}

export default function CertificateView({ totalSessions, totalExercises }: Props) {
  const state = useProgress();
  const [downloading, setDownloading] = useState(false);
  const doneSessions = Object.keys(state.completedSessions).length;
  const doneExercises = Object.keys(state.completedExercises).length;
  let devMode = false;
  try {
    devMode = typeof window !== "undefined" && window.localStorage.getItem("deveng_dev") === "1";
  } catch {}
  const complete = devMode || (doneSessions >= totalSessions && doneExercises >= totalExercises);

  const name = (state.settings.name || "").trim() || "Developer";
  const completionTimestamp = Math.max(
    0,
    ...Object.values(state.completedSessions),
    ...Object.values(state.completedExercises),
  );
  const completionDate = new Date(completionTimestamp || Date.now()).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const issueId = shortId(completionTimestamp || state.startedAt || Date.now());

  async function downloadPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const center = pageWidth / 2;

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text("DEVENG CORE", center, 72, { align: "center", charSpace: 2 });

      const badge = "A1–B2";
      doc.setFont("courier", "bold");
      doc.setFontSize(14);
      const badgeWidth = doc.getTextWidth(badge) + 36;
      const badgeX = center - badgeWidth / 2;
      const badgeY = 96;
      doc.setFillColor(17, 17, 17);
      doc.roundedRect(badgeX, badgeY, badgeWidth, 30, 15, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(badge, center, badgeY + 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text("CERTIFICATE OF COMPLETION", center, 165, { align: "center", charSpace: 1.5 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(17, 17, 17);
      doc.text("English for Programmers", center, 215, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text("Awarded to", center, 270, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(34);
      doc.setTextColor(10, 10, 10);
      doc.text(name || "Developer", center, 312, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text("Technical English for Developers", center, 340, { align: "center" });

      const footerY = pageHeight - 110;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text("PROGRAM", 90, footerY, { charSpace: 1 });
      doc.text("CERTIFICATE ID", pageWidth - 90, footerY, { align: "right", charSpace: 1 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text("DevEng Core", 90, footerY + 18);
      doc.setFont("courier", "bold");
      doc.text(issueId, pageWidth - 90, footerY + 18, { align: "right" });

      doc.setFont("courier", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(completionDate, center, pageHeight - 52, { align: "center" });

      doc.save(`english-for-programmers-certificate-${issueId}.pdf`);
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  if (!complete) {
    return (
      <div class="mx-auto max-w-2xl rounded-3xl bg-base-200 p-6 text-center sm:p-10">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100/70 text-base-content/50">
          <Award class="h-7 w-7" />
        </div>
        <h1 class="font-pixel mt-5 text-3xl tracking-tight">Certificate locked</h1>
        <p class="mt-3 text-sm leading-7 text-base-content/60">
          Complete all sessions and exercises to unlock your certificate.
        </p>
        <p class="mt-4 font-mono text-[11px] text-base-content/45">
          {doneSessions}/{totalSessions} sessions · {doneExercises}/{totalExercises} exercises
        </p>
        <a href="/" class="btn btn-primary mt-6 h-10 rounded-xl px-5">
          Continue learning
        </a>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p class="mono-label">Completion / Certificate</p>
          <h1 class="font-pixel mt-2 text-2xl tracking-tight sm:text-3xl">Your certificate</h1>
          <p class="mt-1 text-sm text-base-content/55">Clean, modern and ready to download.</p>
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          class="btn btn-primary h-10 gap-2 rounded-xl px-4"
        >
          <Download class="h-4 w-4" />
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div class="certificate-sheet mx-auto w-full max-w-[920px] overflow-hidden rounded-[32px] bg-white text-neutral-900 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
        <div class="relative flex min-h-[560px] flex-col px-8 py-12 sm:px-14 sm:py-16">
          <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neutral-900/[0.03]" />
          <div class="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-neutral-900/[0.025]" />

          <div class="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center text-center">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-neutral-400">
              DevEng Core
            </p>

            <div class="mt-8 inline-flex rounded-full bg-neutral-900 px-6 py-2.5">
              <span class="font-mono text-base font-semibold tracking-[0.24em] text-white sm:text-lg">A1–B2</span>
            </div>

            <p class="mt-10 text-[11px] uppercase tracking-[0.26em] text-neutral-500">
              Certificate of Completion
            </p>
            <h2 class="font-pixel mt-3 text-4xl leading-[0.95] tracking-tight text-neutral-950 sm:text-6xl">
              English for Programmers
            </h2>

            <p class="mt-12 text-sm text-neutral-500">Awarded to</p>
            <p class="mt-2 text-balance text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              {name}
            </p>
            <p class="mt-4 text-sm text-neutral-600 sm:text-base">Technical English for Developers</p>

            <div class="flex-1" />

            <div class="mt-12 flex w-full items-end justify-between gap-6 text-left">
              <div>
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Program</p>
                <p class="mt-1 text-sm font-medium text-neutral-800">DevEng Core</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Certificate ID</p>
                <p class="mt-1 font-mono text-sm font-medium text-neutral-800">{issueId}</p>
              </div>
            </div>

            <p class="mt-8 font-mono text-[11px] tracking-[0.14em] text-neutral-500">{completionDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
