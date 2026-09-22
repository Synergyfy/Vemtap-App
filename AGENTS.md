# AGENTS.md

Instructions for AI agents working in this repository.

## Project

VEMTAP — a local discovery and consumer engagement mobile app (React Native + Expo Go).
Built for **Expo Go (SDK 57)** — do not reintroduce native-only modules.

## Source of truth for the UI

- **Design screens**: `stitch_vemtap_design_system/**/code.html` (with `screen.png` previews).
  The HTML is the specification; convert it to React Native screens.
- **Design tokens**: `stitch_vemtap_design_system/vemtap_native_mobile/DESIGN.md`.
- **Top-level brief**: `stitch_vemtap_design_system/design.md`.

## Design-system conversion rules

1. **Build screens one at a time, step by step**, in the order given by `stitch_vemtap_design_system/design.md`.
2. Reuse the **central font** (Inter) and **central color tokens** — never hardcode hex values
   or pixel font sizes inline. Tokens live in `tailwind.config.js` and `src/theme/colors.ts` (keep in sync).
3. Reuse existing components (`src/components/ui/*`) and onboarding primitives
   (`src/components/onboarding/*`). Add new reusable components there; do not duplicate in screens.
4. Keep the first 3-first-time screens (Welcome → Discover Deals → Start VEMTAP) as a **linear
   onboarding flow** with no bottom navigation and no Customer-vs-Business choice.
5. Copy (labels/headlines) must match the HTML. Keep `src/constants/strings.ts` as the single
   source for user-facing text.
6. Fictional business/deal content only — never real brands.
7. Materials Symbols-ish icons come from `@expo/vector-icons` via `src/components/ui/Icon.tsx`
   (semantic names).

## Key files

- `src/navigation/AuthStack.tsx`, `src/navigation/types.ts` — onboarding stack routes
  (`Welcome`, `DiscoverDeals`, `StartVemtap`).
- `src/features/auth/screens/*` — Welcome / Discover Deals / Start VEMTAP screens.
- `src/components/onboarding/*` — `OnboardingHeader`, `ProgressDots`, `DealCard`.
- `tailwind.config.js` + `src/theme/colors.ts` — color tokens; `src/components/ui/Text.tsx` —
  Inter weight families (`font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`).

## Verification

```bash
npm run verify        # typecheck + lint + tests
npx expo-doctor       # Expo Go compatibility (expect 0 issues)
```

Never commit without running `npm run verify` first.
