# Patch 2 — gfn/webrtcClient.ts

Two small additions. Nothing existing is deleted or restructured.

## Addition A — import codeMap at the top of the file

Find the existing import block that already pulls from inputProtocol.ts
(it currently imports `mapKeyboardEvent` among others, around line 12):

```ts
import {
  mapKeyboardEvent,
  // ...other existing imports stay exactly as they are...
} from "./inputProtocol";
```

Add `codeMap` to that same import list:

```ts
import {
  mapKeyboardEvent,
  codeMap,
  // ...other existing imports stay exactly as they are...
} from "./inputProtocol";
```

## Addition B — new public method, placed next to the other touch/Android

## helpers (around line 2978, right after `sendGamepadStick`)

```ts
  /**
   * Send a keyboard key down/up using a KeyboardEvent.code string
   * (e.g. "KeyW", "ShiftLeft", "Space"). This reuses the exact same
   * encode + send path as the on-screen paste/type keyboard —
   * no new wire format, just a public entry point for the custom
   * on-screen gamepad buttons (WASD etc.) to call.
   */
  public sendVirtualKey(code: string, isDown: boolean): void {
    if (!this.inputReady) return;
    const mapped = codeMap[code];
    if (!mapped) return; // unknown code string — silently ignore
    this.sendKeyPacket(mapped.vk, mapped.scancode, 0, isDown);
  }
```

This works because `sendKeyPacket` is a **private** method on the same
class (`GfnWebRtcClient`) — `sendVirtualKey` is also a method on that
class, so it's allowed to call the private method directly. You do NOT
need to change `sendKeyPacket`'s visibility at all; leave it `private`.

## Nothing else in this file changes.

Everything else — `sendGamepadButton`, `sendGamepadStick`, the keydown/keyup
DOM listeners, `sendKeyPacket` itself — stays exactly as it is today.
