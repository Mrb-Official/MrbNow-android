# Patch 3 — components/SettingsPage.tsx

Two small additions. Nothing existing is deleted.

## Addition A — import at the top of the file

Right after the existing imports (around line 17), add:

```ts
import { GamepadEditor } from "./GamepadEditor";
```

## Addition B — local state for whether the editor is open

Inside `export function SettingsPage(...)`, near the other `useState` calls
at the top of the function body, add:

```ts
const [gamepadEditorOpen, setGamepadEditorOpen] = useState(false);
```

## Addition C — new row inside the existing "Input" section

Find the `<h2>Input</h2>` block (around line 1212). Right after its closing
`</div>` for `.settings-rows` — or simply as the first row inside that same
`.settings-rows` div, next to "Clipboard Paste" — add a new row:

```tsx
<div className="settings-row">
  <label className="settings-label">
    Gamepad Layout
    <span className="settings-hint">
      Customize on-screen gamepad buttons, icons, and keyboard-key buttons (WASD, sprint, etc).
      No game session required.
    </span>
  </label>
  <button
    type="button"
    className="settings-shortcut-reset-btn"
    onClick={() => setGamepadEditorOpen(true)}
  >
    Edit Layout
  </button>
</div>
```

## Addition D — render the editor modal

Near the end of the component's returned JSX (as a sibling to the main
settings markup, so it overlays on top — same pattern as any other modal
already conditionally rendered in this file), add:

```tsx
{gamepadEditorOpen && (
  <GamepadEditor onClose={() => setGamepadEditorOpen(false)} />
)}
```

That's the entire SettingsPage.tsx change — 4 small additions, no existing
markup or logic touched.
