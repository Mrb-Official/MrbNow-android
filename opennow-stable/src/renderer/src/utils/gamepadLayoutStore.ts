/**
 * gamepadLayoutStore.ts
 *
 * Storage + data model for the customizable on-screen gamepad overlay.
 *
 * Every button the user sees on screen -- whether it's one of the original
 * Xbox-style buttons (A/B/X/Y/LB/RB/etc.) or a custom keyboard-key button
 * (WASD, or anything else the user adds) -- is represented by the SAME
 * `GamepadButtonConfig` shape and lives in the SAME array. There is no
 * separate "old system" vs "new system": the original 13 entries below
 * are simply the *default* contents of that array.
 *
 * Persistence uses plain localStorage (works fine inside a Capacitor
 * WebView) so no extra native plugin is required.
 */

import {
  GAMEPAD_A, GAMEPAD_B, GAMEPAD_X, GAMEPAD_Y,
  GAMEPAD_LB, GAMEPAD_RB,
  GAMEPAD_START, GAMEPAD_BACK,
} from "../gfn/inputProtocol";

// ── Types ────────────────────────────────────────────────────────────────

/** How the button's press/release should be delivered. */
export type GamepadButtonType =
  | "gamepad"   // sends an XInput flag via sendGamepadButton()
  | "key"       // sends a keyboard scancode via sendVirtualKey()
  | "dpad"      // special-cased: renders the 4-way D-pad cluster
  | "stick";    // special-cased: renders an analog thumbstick

export interface GamepadButtonConfig {
  /** Unique id, e.g. "btn-a", "key-w". Stable across edits. */
  id: string;
  type: GamepadButtonType;
  /**
   * For type "gamepad": one of the GAMEPAD_* flags (number).
   * For type "key": a KeyboardEvent.code string, e.g. "KeyW" (must exist in inputProtocol's codeMap).
   * For type "dpad" / "stick": unused (kept null).
   */
  target: number | string | null;
  /** For type "stick": which stick this drives. Unused otherwise. */
  stickSide?: "left" | "right";
  /** Shown if no icon is set, and used as accessible label. */
  label: string;
  /**
   * Filename inside src/renderer/src/assets/gamepad-icons/, e.g. "jump.svg".
   * Null = fall back to showing `label` as text.
   */
  icon: string | null;
  /** Relative position on screen, 0.0–1.0 of the overlay's width/height. */
  x: number;
  y: number;
  /** Diameter/size in px. Sticks and dpad use this as their outer size. */
  size: number;
  /** If false, the layout editor will not offer a delete option for this entry. */
  removable: boolean;
}

// ── Default layout (== today's hardcoded TouchGamepad.tsx, just as data) ──

export const DEFAULT_GAMEPAD_LAYOUT: GamepadButtonConfig[] = [
  // Left side
  { id: "btn-lt",   type: "gamepad", target: GAMEPAD_LB, label: "LT", icon: null, x: 0.04, y: 0.58, size: 56, removable: false },
  { id: "btn-lb",   type: "gamepad", target: GAMEPAD_LB, label: "LB", icon: null, x: 0.04, y: 0.70, size: 56, removable: false },
  { id: "dpad",     type: "dpad",    target: null,       label: "D-Pad", icon: null, x: 0.14, y: 0.86, size: 132, removable: false },
  { id: "stick-l",  type: "stick",   target: null, stickSide: "left",  label: "Left Stick", icon: null, x: 0.30, y: 0.86, size: 96, removable: false },

  // Centre
  { id: "btn-back",  type: "gamepad", target: GAMEPAD_BACK,  label: "Back",  icon: null, x: 0.44, y: 0.92, size: 44, removable: false },
  { id: "btn-start", type: "gamepad", target: GAMEPAD_START, label: "Start", icon: null, x: 0.56, y: 0.92, size: 44, removable: false },

  // Right side
  { id: "btn-rb",   type: "gamepad", target: GAMEPAD_RB, label: "RB", icon: null, x: 0.96, y: 0.70, size: 56, removable: false },
  { id: "btn-rt",   type: "gamepad", target: GAMEPAD_RB, label: "RT", icon: null, x: 0.96, y: 0.58, size: 56, removable: false },
  { id: "stick-r",  type: "stick",   target: null, stickSide: "right", label: "Right Stick", icon: null, x: 0.70, y: 0.86, size: 96, removable: false },
  { id: "btn-y", type: "gamepad", target: GAMEPAD_Y, label: "Y", icon: "jump.svg",  x: 0.86, y: 0.74, size: 56, removable: false },
  { id: "btn-x", type: "gamepad", target: GAMEPAD_X, label: "X", icon: "reload.svg", x: 0.80, y: 0.80, size: 56, removable: false },
  { id: "btn-b", type: "gamepad", target: GAMEPAD_B, label: "B", icon: "melee.svg", x: 0.92, y: 0.80, size: 56, removable: false },
  { id: "btn-a", type: "gamepad", target: GAMEPAD_A, label: "A", icon: "crouch.svg", x: 0.86, y: 0.86, size: 56, removable: false },
];

// ── Ready-made catalog of extra buttons the user can add from the editor ──
// (Editor "Add button" list starts here — icons are placeholders, see the
// assets/gamepad-icons/ README for the exact filenames to supply.)

export const ADDABLE_BUTTON_PRESETS: Omit<GamepadButtonConfig, "x" | "y">[] = [
  { id: "key-w", type: "key", target: "KeyW", label: "Forward", icon: "run.svg",   size: 56, removable: true },
  { id: "key-a", type: "key", target: "KeyA", label: "Left",    icon: "strafe-left.svg",  size: 56, removable: true },
  { id: "key-s", type: "key", target: "KeyS", label: "Back",    icon: "strafe-back.svg",  size: 56, removable: true },
  { id: "key-d", type: "key", target: "KeyD", label: "Right",   icon: "strafe-right.svg", size: 56, removable: true },
  { id: "key-shift", type: "key", target: "ShiftLeft", label: "Sprint", icon: "sprint.svg", size: 52, removable: true },
  { id: "key-ctrl",  type: "key", target: "ControlLeft", label: "Crouch", icon: "crouch-key.svg", size: 52, removable: true },
  { id: "key-space", type: "key", target: "Space", label: "Jump", icon: "jump-key.svg", size: 52, removable: true },
  { id: "key-r", type: "key", target: "KeyR", label: "Reload", icon: "reload-key.svg", size: 52, removable: true },
  { id: "key-e", type: "key", target: "KeyE", label: "Interact", icon: "interact.svg", size: 52, removable: true },
  { id: "key-f", type: "key", target: "KeyF", label: "Fire/Use", icon: "fire.svg", size: 52, removable: true },
  { id: "key-v", type: "key", target: "KeyV", label: "Melee", icon: "melee-key.svg", size: 52, removable: true },
  { id: "key-tab", type: "key", target: "Tab", label: "Map", icon: "map.svg", size: 52, removable: true },
];

// ── Storage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "mrbnow_gamepad_layout_v1";

/** Read the saved layout, or return the default layout if nothing is saved yet / parsing fails. */
export function getLayout(): GamepadButtonConfig[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GAMEPAD_LAYOUT;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_GAMEPAD_LAYOUT;
    return parsed as GamepadButtonConfig[];
  } catch {
    return DEFAULT_GAMEPAD_LAYOUT;
  }
}

/** Persist the full layout array. */
export function saveLayout(layout: GamepadButtonConfig[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage full/unavailable — fail silently, layout just won't persist this time.
  }
}

/** Reset back to the original default layout (discards all customization). */
export function resetToDefault(): GamepadButtonConfig[] {
  saveLayout(DEFAULT_GAMEPAD_LAYOUT);
  return DEFAULT_GAMEPAD_LAYOUT;
}

/** Add a new button (from a preset or fully custom) at a given position. */
export function addButton(
  current: GamepadButtonConfig[],
  preset: Omit<GamepadButtonConfig, "x" | "y">,
  x = 0.5,
  y = 0.5,
): GamepadButtonConfig[] {
  // Ensure unique id even if the same preset is added twice.
  const existingIds = new Set(current.map((b) => b.id));
  let id = preset.id;
  let n = 2;
  while (existingIds.has(id)) {
    id = `${preset.id}-${n}`;
    n += 1;
  }
  const next = [...current, { ...preset, id, x, y }];
  saveLayout(next);
  return next;
}

/** Remove a button by id. Buttons with removable=false are protected. */
export function removeButton(current: GamepadButtonConfig[], id: string): GamepadButtonConfig[] {
  const target = current.find((b) => b.id === id);
  if (!target || !target.removable) return current;
  const next = current.filter((b) => b.id !== id);
  saveLayout(next);
  return next;
}

/** Update a button's screen position (called continuously while dragging in the editor). */
export function updateButtonPosition(
  current: GamepadButtonConfig[],
  id: string,
  x: number,
  y: number,
): GamepadButtonConfig[] {
  const next = current.map((b) =>
    b.id === id
      ? { ...b, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
      : b,
  );
  saveLayout(next);
  return next;
}

/** Update a button's icon (icon-picker calls this after the user selects an SVG). */
export function updateButtonIcon(
  current: GamepadButtonConfig[],
  id: string,
  iconFilename: string | null,
): GamepadButtonConfig[] {
  const next = current.map((b) => (b.id === id ? { ...b, icon: iconFilename } : b));
  saveLayout(next);
  return next;
}
