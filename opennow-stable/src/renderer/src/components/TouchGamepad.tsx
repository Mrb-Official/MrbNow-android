/**
 * TouchGamepad.tsx
 *
 * An on-screen virtual gamepad for Android / touch devices.
 *
 * This is now DATA-DRIVEN: every button rendered comes from the layout
 * array (see utils/gamepadLayoutStore.ts). The original Xbox-style
 * buttons (A/B/X/Y, D-pad, sticks, shoulders, Start/Back) are simply the
 * *default contents* of that array — their behaviour (sendGamepadButton /
 * sendGamepadStick calls) is unchanged from before. Custom keyboard-key
 * buttons (WASD etc.) use the same rendering path but call
 * sendVirtualKey() instead.
 *
 * All input is forwarded to the GfnWebRtcClient via its public touch
 * helpers. The component is invisible on desktop -- it only renders
 * when the device has a touch screen and the stream is active.
 *
 * NOTE: this component is not yet mounted inside StreamView.tsx.
 * Mounting it there is a separate, deferred step (see project plan).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import type { GfnWebRtcClient } from "../gfn/webrtcClient";
import {
  GAMEPAD_DPAD_UP, GAMEPAD_DPAD_DOWN, GAMEPAD_DPAD_LEFT, GAMEPAD_DPAD_RIGHT,
} from "../gfn/inputProtocol";
import {
  getLayout,
  type GamepadButtonConfig,
} from "../utils/gamepadLayoutStore";

interface Props {
  clientRef: React.RefObject<GfnWebRtcClient | null>;
  visible: boolean;
  /**
   * Optional: pass a specific layout (e.g. a live preview while editing).
   * If omitted, the component loads the saved layout from storage itself.
   */
  layoutOverride?: GamepadButtonConfig[];
}

// Clamp a number to [-1, 1].
function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

/**
 * Resolve an icon filename to its imported asset URL.
 * Icons live in src/renderer/src/assets/gamepad-icons/<file>.svg
 * Vite's import.meta.glob eagerly loads every SVG in that folder so any
 * filename referenced by a button config just has to exist there — no
 * per-icon import statement needs to be added by hand.
 */
const iconModules = import.meta.glob<{ default: string }>(
  "../assets/gamepad-icons/*.svg",
  { eager: true },
);

function resolveIconUrl(filename: string | null): string | null {
  if (!filename) return null;
  const key = `../assets/gamepad-icons/${filename}`;
  const mod = iconModules[key];
  return mod ? mod.default : null;
}

// ── Generic pressable button (covers gamepad-flag buttons and key buttons) ─

interface DynamicButtonProps {
  config: GamepadButtonConfig;
  clientRef: React.RefObject<GfnWebRtcClient | null>;
}

function DynamicButton({ config, clientRef }: DynamicButtonProps): JSX.Element {
  const [pressed, setPressed] = useState(false);
  const iconUrl = resolveIconUrl(config.icon);

  const onPress = useCallback(() => {
    setPressed(true);
    if (config.type === "gamepad" && typeof config.target === "number") {
      clientRef.current?.sendGamepadButton(config.target, true);
    } else if (config.type === "key" && typeof config.target === "string") {
      clientRef.current?.sendVirtualKey(config.target, true);
    }
  }, [clientRef, config]);

  const onRelease = useCallback(() => {
    setPressed(false);
    if (config.type === "gamepad" && typeof config.target === "number") {
      clientRef.current?.sendGamepadButton(config.target, false);
    } else if (config.type === "key" && typeof config.target === "string") {
      clientRef.current?.sendVirtualKey(config.target, false);
    }
  }, [clientRef, config]);

  return (
    <button
      type="button"
      className={`tgp-dyn-btn ${pressed ? "tgp-dyn-btn--pressed" : ""}`}
      style={{
        position: "absolute",
        left: `${config.x * 100}%`,
        top: `${config.y * 100}%`,
        width: config.size,
        height: config.size,
        transform: "translate(-50%, -50%)",
      }}
      aria-label={config.label}
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(); }}
      onTouchCancel={(e) => { e.preventDefault(); onRelease(); }}
    >
      {iconUrl ? (
        <img src={iconUrl} alt="" className="tgp-dyn-btn-icon" draggable={false} />
      ) : (
        <span className="tgp-dyn-btn-label">{config.label}</span>
      )}
    </button>
  );
}

// ── D-pad (special-cased: one config entry renders the whole 4-way cross) ─

interface DpadProps {
  config: GamepadButtonConfig;
  clientRef: React.RefObject<GfnWebRtcClient | null>;
}

function Dpad({ config, clientRef }: DpadProps): JSX.Element {
  const pressedFlags = useRef(new Set<number>());

  const press = useCallback((flag: number) => {
    if (pressedFlags.current.has(flag)) return;
    pressedFlags.current.add(flag);
    clientRef.current?.sendGamepadButton(flag, true);
  }, [clientRef]);

  const release = useCallback((flag: number) => {
    if (!pressedFlags.current.has(flag)) return;
    pressedFlags.current.delete(flag);
    clientRef.current?.sendGamepadButton(flag, false);
  }, [clientRef]);

  const releaseAll = useCallback(() => {
    for (const flag of pressedFlags.current) {
      clientRef.current?.sendGamepadButton(flag, false);
    }
    pressedFlags.current.clear();
  }, [clientRef]);

  const flagsFromPosition = (el: HTMLElement, cx: number, cy: number): number[] => {
    const rect = el.getBoundingClientRect();
    const x = (cx - rect.left) / rect.width - 0.5;
    const y = (cy - rect.top) / rect.height - 0.5;

    const flags: number[] = [];
    if (y < -0.2) flags.push(GAMEPAD_DPAD_UP);
    if (y > 0.2) flags.push(GAMEPAD_DPAD_DOWN);
    if (x < -0.2) flags.push(GAMEPAD_DPAD_LEFT);
    if (x > 0.2) flags.push(GAMEPAD_DPAD_RIGHT);
    return flags;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    for (const t of Array.from(e.changedTouches)) {
      for (const f of flagsFromPosition(target, t.clientX, t.clientY)) press(f);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const next = new Set<number>();
    for (const t of Array.from(e.touches)) {
      for (const f of flagsFromPosition(target, t.clientX, t.clientY)) next.add(f);
    }
    for (const f of pressedFlags.current) {
      if (!next.has(f)) release(f);
    }
    for (const f of next) {
      press(f);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.touches.length === 0) releaseAll();
  };

  return (
    <div
      className="tgp-dpad"
      style={{
        position: "absolute",
        left: `${config.x * 100}%`,
        top: `${config.y * 100}%`,
        width: config.size,
        height: config.size,
        transform: "translate(-50%, -50%)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="tgp-dpad-cross">
        <div className="tgp-dpad-up" />
        <div className="tgp-dpad-row">
          <div className="tgp-dpad-left" />
          <div className="tgp-dpad-center" />
          <div className="tgp-dpad-right" />
        </div>
        <div className="tgp-dpad-down" />
      </div>
    </div>
  );
}

// ── Analog thumbstick (special-cased: config picks left/right via stickSide) ─

interface ThumbstickProps {
  config: GamepadButtonConfig;
  clientRef: React.RefObject<GfnWebRtcClient | null>;
}

function Thumbstick({ config, clientRef }: ThumbstickProps): JSX.Element {
  const side = config.stickSide ?? "left";
  const stickRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const RADIUS = config.size / 2.6; // how far the knob can travel from centre

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (activeId.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    activeId.current = touch.identifier;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const base = stickRef.current;
    if (!base || activeId.current === null) return;

    let touch: React.Touch | undefined;
    for (const t of Array.from(e.touches)) {
      if (t.identifier === activeId.current) { touch = t; break; }
    }
    if (!touch) return;

    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }

    setOffset({ x: dx, y: dy });

    const nx = clamp(dx / RADIUS);
    const ny = clamp(dy / RADIUS);
    clientRef.current?.sendGamepadStick(side, nx, ny);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    let found = false;
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === activeId.current) { found = true; break; }
    }
    if (!found) return;

    activeId.current = null;
    setOffset({ x: 0, y: 0 });
    clientRef.current?.sendGamepadStick(side, 0, 0);
  };

  return (
    <div
      ref={stickRef}
      className="tgp-stick"
      style={{
        position: "absolute",
        left: `${config.x * 100}%`,
        top: `${config.y * 100}%`,
        width: config.size,
        height: config.size,
        transform: "translate(-50%, -50%)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="tgp-stick-knob"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export function TouchGamepad({ clientRef, visible, layoutOverride }: Props): JSX.Element | null {
  const [layout, setLayout] = useState<GamepadButtonConfig[]>(() => layoutOverride ?? getLayout());

  // Pick up layout changes made in the editor (e.g. if the editor is a
  // modal over the same page rather than a full navigation).
  useEffect(() => {
    if (layoutOverride) {
      setLayout(layoutOverride);
      return;
    }
    setLayout(getLayout());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "mrbnow_gamepad_layout_v1") {
        setLayout(getLayout());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [layoutOverride]);

  if (!visible) return null;

  return (
    <div className="tgp">
      {layout.map((config) => {
        if (config.type === "dpad") {
          return <Dpad key={config.id} config={config} clientRef={clientRef} />;
        }
        if (config.type === "stick") {
          return <Thumbstick key={config.id} config={config} clientRef={clientRef} />;
        }
        return <DynamicButton key={config.id} config={config} clientRef={clientRef} />;
      })}
    </div>
  );
}
