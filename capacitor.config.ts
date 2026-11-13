import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.deveng.core",
  appName: "DevEng Core",
  webDir: "dist",
  backgroundColor: "#101010",
  android: {
    backgroundColor: "#101010",
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
  SystemBars: {
    insetsHandling: "native",
    style: "DARK",
  },
};

export default config;
