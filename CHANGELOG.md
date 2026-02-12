# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

**Full Changelog**: https://github.com/rickbutterfield/BlockPreview/releases

[5.3.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.2.1...release-5.3.0
[5.2.1]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.2.0...release-5.2.1
[5.2.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.1.0...release-5.2.0
[5.1.0]: https://github.com/rickbutterfield/BlockPreview/compare/release-5.0.0...release-5.1.0
[5.0.0]: https://github.com/rickbutterfield/BlockPreview/compare/v4.0.5...release-5.0.0
