# Changelog

### 1.4.5 (Sep 30, 2016)

- Fix bad publish

### 1.4.4 (Sep 30, 2016)

- Bugfix: Minor flow errors

### 1.4.3 (Sep 27, 2016)

- Bugfix: Don't pass `onResize` in `<ResizableBox>`.
- Bugfix: Fix new Flow errors (type parameters no longer optional).

### 1.4.2 (July 1, 2016)

- Bugfix: Don't pass unknown props to underlying DOM element. Fixes React 15.2.0 warnings.

### 1.4.1 (May 23, 2016)

- Bugfix: Resizable handle should have a `key` when injected. Fixes React warnings on custom components.

### 1.4.0 (May 20, 2016)

- Update to React-Draggable v2, which changed callback data structure.

### 1.3.4 (May 17, 2016)

- Bugfix: Slack was not being reset on resizeStop. Fixes #34, #36.
- Added `flow-bin` to devDeps.

### 1.3.3 (Apr 19, 2016)

- Enhancement: Add Flow comments.

### 1.3.2 (Apr 8, 2016)

- Bugfix: Prevent `width` and `height` from leaking to the underlying DOM element and being written.

### 1.3.1 (Apr 8, 2016)

- Allow React v15 in peerdeps.

### 1.3.0 (Mar 11, 2016)

- Switch to ES2015 Loose Mode to fix IE9/10 issues.
- Flow typing fixes.
- Styling fixes to the demo page.

> Changes before 1.3.0 were not logged. Please see the git commit history.
