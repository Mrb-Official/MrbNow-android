# gamepad-icons/ — exact filenames expected

This folder currently contains 16 PLACEHOLDER svg files (a plain circle
each) so the app builds and runs immediately. Replace each file's
CONTENTS with your real icon — keep the exact filename, or the button
that references it will silently fall back to showing its text label.

Recommended source: Lucide Icons (MIT licensed, already used elsewhere
in this codebase via lucide-react) — https://lucide.dev
You can export any Lucide icon as raw SVG and drop it in here with the
matching filename below, or draw your own.

## Filenames already wired to a button in gamepadLayoutStore.ts

| Filename            | Used by (default layout)      | Suggested meaning       |
|---------------------|--------------------------------|--------------------------|
| jump.svg            | Y button (default layout)      | Jump                     |
| reload.svg          | X button (default layout)      | Reload                   |
| melee.svg           | B button (default layout)      | Melee / knife            |
| crouch.svg          | A button (default layout)      | Crouch                   |
| run.svg             | "Forward" (KeyW) addable preset| Run / move forward       |
| strafe-left.svg     | "Left" (KeyA) addable preset   | Strafe left              |
| strafe-back.svg     | "Back" (KeyS) addable preset   | Move backward            |
| strafe-right.svg    | "Right" (KeyD) addable preset  | Strafe right             |
| sprint.svg          | "Sprint" (ShiftLeft) preset    | Sprint                   |
| crouch-key.svg      | "Crouch" (ControlLeft) preset  | Crouch (keyboard variant)|
| jump-key.svg        | "Jump" (Space) preset          | Jump (keyboard variant)  |
| reload-key.svg      | "Reload" (KeyR) preset         | Reload (keyboard variant)|
| interact.svg        | "Interact" (KeyE) preset       | Interact / use           |
| fire.svg            | "Fire/Use" (KeyF) preset       | Fire / use item          |
| melee-key.svg       | "Melee" (KeyV) preset          | Melee (keyboard variant) |
| map.svg             | "Map" (Tab) preset             | Open map                 |

## Adding MORE icons beyond this list

You are not limited to these 16. In the Gamepad Layout editor, the icon
picker shows every .svg file placed in this folder automatically — no
code change required. To make a brand-new icon selectable, just drop a
new .svg file here with any filename you like; it will appear in the
editor's icon grid on next load.

To attach a *new* addable preset button (not just an icon) to a specific
key or gamepad flag, add an entry to `ADDABLE_BUTTON_PRESETS` in
`src/renderer/src/utils/gamepadLayoutStore.ts` — that's the only other
file that needs to know a new button preset exists.

## Format notes

- Keep icons roughly square, ~24x24 viewBox, single color (`currentColor`
  or a fixed hex) works best — they're displayed at small fixed sizes.
- SVG only (matches import.meta.glob pattern in TouchGamepad.tsx /
  GamepadEditor.tsx: `"../assets/gamepad-icons/*.svg"`).
