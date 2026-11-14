import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.runtimeenglish.core",
  appName: "RuntimeEnglish",
  webDir: "dist",
  backgroundColor: "#101010",
  android: {
    backgroundColor: "#101010",
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
  plugins: {
    SystemBars: {
      insetsHandling: "native",
      style: "DARK",
    },
  },
};

export default config;
