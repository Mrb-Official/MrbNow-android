# Patch 1 — gfn/inputProtocol.ts

Only ONE line changes in this file. Everything else is untouched.

## Find (around line 84):

```ts
const codeMap: Record<string, { vk: number; scancode: number }> = {
```

## Replace with:

```ts
export const codeMap: Record<string, { vk: number; scancode: number }> = {
```

That's it — just adding the `export` keyword so `webrtcClient.ts` can import
`codeMap` and look up the vk/scancode for any KeyboardEvent.code string
(e.g. "KeyW", "ShiftLeft", "Space") without duplicating the table.

No other line in inputProtocol.ts needs to change.
