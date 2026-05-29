import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tetapsehat.app',
  appName: 'TetapSehat',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2e7d32",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
