const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
};

workerScope.onmessage = () => {
  workerScope.postMessage({ type: "error", error: "Kokoro is not available in this build." });
};

export {};
