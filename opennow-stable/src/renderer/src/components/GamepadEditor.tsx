/**
 * GamepadEditor.tsx
 *
 * Settings screen: "Gamepad Layout" editor.
 *
 * Opens from SettingsPage without requiring a stream to be running.
 * Renders the SAME TouchGamepad component in a preview box, but every
 * button becomes draggable, tappable-to-configure (icon + remove), and
 * there's an "Add button" list of presets (WASD, sprint, jump, etc.)
 * pulled from ADDABLE_BUTTON_PRESETS.
 *
 * All changes save immediately via gamepadLayoutStore (localStorage),
 * so closing the editor is enough — there's no separate "Save" step,
 * matching the toggle-style pattern already used elsewhere in
 * SettingsPage.tsx.
 */

import { useRef, useState } from "react";
import type { JSX } from "react";
import {
  getLayout,
  saveLayout,
  resetToDefault,
  addButton,
  removeButton,
  updateButtonPosition,
  updateButtonIcon,
  ADDABLE_BUTTON_PRESETS,
  type GamepadButtonConfig,
} from "../utils/gamepadLayoutStore";

// Same glob approach as TouchGamepad.tsx — every SVG dropped into
// assets/gamepad-icons/ becomes selectable here automatically.
const iconModules = import.meta.glob<{ default: string }>(
  "../assets/gamepad-icons/*.svg",
  { eager: true },
);

function iconUrl(filename: string): string {
  return iconModules[`../assets/gamepad-icons/${filename}`]?.default ?? "";
}

function availableIconFilenames(): string[] {
  return Object.keys(iconModules)
    .map((path) => path.split("/").pop() ?? "")
    .filter(Boolean)
    .sort();
}

interface Props {
  onClose: () => void;
}

export function GamepadEditor({ onClose }: Props): JSX.Element {
  const [layout, setLayout] = useState<GamepadButtonConfig[]>(() => getLayout());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddList, setShowAddList] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragId = useRef<string | null>(null);

  const selected = layout.find((b) => b.id === selectedId) ?? null;

  // ── Drag to reposition ──────────────────────────────────────────────

  function handlePointerDown(id: string) {
    dragId.current = id;
    setSelectedId(id);
  }

  function handlePointerMove(clientX: number, clientY: number) {
    const box = previewRef.current;
    if (!box || !dragId.current) return;
    const rect = box.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setLayout((prev) => updateButtonPosition(prev, dragId.current as string, x, y));
  }

  function handlePointerUp() {
    dragId.current = null;
  }

  // ── Add / remove ─────────────────────────────────────────────────────

  function handleAddPreset(presetId: string) {
    const preset = ADDABLE_BUTTON_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setLayout((prev) => addButton(prev, preset, 0.5, 0.5));
    setShowAddList(false);
  }

  function handleRemoveSelected() {
    if (!selected) return;
    setLayout((prev) => removeButton(prev, selected.id));
    setSelectedId(null);
  }

  function handleIconPick(filename: string) {
    if (!selected) return;
    setLayout((prev) => updateButtonIcon(prev, selected.id, filename));
  }

  function handleClearIcon() {
    if (!selected) return;
    setLayout((prev) => updateButtonIcon(prev, selected.id, null));
  }

  function handleResetAll() {
    setLayout(resetToDefault());
    setSelectedId(null);
  }

  // Explicit save button, in addition to autosave-on-change, so the user
  // has a clear "done editing" affordance (also just re-persists current
  // state in case of any missed autosave path).
  function handleDone() {
    saveLayout(layout);
    onClose();
  }

  const icons = availableIconFilenames();

  return (
    <div className="gpe-overlay">
      <div className="gpe-panel">
        <div className="gpe-header">
          <h2>Gamepad Layout</h2>
          <button type="button" className="gpe-close-btn" onClick={handleDone} aria-label="Close editor">
            &#10005;
          </button>
        </div>

        <p className="gpe-hint">
          Drag any button to reposition it. Tap a button to change its icon or remove it.
          This works without starting a game — changes save automatically.
        </p>

        {/* Live, editable preview of the overlay */}
        <div
          ref={previewRef}
          className="gpe-preview"
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (t) handlePointerMove(t.clientX, t.clientY);
          }}
          onTouchEnd={handlePointerUp}
        >
          {layout.map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={`gpe-preview-btn ${selectedId === btn.id ? "gpe-preview-btn--selected" : ""}`}
              style={{
                left: `${btn.x * 100}%`,
                top: `${btn.y * 100}%`,
                width: btn.size,
                height: btn.size,
              }}
              onMouseDown={() => handlePointerDown(btn.id)}
              onTouchStart={() => handlePointerDown(btn.id)}
            >
              {btn.icon && iconUrl(btn.icon) ? (
                <img src={iconUrl(btn.icon)} alt="" draggable={false} />
              ) : (
                <span>{btn.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Inspector for the currently selected button */}
        {selected && (
          <div className="gpe-inspector">
            <div className="gpe-inspector-title">{selected.label}</div>

            <div className="gpe-icon-grid">
              <button
                type="button"
                className={`gpe-icon-swatch ${!selected.icon ? "gpe-icon-swatch--active" : ""}`}
                onClick={handleClearIcon}
                title="No icon (show text label)"
              >
                Aa
              </button>
              {icons.map((filename) => (
                <button
                  key={filename}
                  type="button"
                  className={`gpe-icon-swatch ${selected.icon === filename ? "gpe-icon-swatch--active" : ""}`}
                  onClick={() => handleIconPick(filename)}
                  title={filename}
                >
                  <img src={iconUrl(filename)} alt={filename} draggable={false} />
                </button>
              ))}
            </div>

            {selected.removable && (
              <button type="button" className="gpe-remove-btn" onClick={handleRemoveSelected}>
                Remove this button
              </button>
            )}
          </div>
        )}

        {/* Add-button flow */}
        <div className="gpe-actions">
          <button type="button" className="gpe-add-btn" onClick={() => setShowAddList((v) => !v)}>
            + Add button
          </button>
          <button type="button" className="gpe-reset-btn" onClick={handleResetAll}>
            Reset to default layout
          </button>
        </div>

        {showAddList && (
          <div className="gpe-add-list">
            {ADDABLE_BUTTON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="gpe-add-list-item"
                onClick={() => handleAddPreset(preset.id)}
              >
                {preset.icon && iconUrl(preset.icon) ? (
                  <img src={iconUrl(preset.icon)} alt="" draggable={false} />
                ) : (
                  <span className="gpe-add-list-fallback">{preset.label[0]}</span>
                )}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        )}

        <button type="button" className="gpe-done-btn" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
}
