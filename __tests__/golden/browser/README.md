Run `yarn golden:browser` from the repository root after the jsdom goldens exist.

```text
lib source ─▶ webpack ─▶ Chromium mouse input ─▶ shared recorder
                                                     │
jsdom .golden.json ───────────────────────────────────┴─▶ exact comparison
```

Install this directory's pinned Playwright dependency separately when needed:

```sh
npm install --prefix __tests__/golden/browser
__tests__/golden/browser/node_modules/.bin/playwright install chromium
yarn golden:browser
```

The runner never downloads dependencies or browsers. `PLAYWRIGHT_MODULE` can
point to an existing Playwright installation. `PLAYWRIGHT_CHROMIUM_EXECUTABLE`
can select an existing Chromium executable when its cached revision differs
from Playwright's default. The root package does not depend on Playwright.

The shared `browserScenarios` select both components, all eight handles, both
anchors, scale changes, and current edge-case behavior. Every case uses real
Chromium layout and trusted mouse input. Each gesture starts at the actual
handle center. Recorded input coordinates remain relative to that center so
they match jsdom's input schema. The displaced-mouseup case uses Chromium's
input protocol to release at a new location without inserting a mousemove.
The stage has room on every side so growing north/west handles stay within the
viewport during the all-handles case. The aspect/max example uses integer sizes;
jsdom and Chromium serialize fractional CSS dimensions with different precision.
The full drifting sequence remains pinned in the jsdom suite.

Every input runs inside an async React `act` scope. The runner waits for the
commit before recording the DOM, matching jsdom's per-event cadence. A controlled
animation-frame queue gives selection cleanup its own final checkpoint.

The comparison includes ordered callbacks, exact sizes, event type and kind,
handle identity, errors, input steps, and every recorded DOM field including
body selection state. The only excluded field is `steps[*].rectReads`, which
counts jsdom's simulated layout calls. Chromium uses native layout, and choosing
the mouse origin adds a real layout read. Expected files are read-only. Missing
files fail the run.

Webpack output and mismatch traces stay in the temporary directory printed by
the runner. Browser launch failures print the full Playwright diagnostic and
fail the command.
