---
description: Always maintain and check HANDOVER.md whenever features are added or modified in Feedy.
globs: **/*
---

# Feedy Handover Maintenance Rule

1. **Check HANDOVER.md First**:
   - At the beginning of any work or when continuing development, always view `HANDOVER.md` to understand current architecture, active production settings (Kami household `814332`, domains, Firestore region, VAPID push setup), and existing conventions.

2. **Update HANDOVER.md on Every Feature Update**:
   - Whenever any feature is added, modified, or reconfigured (e.g. new components, state changes, domain updates, environment variables, data models), **you MUST update `HANDOVER.md`** before concluding the turn.
   - Keep the directory tree, component map, and architectural descriptions in `HANDOVER.md` fully in sync with the codebase.

3. **Core Design & UX Principles to Preserve**:
   - **Language**: All user-facing UI labels, notifications, and error messages must be in natural **English**.
   - **Palette**: Strict adherence to Deep Dark Mode (`#0D0E13` background, `#161822` / `#1A1C26` cards, `#282C3D` borders).
   - **Zero Friction**: No passwords or OAuth barriers. Maintain 6-digit join codes and one-click join links.
   - **Dual Persistence**: Always support both `localStorage` and 1-year cookies in `lib/storage.ts` with backward compatibility for legacy `nomciu_*` keys.
   - **Multi-Domain Safety**: Never break or remove legacy domain compatibility (`nomciu.vercel.app`) as existing roommates' PWA icons rely on it.
