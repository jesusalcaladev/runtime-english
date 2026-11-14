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
          window.localStorage.setItem("devlingo_dev", "1");
        }
        if (!window.localStorage.getItem("devlingo_dev") && window.localStorage.getItem("deveng_dev") === "1") {
          window.localStorage.setItem("devlingo_dev", "1");
        }
      } catch {}
    };
    const onMenu = () => setOpen((value) => !value);

    syncPath();
    window.addEventListener("devlingo:menu", onMenu);
    document.addEventListener("astro:page-load", syncPath);
    return () => {
      window.removeEventListener("devlingo:menu", onMenu);
      document.removeEventListener("astro:page-load", syncPath);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return { open, setOpen, path };
}
