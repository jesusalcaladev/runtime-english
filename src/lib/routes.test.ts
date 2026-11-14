import { describe, expect, it } from "vitest";
import { route } from "./routes";

describe("route", () => {
  it("keeps external urls and special schemes unchanged", () => {
    expect(route("https://example.com/a")).toBe("https://example.com/a");
    expect(route("mailto:test@example.com")).toBe("mailto:test@example.com");
    expect(route("//cdn.example.com/x")).toBe("//cdn.example.com/x");
  });

  it("keeps relative paths and anchors unchanged", () => {
    expect(route("about")).toBe("about");
    expect(route("#practica")).toBe("#practica");
  });

  it("maps internal routes for Capacitor/html pages", () => {
    expect(route("/")).toBe("/");
    expect(route("/practice")).toBe("/practice.html");
    expect(route("/session/intro")).toBe("/session/intro.html");
    expect(route("/settings?tab=x")).toBe("/settings.html?tab=x");
    expect(route("/dictionary#top")).toBe("/dictionary.html#top");
    expect(route("/folder/")).toBe("/folder/index.html");
  });

  it("keeps paths that already have an extension", () => {
    expect(route("/sw.js")).toBe("/sw.js");
    expect(route("/images/a.png")).toBe("/images/a.png");
    expect(route("/doc.html")).toBe("/doc.html");
  });
});
