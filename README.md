# MrbNow

A cloud gaming client for Android with a fully customizable on-screen controller.

## Overview

MrbNow streams your games to your phone with a touch controller built for touch — not just a copy-pasted gamepad. Move buttons wherever you want, swap icons, and add extra keys (WASD, sprint, reload, whatever you need) right from Settings, no game session needed.

## Features

- Cloud game streaming on Android
- Custom gamepad overlay
  - Drag any button to reposition it
  - Swap icons to whatever you like
  - Add keyboard-key buttons — WASD, sprint, jump, reload, melee, and more
  - Edit your layout anytime from Settings
- Smooth performance, built on React + Capacitor

## Getting Started

```bash
cd opennow-stable
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

Install the APK:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Customizing Your Controller

1. Go to Settings → Input → Gamepad Layout
2. Drag buttons to reposition them
3. Tap any button to change its icon or remove it
4. Add new buttons with "+ Add button"
5. Done — it saves automatically

## License

MIT — free to use, modify, and build on. See [LICENSE](./LICENSE).
