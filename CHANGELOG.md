# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.3.2] - 2026-02-12

### Fixed
- Fix concurrent block preview rendering producing empty strings or ObjectDisposedException by caching view paths instead of ViewEngineResult objects (shared IRazorPage race condition)
- Fix frontend preview elements treating empty API responses as loading forever (`if (data)` to `if (data != null)`)
- Add concurrency-limited request queue (max 3) to prevent overwhelming the server with simultaneous preview requests
- Add stale response protection to prevent outdated API responses from overwriting newer previews
- Add retry with child service scope for ObjectDisposedException during Razor view rendering
- Add diagnostic logging throughout BlockViewRenderer and BlockDataConverter for easier troubleshooting
- Protect BlockDataConverter.ConvertPropertyValue against exceptions from FromEditor, preserving original value on failure

## [5.3.1] - 2026-02-12

### Fixed
- Resolve ambiguous constructor error in BlockPreviewService

## [5.3.0] - 2026-02-12

### Added
- Cached view resolution for improved performance
- Specific error message when ModelsBuilder is not configured
- Acceptance tests suite with Playwright ([#245](https://github.com/rickbutterfield/BlockPreview/pull/245))

### Fixed
- Stop data-block-preview-link clicks from bubbling to parent blocks ([#246](https://github.com/rickbutterfield/BlockPreview/pull/246))
- Block non-edit action bar clicks from propagating to parent block
- Fix slider values ([#244](https://github.com/rickbutterfield/BlockPreview/pull/244))
- Return 200 OK instead of 404 when no stylesheets are configured ([#243](https://github.com/rickbutterfield/BlockPreview/pull/243))
- Use single configured language as culture fallback for block previews ([#242](https://github.com/rickbutterfield/BlockPreview/pull/242))
- Fix IsBlockPreviewRequest check by removing unreliable IsBackOfficeRequest check ([#241](https://github.com/rickbutterfield/BlockPreview/pull/241))

## [5.2.1] - 2026-01-23

### Fixed
- Fix RTE blocks stylesheet loading to match BlockGrid/BlockList behavior ([#226](https://github.com/rickbutterfield/BlockPreview/pull/226))

## [5.2.0] - 2026-01-22

### Added
- Adds IBlockPreviewResponseEnricher ([#218](https://github.com/rickbutterfield/BlockPreview/pull/218))
- Add IgnoredContentTypes support to BlockPreview config for excluding element types from previews ([82133cc](https://github.com/rickbutterfield/BlockPreview/commit/82133cc565ec2e37ccf66292844494afa36b6f9b))

### Fixed
- Fixes #220 for v5 ([#221](https://github.com/rickbutterfield/BlockPreview/pull/221))

**New Contributors:** @lakesol ([#221](https://github.com/rickbutterfield/BlockPreview/pull/221)), @skttl ([#218](https://github.com/rickbutterfield/BlockPreview/pull/218))

## [5.1.0] - 2026-01-08

### Added
- Add support for multiple stylesheets per block type ([#209](https://github.com/rickbutterfield/BlockPreview/pull/209))
- Add async CreateViewDataAsync method with sync fallback ([#212](https://github.com/rickbutterfield/BlockPreview/pull/212))

### Changed
- Remove custom sort mode and upgrade to Umbraco 17.1.0-rc ([#211](https://github.com/rickbutterfield/BlockPreview/pull/211))

### Fixed
- Workaround for empty unique variable editing blockgrid / blocklist ([#214](https://github.com/rickbutterfield/BlockPreview/pull/214))
- Fix for #179

**New Contributors:** @Copilot ([#175](https://github.com/rickbutterfield/BlockPreview/pull/175)), @GianniDPC ([#214](https://github.com/rickbutterfield/BlockPreview/pull/214))

## [5.0.0] - 2025-11-27

### Added
- Added features that allow consumers to customise View Location and runtime stylesheet loading ([#116](https://github.com/rickbutterfield/BlockPreview/pull/116))
- Add Claude Code GitHub Workflow ([#187](https://github.com/rickbutterfield/BlockPreview/pull/187))

### Changed
- Project restructure ([#178](https://github.com/rickbutterfield/BlockPreview/pull/178))

**New Contributors:** @BenWhite27 ([#116](https://github.com/rickbutterfield/BlockPreview/pull/116))

---

## v4 (Umbraco 16)

## [4.2.2] - 2026-02-12

### Fixed
- Fix concurrent block preview rendering producing empty strings or ObjectDisposedException by caching view paths instead of ViewEngineResult objects

## [4.2.1] - 2026-02-12

### Fixed
- Resolve ambiguous constructor error in BlockPreviewService

## [4.2.0] - 2026-02-12

### Added
- Sort mode property action for block grid

### Fixed
- Stop data-block-preview-link clicks from bubbling to parent blocks
- Block non-edit action bar clicks from propagating to parent block
- Return 200 OK instead of 404 when no stylesheets are configured
- Use single configured language as culture fallback for block previews
- Remove unreliable IsBackOfficeRequest check from IsBlockPreviewRequest
- Use generic CMS property editor conversion and fix preview errors

### Changed
- Use UMB_CONTENT_WORKSPACE_CONTEXT for broader workspace compatibility
- Extract services from BlockPreviewService (IBlockModelFactory, IBlockViewRenderer, IBlockDataConverter)
- Cached view resolution for improved performance

## [4.1.1] - 2026-01-23

### Fixed
- Fix RTE blocks stylesheet loading to match BlockGrid/BlockList behavior
- Stop unnecessary calls to stylesheet API when `documentTypeUnique` is undefined ([#226](https://github.com/rickbutterfield/BlockPreview/pull/226))

## [4.1.0] - 2026-01-22

### Added
- Add IBlockPreviewResponseEnricher
- Add IgnoredContentTypes support to BlockPreview config for excluding element types from previews
- Add support for multiple stylesheets per block type
- Add async CreateViewDataAsync method with sync fallback
- Cache busting for App_Plugins

### Changed
- Reinstate sort mode for v16

### Fixed
- Fixes #220
- Workaround for empty unique variable editing blockgrid / blocklist
- Fix for #179

## [4.0.7] - 2025-11-28

### Fixed
- Resolve #179 for v4

## [4.0.6] - 2025-11-27

### Changed
- Project restructure

---

**Full Changelog**: https://github.com/rickbutterfield/BlockPreview/releases

[5.3.2]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.3.1...release-5.3.2
[5.3.1]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.3.0...release-5.3.1
[5.3.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.2.1...release-5.3.0
[5.2.1]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.2.0...release-5.2.1
[5.2.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.1.0...release-5.2.0
[5.1.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.0.0...release-5.1.0
[5.0.0]: https://github.com/rickbutterfield/BlockPreview/compare/v4.0.5...release-5.0.0
[4.2.2]: https://github.com/rickbutterfield/BlockPreview/compare/release-4.2.1...release-4.2.2
[4.2.1]: https://github.com/rickbutterfield/BlockPreview/compare/release-4.2.0...release-4.2.1
[4.2.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-4.1.1...release-4.2.0
[4.1.1]: https://github.com/rickbutterfield/BlockPreview/compare/release-4.1.0...release-4.1.1
[4.1.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-4.0.7...release-4.1.0
[4.0.7]: https://github.com/rickbutterfield/BlockPreview/compare/release-4.0.6...release-4.0.7
[4.0.6]: https://github.com/rickbutterfield/BlockPreview/compare/v4.0.5...release-4.0.6
