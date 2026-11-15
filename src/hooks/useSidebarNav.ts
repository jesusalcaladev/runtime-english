import { useEffect, useState } from "preact/hooks";

export function useSidebarNav() {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");

  useEffect(() => {
    const syncPath = () => {
      setPath(window.location.pathname);
      setOpen(false);
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("dev") === "1") {
          window.localStorage.setItem("runtimeenglish_dev", "1");
        }
        if (
          !window.localStorage.getItem("runtimeenglish_dev") &&
          window.localStorage.getItem("deveng_dev") === "1"
        ) {
          window.localStorage.setItem("runtimeenglish_dev", "1");
        }
      } catch {}
    };
    const onMenu = () => setOpen((value) => !value);

    syncPath();
    window.addEventListener("runtimeenglish:menu", onMenu);
    document.addEventListener("astro:page-load", syncPath);
    return () => {
      window.removeEventListener("runtimeenglish:menu", onMenu);
      document.removeEventListener("astro:page-load", syncPath);
    };
  }, []);

  useEffect(() => {
    const isMobileViewport = () =>
      typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

    const menuBtn = () =>
      document.getElementById("mobile-menu-btn") as HTMLButtonElement | null;

    const updateScrollLock = () => {
      if (open && isMobileViewport()) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      menuBtn()?.setAttribute("aria-expanded", open ? "true" : "false");
    };

    updateScrollLock();
    window.addEventListener("resize", updateScrollLock);

    if (open && isMobileViewport()) {
      window.setTimeout(() => {
        const first = document.querySelector<HTMLElement>(
          '#app-sidebar a[href], #app-sidebar button:not([disabled])',
        );
        first?.focus();
      }, 0);
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !open) return;
      event.preventDefault();
      setOpen(false);
      menuBtn()?.focus();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updateScrollLock);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      menuBtn()?.setAttribute("aria-expanded", "false");
      if (open && isMobileViewport()) {
        menuBtn()?.focus();
      }
    };
  }, [open]);

  return { open, setOpen, path };
}
