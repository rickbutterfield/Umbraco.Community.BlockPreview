# CLAUDE.md - BlockPreview v6

## Overview

**BlockPreview** is an Umbraco community package that enables rich HTML backoffice previews for Block Grid, Block List, and Rich Text editors.

**Technologies:**
- .NET 10 (C#) - Backend library and API
- TypeScript/Lit - Frontend UI components (Umbraco backoffice extension)
- Vite - Frontend build tooling

**Target Platform:** Umbraco CMS v18+

**Package:** [Umbraco.Community.BlockPreview on NuGet](https://www.nuget.org/packages/Umbraco.Community.BlockPreview)

---

## Repository Structure

```
/src                    - Source projects
  /Umbraco.Community.BlockPreview       - Main .NET library (RCL)
  /Umbraco.Community.BlockPreview.UI    - TypeScript frontend (Lit components)
/examples               - Example/test sites
  /Umbraco.Community.BlockPreview.TestSite  - Umbraco 18 test site
/tools                  - Build utilities
  /Umbraco.Community.BlockPreview.SchemaGenerator - JSON schema generator
/docs                   - Documentation
/.github                - CI/CD workflows, README, assets
```

**Project Dependencies:**
- `Umbraco.Community.BlockPreview` references `Umbraco.Community.BlockPreview.UI` (embeds compiled JS assets)
- `TestSite` references `Umbraco.Community.BlockPreview` for local development

---

## Build Commands

**Full Solution:**
```bash
dotnet build Umbraco.Community.BlockPreview.sln
```

**Main Package (Release):**
```bash
dotnet build src/Umbraco.Community.BlockPreview/Umbraco.Community.BlockPreview.csproj --configuration Release
dotnet build examples/Umbraco.Community.BlockPreview.TestSite/Umbraco.Community.BlockPreview.TestSite.csproj
```

**Frontend Assets:**
```bash
cd src/Umbraco.Community.BlockPreview.UI

# Install dependencies (requires Node.js >=22.12.0)
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build
```

**Run Test Site:**
```bash
dotnet run --project examples/Umbraco.Community.BlockPreview.TestSite
```

Test site credentials:
- Username: `admin@example.com`
- Password: `1234567890`

---

## Versioning

Uses [Nerdbank.GitVersioning](https://github.com/dotnet/Nerdbank.GitVersioning) for automatic versioning.

- Version defined in `version.json`
- Release tags: `release-{version}` (e.g., `release-6.1.1`)
- Release branches: `release/{version}`

**Cutting a release:**
1. Branch `release/{version}` off `v6/dev`.
2. Set the version in `version.json`, `src/Umbraco.Community.BlockPreview.UI/package.json`, and `package-lock.json`. Run `npm run build` so the package manifest restamps.
3. PR that branch into `v6/main` and merge.
4. Tag `release-{version}` on `v6/main` and push the tag. **The tag is what publishes.**

The published version comes from `version.json` on the tagged commit, not from the tag name. Keep the two in step.

---

## Teamwork & Collaboration

**Branching:**
- Main branch: `v6/main`
- Development branch: `v6/dev`
- Feature branches merged via PR to `v6/dev`
- The `v5/*` branches are a parallel line for Umbraco 17. Fixes that apply to both are ported across.

**CI/CD:**
- `release.yml` - Builds and pushes to NuGet. Triggers on `release-*` **tags only**, plus manual dispatch. Pushing a `release/*` branch does *not* publish; that trigger was removed in 6a4fc7c because cutting a release created both a branch and a tag and fired the publish twice.
- `codeql.yml` - Security scanning

**Contributing:** See `.github/CONTRIBUTING.md`
- Fork repository, create PR with changes
- Issues for bugs/feature discussions

---

## Quick Reference

**Key Directories:**
| Path | Description |
|------|-------------|
| `/src` | Source code |
| `/examples` | Test site |
| `/tools` | Build utilities |
| `/docs` | Documentation |

**Projects:**
| Project | Type | Description |
|---------|------|-------------|
| `Umbraco.Community.BlockPreview` | .NET RCL | Main package library |
| `Umbraco.Community.BlockPreview.UI` | TypeScript/Vite | Backoffice UI components |
| `Umbraco.Community.BlockPreview.TestSite` | .NET Web | Development test site |
| `Umbraco.Community.BlockPreview.SchemaGenerator` | .NET Console | appsettings JSON schema generator |

**Documentation:**
- [Configuration Guide](/docs/configuration.md)
- [Usage Guide](/docs/usage.md)
- [Advanced Customization](/docs/advanced-customization.md)

---

## Architecture Notes

**Razor view caching:** Never cache `ViewEngineResult` objects. ASP.NET Core's `RazorView` holds a single `IRazorPage` with mutable state (`ViewContext`, `Output`) that is set during `RenderAsync`. Caching the `ViewEngineResult` shares the page across concurrent requests, causing race conditions (empty renders, `ObjectDisposedException`). Cache the resolved view **path** instead and call `_razorViewEngine.GetView(path)` per request to get a fresh `RazorView`/`IRazorPage`.

**Debugging approach:** When investigating rendering bugs, add diagnostic logging first before building fixes. Symptoms like empty strings, disposed object exceptions, and load-dependent failures can all stem from a single shared-state concurrency bug. Log the actual exception types and locations to avoid misdiagnosing the root cause.
