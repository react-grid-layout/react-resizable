# Golden interaction traces

These files freeze observable behavior before resize refactors. They include
known bugs. Explain every golden diff in the PR, including intentional changes
to layout-read counts.

```text
scenarios.ts → harness.ts → real DraggableCore → recorder.ts
                                                   ↓
                              __golden__/<name>.golden.json
```

Run the suite with `corepack yarn test`. To regenerate committed traces, run:

```sh
corepack yarn golden:update
```

Review the diff before committing. Normal runs fail for missing or changed files;
they never create fixtures. `GOLDEN_UPDATE=1` is the only write switch. The serializer
sorts object keys, keeps one step per line, and represents `undefined`, nonfinite
numbers, and negative zero with tagged JSON objects. Floats retain full precision.

## What the traces pin

| Boundary | Recorded evidence |
| --- | --- |
| Callback stream | Ordered start/resize/stop, exact sizes, axis, event type and synthetic/native kind |
| Node identity | Callback node equals the handle, stable IDs across re-renders |
| Rendering | Width/height styles after each event, handle axes/classes/order, child attributes |
| Layout work | Cumulative box/handle/other `getBoundingClientRect` call counts |
| Lifecycle | User-select class, explicit animation-frame cleanup, unmount, StrictMode |
| Broken inputs | Missing dimensions, nonfinite results, missing handle ref error |

The matrix covers both components, every handle alone and all together, all axis
settings, both anchors, and both render cadences. Targeted combinations exercise
constraints and slack, aspect locking, transform scales, custom handles, mouse and
touch, controlled parents that follow/reject/clamp sizes, and draggable options.

Each event in cadence A (`per-event`) has its own `act()`. Cadence B (`batched`)
uses one `act()` for the whole gesture, with a separate flush checkpoint. Native
DOM dispatch avoids Testing Library's implicit per-event wrapping. The separate
`native-burst` scenario deliberately dispatches outside `act()` and flushes after
release to expose ResizableBox's delayed user callbacks.

The fake layout derives rects from inline dimensions. With `bottomright`
anchoring, growing the box moves its left/top and changes DraggableCore's
coordinates relative to the offset parent. This makes north/west correction
observable. The layout patch restores the original own property descriptors,
including the absence of a descriptor. It does not stub drag handlers.

Animation frames drain at explicit checkpoints so selection cleanup does not
depend on wall-clock timing. Frames queued by one gesture drain, unrecorded,
before the next gesture starts, as real frames would between separate drags.
The final gesture's frames drain in the recorded `animation-frame` step. The recorder never reads layout itself.

## Known bugs

Named scenarios carry `"knownBug": "<audit id>: <one line>"` in their metadata.
IDs refer to section 5 of the pre-refactor audit. Keep the marker while the broken
behavior is expected. A bug fix must explain its golden diff and remove or update
the marker in the same PR.

| ID | Behavior |
| --- | --- |
| 5.1 | Binding max distorts the aspect ratio and subsequent projections drift |
| 5.2 | Aspect locking changes height with `axis="x"` |
| 5.3a/b/c | Missing width, zero height with lock, and zero scale produce nonfinite sizes |
| 5.4 | ResizableBox user `onResize` callbacks can commit after stop |
| 5.5 | Mouseup's final delta is dropped |
| 5.6 | Draggable callback options and nodeRef are overwritten |
| 5.7 | A function handle without its ref throws on mousedown |
| 5.8 | Start reports constrained dimensions before the DOM has that size |
| 5.9 | Disabled or incompatible axes suppress start/stop callbacks |
| 5.11 | An element handle's existing ref is overwritten |

## Browser cross-check

See [browser/README.md](browser/README.md). The browser subset uses real mouse
input and real CSS layout against `lib/` source, then compares shared observable
fields with the jsdom goldens. Browser tests run separately from Jest.
