# Changelog

### 1.10.1 (Nov 25, 2019)

> Note: 1.10.0 was a mis-publish.

- Feat: Add `transformScale` prop [#115](https://github.com/STRML/react-resizable/pull/115)
- Bugfix: Resolve `getDerivedStateFromProps` dev warning [#117](https://github.com/STRML/react-resizable/pull/117)

### 1.9.0 (Oct 24, 2019)

- Fix resize with north/south handles when `lockAspectRatio=true` [#106](https://github.com/STRML/react-resizable/pull/106)
- Remove deprecated React 16.9 lifecycle methods (`componentWillReceiveProps`) (https://github.com/STRML/react-resizable/pull/112/commits/541dee69b8e45d91a533855609472b481634edee)
- Upgrade to babel 7
- [Remove unused state inside `<Draggable>`](https://github.com/STRML/react-resizable/pull/112/commits/05693f63d6d221ad652f0f28af024cfb46a5f2df). This has not been needed for quite some time, fixes [some bugs](https://github.com/STRML/react-resizable/issues/99) and improves performance.

### 1.8.0 (May 15, 2019)

- Added support for custom resize handles [#79](https://github.com/STRML/react-resizable/pull/79)
- Added support for resize handles on all corners [#191](https://github.com/STRML/react-resizable/pull/191)

### 1.7.5 (Sep 26, 2017)

- Support for React 16 (no changes required, updated `peerDependencies`)
- Minor dep updates.

### 1.7.4 (Sep 5, 2017)

- Minor Flow & dependency updates.

### 1.7.3 (Aug 31, 2017)

- Fix React deprecation warnings from `import *`
  - https://github.com/facebook/react/issues/10583

### 1.7.2 (Aug 21, 2017)

- Pkg: Add `react-draggable@3.0.0` to version range.
  - This package is compatible with both `@2` and `@3` versions.

### 1.7.1 (May 23, 2017)

- Bugfix: Some flow types were improperly specified.

### 1.7.0 (May 1, 2017)

- Deprecation: `React.PropTypes` now deprecated in React 15.5, moved to `prop-types` package
- Internal: Update devDeps, upgrade to webpack 2
- Internal: Remove babel `stage-1` and `transform-flow-comments`, bring in only selected plugins, makes for leaner dev/build.

### 1.6.0 (Jan 23, 2017)

- Feature: Allow restricting by axis. (#40, thanks @dnissley-al)

### 1.5.0 (Jan 23, 2017)

- Bugfix: Persist SyntheticEvents when needed (#45, #46)
- Feature: Add componentWillReceiveProps to `<ResizableBox>` (#44, thanks @JoaoMosmann)

### 1.4.6 (Dec 30, 2016)

- Removed unused ref from `<Resizable>`.
- Added development lockfile.

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
