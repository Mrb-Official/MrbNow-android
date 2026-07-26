# MrbNow — Custom Gamepad Overlay — Install Guide

This zip contains 2 brand-new files, 1 ready-to-use asset folder, and 3
patch notes for small edits to existing files. Nothing in your existing
project is overwritten automatically — you apply each patch by hand so
you can review every change.

## What's inside

```
src/renderer/src/utils/gamepadLayoutStore.ts     ← NEW FILE (copy in as-is)
src/renderer/src/components/TouchGamepad.tsx     ← REPLACES your existing file
src/renderer/src/components/GamepadEditor.tsx    ← NEW FILE (copy in as-is)
src/renderer/src/assets/gamepad-icons/           ← NEW FOLDER (16 placeholder SVGs + README)
PATCH_1_inputProtocol.md                          ← 1-line instruction
PATCH_2_webrtcClient.md                           ← 2 small additions
PATCH_3_SettingsPage.md                           ← 4 small additions
PATCH_4_styles.css                                ← append to end of styles.css
```

## Install order (do them in this order)

1. **Copy** `gamepadLayoutStore.ts` into your project at:
   `opennow-stable/src/renderer/src/utils/gamepadLayoutStore.ts`

2. **Replace** your existing `TouchGamepad.tsx` with the one in this zip:
   `opennow-stable/src/renderer/src/components/TouchGamepad.tsx`

3. **Copy** `GamepadEditor.tsx` into your project at:
   `opennow-stable/src/renderer/src/components/GamepadEditor.tsx`

4. **Copy** the whole `assets/gamepad-icons/` folder into:
   `opennow-stable/src/renderer/src/assets/gamepad-icons/`
   (It already has 16 placeholder circle-icons so the app builds and runs
   immediately. Read `gamepad-icons/README.md` for exact filenames to
   replace with your real icons.)

5. **Open `PATCH_1_inputProtocol.md`** and make the 1-line change in
   `gfn/inputProtocol.ts` (adds `export` in front of `codeMap`).

6. **Open `PATCH_2_webrtcClient.md`** and make the 2 additions in
   `gfn/webrtcClient.ts` (import `codeMap`, add `sendVirtualKey()` method).

7. **Open `PATCH_3_SettingsPage.md`** and make the 4 additions in
   `components/SettingsPage.tsx` (adds the "Gamepad Layout" row + editor
   modal under the existing "Input" section).

8. **Open `PATCH_4_styles.css`** and append its entire contents to the end
   of your existing `src/renderer/src/styles.css`.

9. Build normally:
   ```
   cd opennow-stable
   npm run build
   npx cap sync android
   ```

## What you'll be able to do after this (with placeholder icons)

- Open Settings → Input → "Gamepad Layout" → "Edit Layout"
- See the existing gamepad buttons (A/B/X/Y, D-pad, sticks, shoulders,
  Start/Back) in an editable preview — **no game session needed**
- Drag any button to reposition it
- Tap a button → pick a different icon from the grid, or clear it back to
  a text label
- Tap "+ Add button" → add any of 12 ready-made WASD/keyboard-key presets
  (Forward/Left/Back/Right, Sprint, Crouch, Jump, Reload, Interact,
  Fire/Use, Melee, Map)
- Every change autosaves to the device (localStorage) immediately
- "Reset to default layout" restores the original 13-button gamepad

## What this does NOT yet do

- **The overlay is not shown during an actual stream yet.**
  `TouchGamepad` is still not mounted inside `StreamView.tsx` — this was
  intentionally left out of this delivery (see the earlier project plan,
  Part 4 / Step 7) so it can be wired up and tested as its own separate,
  small step once everything above is confirmed working in the editor.
- Your real SVG icon set is not included — 16 circle placeholders stand
  in for now. Swap file contents in `assets/gamepad-icons/` (same
  filenames) whenever your set is ready; no code changes needed for that.

## Rebrand reminder (MrbNow / Play Store)

This codebase is MIT-licensed (from OpenNOW / com.zortos.opennow). Before
publishing as MrbNow: change `applicationId` in `android/app/build.gradle`,
update `strings.xml` / `capacitor.config.json` app name, replace splash
assets, and keep the MIT license + original copyright notice somewhere in
the app or repo. Full checklist is in the earlier
`MrbNow-Gamepad-Overlay-Plan.docx` you already have.
