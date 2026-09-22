# VEMTAP Onboarding Screens — PDR & TDR

Batch: Native Onboarding (Screens 1–3). Consumer-first, linear, no bottom nav, no
Customer-vs-Business choice. This is a PDR (Product Design Requirement) + TDR (Technical
Design Requirement) — a single design-build doc that converts the `stitch_vemtap_design_system`
HTML/design.md into React Native + NativeWind/nativewind.

## 1. PDR — Product Design Requirements

### 1.1 Goal & Product Principle

VEMTAP ("One Tap. Lifetime Customer.") is a **local discovery & consumer engagement app**:
discover deals, products, services and businesses around your location)Skip. The first 3
screens form a linear first-time onboarding that:

1. Introduces the branded visual identity (VEMTAP).
2. Explains the core value: _Discover Deals Near You_.
3. Ends with _Start VEMTAP_ → leads into location onboarding.

Every user enters as a **consumer first**. Consumer is the default, dominant path.
"Own a business?" is a **subtle secondary** link — never a Customer vs Business choice
screen. The consumer experience is superior and business setup is a secondary layer.

### 1.2 Screens (from design.md)

| Screen | Name          | Headline                    | Copy                                                                                   | CTA                                       |
| ------ | ------------- | --------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1      | Welcome       | Discover More. Buy Smarter. | Find great deals, products and businesses around you — all in one place.               | Get Started                               |
| 2      | DiscoverDeals | Discover Deals Near You     | See deals from businesses around your location and find something worth buying nearby. | Next                                      |
| 3      | StartVemtap   | Let's find what's near you. | Discover deals, products and businesses around your location.                          | Get Started → (location flow, next batch) |

### 1.3 Visual identity (from design.md)

- **VEMTAP blue** `#066CF4` is the single recognisable brand signal (CTAs, brand pill,
  accent dots, deal badges).
- **Inter** is the central font family (no other typography). Weights map to Tailwind
  font family tokens: `font-sans` (400), `font-sans-medium` (500), `font-sans-semibold`
  (600), `font-sans-bold` (700).
- **White dominant surface**, light neutral backgrounds (#F9F9FF), subtle blue tints
  (#EEF5FF), tight tracking on display/heading, 8px spacing, 16px card radius.
- **Don't**: copy Boro branding/colors, use stock photography aesthetic, corporate/SaaS or
  financial look, overcrowding.

### 1.4 Onboarding visual compositions

- **Screen 1 (Welcome)**: brand header (VEMTAP + "Fast & Local" pill), hero phone mockup
  (rounded bezel, store preview + location overlay, discount badge, floating deal cards:
  "Bakery & Cafe • Buy 1 Get 1", "1,420+ Deals • Updated 2m ago"), floating badges
  ("Verified Stores", "Instant Pickup"), headline + copy, progress dots (●○○), Get Started
  CTA, "Already have an account? Sign In".
- **Screen 2 (DiscoverDeals)**: header (back, VEMTAP pill, Skip), progress dots (○●○),
  headline + copy, deal cards stack (badge pill, title, deal title, distance, rating +
  count, deal badge like 20% OFF / SPECIAL / Hot Deal), a "peek" card, discovery tip, Next.
- **Screen 3 (StartVemtap)**: header (back, progress dots, Skip), ambient radar graphic
  (concentric ping rings + floating category tags Cafes/Electronics/Fashion/Groceries/
  Services + center beacon), headline + copy, Get Started (→ location), and a **subtle**
  "Own a business? Set up your business on VEMTAP →" secondary link.

### 1.5 Accessibility & touch

- Tap targets at least 44px.
- Buttons min 52–56px tall CTAs.
- Screen reader labels + accessibilityRole on every interactive element.
- `accessibilityLabel`, `accessibilityHint` on CTAs; progress dots expose a progressbar role
  with relative progress.

## 2. TDR — Technical Design Requirements

### 2.1 Stack

- Expo SDK 57 (Expo Go), React Native 0.86, React 19.2, NativeWind v4 + nativewind v4
  (`nativewind` + `react-native-css-interop`), Tailwind v3.4, `expo-font` + Inter
  (`@expo-google-fonts/inter`).
- Navigation: `@react-navigation/native` + `native-stack`. Onboarding lives in the AuthStack
  (`AuthStackParamList`: `Welcome`, `DiscoverDeals` won't be added — keep native onboarding
  on `DiscoverDeals` and `StartVemtap` routes defined in `navigation/types`).
- `LinearGradient` from `expo-linear-gradient` (bundled in Expo Go 57) for hero visuals and
  radar ambient backdrop.

### 2.2 Files

```
src/features/auth/screens/
  WelcomeScreen.tsx            // rebuilt: hero phone mockup composition
  DiscoverDealsScreen.tsx      // NEW deal discovery preview
  StartVemtapScreen.tsx        // NEW radar + beacon + Get Started
src/components/onboarding/
  OnboardingHeader.tsx         // header row: back / brand pill / progress dots / skip
  ProgressDots.tsx             // 3-dot progress indicator
  DealCard.tsx                 // deal card with gradient image + badges
src/components/onboarding/index.ts
src/components/ui/Icon.tsx     // semantic MaterialCommunityIcons wrapper
tailwind.config.js             // + font-sans-* families, + onboarding colors
src/theme/colors.ts            // mirror tokens
src/constants/strings.ts       // onboarding copy (strings.onboarding.*)
```

### 2.3 Routing

AuthStack:

- `Welcome` → (Get Started) `DiscoverDeals`
- `DiscoverDeals` → (Next) `StartVemtap`; (Skip) `StartVemtap`
- `StartVemtap` → (Get Started) → _location flow (next batch)_; (Skip) → `SignIn`/
  `SignUp` placeholder; "Own a business?" → _business onboarding (next batch)_

## 3. Decisions

- **No images**: deal imagery is a gradient + MaterialCommunityIcons glyph (avoids stock
  photo licensing and remote-load dependency in Expo Go); fictional business names only.
- **No account creation**: the 3 onboarding screens never ask for a customer/business
  choice; Get Started on screen 3 routes to the location flow placeholder.
- **Fonts loaded once in `App.tsx`** via `useFonts` + `@expo-google-fonts/inter`, gated
  behind the boot splash; `font-sans-*` family tokens map weights so no inline hex/sizes.
- **Icons** centralized in `src/components/ui/Icon.tsx` with semantic names.
- **Progress**: `ProgressDots` (3 dots) + a full starting dot set on each screen, matching
  the linear HTML design.

## 4. Verification

```bash
npm run verify   # typecheck + lint + tests; jest.setup mocks expo-font / linear-gradient
npx expo-doctor  # expect 0 issues for Expo Go
```

All tokens live in `tailwind.config.js` (and mirrored in `src/theme/colors.ts`) — never
hardcode hex values or font sizes inline in screens.
