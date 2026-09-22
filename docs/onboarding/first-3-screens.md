# VEMTAP Onboarding — Design Brief (PDR/TDR)

> **Batch:** Onboarding screens 1–3 (Welcome → Discover Deals → Start VEMTAP).
> **Spec:** `stitch_vemtap_design_system/design.md` + `code.html` + `screen.png` (HTML = source of truth).
> **Fidelity rule:** labels/copy must match; layout must not drift from token grid (24px gutters, 8px grid).

## 1. PDR — Product Design Requirements

### 1.1 Product intent

VEMTAP is a **local discovery + consumer engagement app**. The first-time flow introduces the
consumer value ("discover deals, products and businesses near you") without asking the user to
choose a role. All content shown is fictional/local demo data — no real brands, no real imagery.

Key rules:

- NO bottom navigation on these screens. NO `Customer` vs `Business` choice.
- Consumer path is the primary, dominant path. Business onboarding must feel secondary and subtle.
- Do NOT design the location flows or account flows here — those are separate batches.
- Fictional businesses only; copy mirrors `strings.onboarding.*`.

### 1.2 Screen 1 — Welcome to VEMTAP

| Field     | Value                                                                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top bar   | Back button (ghost, 40px) · VEMTAP wordmark (Inter Bold, primary) · "Fast & Local" pill (bolt icon + surface, primary text)                                                                   |
| Progress  | ● ○ ○ (step 1 of 3)                                                                                                                                                                           |
| Hero      | Brand identity: VEMTAP wordmark + `discover_deals` tag pill + "35% OFF TODAY" baked deal card, "1,420+ Deals" micro cards, 4.9-star placeholder, phone-canvas mockup with floating deal cards |
| Headline  | `Discover More. Buy Smarter.`                                                                                                                                                                 |
| Copy      | `Find great deals, products and businesses around you — all in one place.`                                                                                                                    |
| CTA       | `Get Started` → Screen 2                                                                                                                                                                      |
| Secondary | `Already have an account? Sign In` (subtle, not a filled button)                                                                                                                              |

### 1.3 Screen 2 — Discover Deals Near You

| Field     | Value                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Top bar   | Back · VEMTAP pill (`near_me` icon + pill) · `Skip`                                                                                                                            |
| Progress  | ○ ● ○ (step 2 of 3)                                                                                                                                                            |
| Headline  | `Discover Deals Near You` + supporting copy                                                                                                                                    |
| Content   | Stacked deal cards (3 visible + 1 peek): badge pill (20% OFF / SPECIAL / BOGO FREE), hot tag, business name, deal title, distance, rating + counts — fictional businesses only |
| Tip note  | `Deals refresh in real-time as you move around town`                                                                                                                           |
| CTA       | `Next` → Screen 3                                                                                                                                                              |
| Secondary | `Skip` (top-right, minimum 44px touch)                                                                                                                                         |

### 1.4 Screen 3 — Start VEMTAP

| Field     | Value                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top bar   | Back · progress dots (step 3 of 3) · `Skip`                                                                                                                                                             |
| Visual    | Radar/pulse composition: concentric surface rings, floating category chips (Cafes, Electronics, Fashion, Groceries, Services), center VEMTAP beacon (animated ping + filled near_me icon), ambient glow |
| Headline  | `Let's find what's near you.`                                                                                                                                                                           |
| Copy      | `Discover deals, products and businesses around your location.`                                                                                                                                         |
| CTA       | `Get Started` → (location flow — next batch)                                                                                                                                                            |
| Secondary | `Own a business? Set up your business on VEMTAP →` (subtle link, independent; NOT a CTA)                                                                                                                |

## 2. TDR — Technical Design Requirements

### 2.1 Stack

- Expo SDK 57, Expo Go, React Native 0.86, React 19, TypeScript strict.
- NativeWind v4 (Tailwind) via `nativewind` + `react-native-css-interop`, tokens in
  `tailwind.config.js` (single source). Native-safe cache storage via AsyncStorage.
- Inter from `@expo-google-fonts/inter` (+ `expo-font`) — central font, loaded once in App.
- Icons: `@expo/vector-icons` `MaterialCommunityIcons` via `src/components/ui/Icon.tsx`
  (bundled in Expo Go; `MaterialIcons` does not include `distance`).
- Gradients: `expo-linear-gradient` (bundled in Expo Go).
- Navigation: `@react-navigation/native-stack`, AuthStack — no bottom tabs here.

### 2.2 Files

```
src/features/auth/screens/WelcomeScreen.tsx (rebuilt)
src/features/auth/screens/DiscoverDealsScreen.tsx (new)
src/features/auth/screens/StartVemtapScreen.tsx (new)
src/components/onboarding/OnboardingLayout.tsx
src/components/onboarding/OnboardingHeader.tsx
src/components/onboarding/ProgressDots.tsx
src/components/onboarding/DealCard.tsx
src/components/ui/Icon.tsx
src/components/ui/Text.tsx (font-sans-weight tokens)
src/constants/strings.ts (onboarding.*)
```

### 2.3 Decisions

- **Fonts:** `useFonts` + `@expo-google-fonts/inter`; NativeWind `font-sans-*` families map to
  per-weight Inter families so no inline `fontWeight` mixing. Jest mocks `@expo-google-fonts/*`
  (see jest.setup.js).
- **Imagery:** no remote/stock images — DealCard image slots use `expo-linear-gradient` tones +
  MaterialCommunityIcons glyphs (semantic, e.g. `storefront`, `shopping-bag`, `spa`), matching
  the design's fictional-brand requirement and working offline in Expo Go + Jest.
- **Icons:** local `Icon.tsx` wraps `MaterialCommunityIcons` with a typed `IconName` union and
  `shadow-*` styling for floating cards — single central Icon; screens never import
  `@expo/vector-icons` directly.
- **Layout:** SafeAreaView + ScrollView; 24px gutters; deal card = white Card w/ border active,
  distance/rating footer; chips = pill `rounded-full`; CTAs = `Button size=lg` full-width
  56px CTA.
- **Progress/Header:** `OnboardingHeader` renders back/skip + `ProgressDots` (center) for
  screens 2/3; Screen 1 uses the brand header center; Skip advances flow (screen2→3, screen3→
  placeholder), CTA navigation wired in AuthStack.
