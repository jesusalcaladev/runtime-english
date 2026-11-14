import { describe, expect, it } from "vitest";
import { emitToast, subscribeToasts, type ToastMessage } from "./toast";

describe("toast", () => {
  it("emits to subscribers and supports unsubscribe", () => {
    const received: ToastMessage[] = [];
    const unsub = subscribeToasts((t) => received.push(t));
    emitToast("Hola", "success");
    emitToast("Error", "error");
    unsub();
    emitToast("Ignored", "info");

    expect(received).toHaveLength(2);
    expect(received[0]).toMatchObject({ message: "Hola", type: "success" });
    expect(received[1]).toMatchObject({ message: "Error", type: "error" });
    expect(received[0].id).not.toBe(received[1].id);
  });
});
