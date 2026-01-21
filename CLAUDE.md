# CLAUDE.md - BlockPreview v5

## Overview

**BlockPreview** is an Umbraco community package that enables rich HTML backoffice previews for Block Grid, Block List, and Rich Text editors.

**Technologies:**
- .NET 10 (C#) - Backend library and API
- TypeScript/Lit - Frontend UI components (Umbraco backoffice extension)
- Vite - Frontend build tooling

**Target Platform:** Umbraco CMS v17+

**Package:** [Umbraco.Community.BlockPreview on NuGet](https://www.nuget.org/packages/Umbraco.Community.BlockPreview)

---

## Repository Structure

```
/src                    - Source projects
  /Umbraco.Community.BlockPreview       - Main .NET library (RCL)
  /Umbraco.Community.BlockPreview.UI    - TypeScript frontend (Lit components)
/examples               - Example/test sites
  /Umbraco.Community.BlockPreview.TestSite  - Umbraco 17 test site
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

- Version defined in `version.json` (currently `5.0.0`)
- Release tags: `release-{version}` (e.g., `release-5.0.0`)
- Release branches: `release/{version}`

---

## Teamwork & Collaboration

**Branching:**
- Main branch: `v5/main`
- Development branch: `v5/dev`
- Feature branches merged via PR to `v5/dev`

**CI/CD:**
- `release.yml` - Builds and pushes to NuGet on `release-*` tags or `release/*` branches
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
