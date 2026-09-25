# AGENTS.md

Instructions for AI agents working in this repository.

## Project

VEMTAP — a local discovery and consumer engagement mobile app (React Native + Expo Go).
Built for **Expo Go (SDK 57)** — do not reintroduce native-only modules.

## Source of truth for the UI

- **Design screens**: `stitch_vemtap_design_system/**/code.html` (with `screen.png` previews).
  The HTML is the specification; convert it to React Native screens.
- **Design tokens**: `stitch_vemtap_design_system/vemtap_native_mobile/DESIGN.md`.
- **Business-batch specs**: `stitch_vemtap_design_system_1/**/code.html` (with `screen.png`); when
  the same screen exists in both folders, the `_1` specification is the newer source of truth.

## Mandatory reuse and single-source rule

**This is a hard repository-wide requirement, not a style preference.** Before writing any UI,
search `src/components/*`, `src/features/*/components/*`, and `src/constants/strings.ts` for an
existing implementation. Reuse it; do not create a second version.

- Never duplicate components, cards, chips, buttons, links, headers, rows, list items, inputs,
  badges, tabs, empty states, loading states, toasts, icons, images, modals, bottom sheets, bottom
  navigation, headers, or status-bar treatments.
- Screens are composition surfaces. They must not re-implement markup, styling, animation, behavior,
  or copy that belongs to a shared primitive.
- A screen must not render its own header, bottom navigation, modal shell, or sheet animation when
  the navigator or shared shell already owns that responsibility. There must be exactly one owner.
- All user-facing text, accessibility labels, and empty/error/loading copy must come from
  `src/constants/strings.ts`. Do not duplicate copy inside screens or components.
- All modals must use the shared modal shell; all bottom sheets must use
  `src/components/shared/BottomSheet.tsx`. Never use a bare `Modal` for a sheet or duplicate delayed
  fade, scrim, dismissal, or Android-back behavior.
- If a needed pattern is not available, extract the smallest reusable component first, then compose
  it everywhere. Extend an existing primitive when possible; do not fork it per screen.
- Visual differences do not justify duplication. If two patterns are intentionally different,
  document the reason through a shared variant/props rather than copying the implementation.
- Every screen conversion and UI review must include a duplicate-UI audit before completion.

## Design-system conversion rules

1. **NEVER invent a screen.** Always convert the matching `stitch_vemtap_design_system/**/code.html`
   (with `screen.png`). Layout, copy, and structure must come from that HTML. If no HTML exists,
   stop and ask. Build screens one at a time in the order given by `stitch_vemtap_design_system/design.md`.
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
8. **Page/screen headings** (`accessibilityRole="header"` or the main title) must use
   `variant="headingXl"` **and** include `text-heading-xl` in `className` so they stand out
   (e.g. `variant="headingXl"` + `className="text-center text-heading-xl"`).
   For onboarding `displayMobile` titles, always add `text-heading-xl` to `className` as well.
9. **Centered footer/legal copy:** put `text-center` on the `VemtapText` itself (and nested
   link texts). `text-center` on a wrapping `View` does **not** center RN `Text` children.
10. **Horizontal card rows** (e.g. Own a Business): left cluster = `min-w-0 flex-1`, right
    action (link + chevron) = `shrink-0`. Prevents “Register Here” and similar links from
    overflowing off-screen.
11. **Form field backgrounds must be visible.** Prefer the HTML token (often
    `bg-surface-subtle`) on a white `bg-surface` page — do not put near-white inputs on
    `bg-background` (#F9F9FF), or the field disappears. Verify contrast against the page bg.
12. **Shadows must be soft and flat — never hard/3D.** Use only the shared scale in
    `tailwind.config.js` (`shadow-sm` … `shadow-xl`); they are intentionally low-opacity with
    generous blur so cards/inputs sit _on_ the surface, not pop above it. Never use
    `shadow-black/*`, tight dark offsets, or elevated 3D-looking stacks. For navbar
    bottom-only elevation use `navbarBottomShadow` from `src/theme/shadows.ts`.
    **Exception:** the first 3 onboarding screens (Welcome → Discover Deals → Start VEMTAP)
    and their primitives (`DealCard`) use the stronger `shadow-onboard-*` tier — everything
    else stays on the reduced default scale.
    **Android:** every `boxShadow` key must have a matching `theme.elevation` entry in
    `tailwind.config.js` (unitless numeric **strings**, e.g. `'4'` — never `'2px'`).
    NativeWind emits Android `-rn-elevation` from that map; keys must stay 1:1 with
    `boxShadow`. **Android-only strength:** iOS uses the `boxShadow` blur/opacity; to make
    a shadow stronger on Android only (or only on iOS), adjust that side alone — do not
    change the other platform’s values as a side effect. Do **not** hand-roll
    `style={{ elevation }}` on cards/inputs for standard shadows — fix the shared map
    instead. After changing either map, smoke-check shadows on an Android device/emulator
    (not iOS only).
13. **Navbar/header elevation is bottom-only — never a round or box shadow.** Fixed app
    headers (back · title · avatar: `RegistrationHeader`, Manual Location Search, Confirm
    Location, etc.) must use `navbarBottomShadow` from `src/theme/shadows.ts` only. Do not
    put `shadow-sm`/`shadow-md`/`shadow-lg` on the navbar itself. On iOS, `shadowOffset.y`
    must be ≥ `shadowRadius` so the blur cannot bleed above the bar; on Android use a
    hairline `borderBottom` only (no `elevation`). If the shadow shows on top, the offset
    is too small — fix `shadows.ts`, do not invent per-screen workarounds. **This navbar
    rule is the only place that uses hairline/zero elevation on Android** — surface shadows
    (inputs, cards, CTAs) still go through rule 12’s `shadow-*` → `elevation` map.
14. **iOS + Android parity — never one-sided.** Every feature, design detail, interaction,
    and screen must work on **both iOS and Android**. Do not ship a change that only
    renders or behaves correctly on one platform. Check `Platform.OS` branches, shadows
    (`shadow*` vs `elevation`), safe areas, fonts, and native modules on both. Maps:
    configure `PROVIDER_GOOGLE` on Android (iOS can stay Apple Maps), set the Maps key via
    `android.config.googleMaps.apiKey` in `app.json` (env-inlined for production/dev
    builds — avoid the broken `react-native-maps` config plugin import path), and ship a
    designed fallback (see `LocationMapView`) so Expo Go on Android
    (expired/missing Google key → blank tiles) still shows an intentional map UI instead
    of a black/empty box. Never leave Android “broken while iOS looks fine.”
15. **Responsive on every viewport — short, tall, slim, wide.** Screens must execute
    correctly on small phones (~320pt wide, short height), tall modern phones, and
    wide/narrow layouts. Rules: prefer `flex`/`max-w-*`/`min-w-0` over fixed pixel widths
    that can overflow the gutters (`px-6` leaves ~content width = screen − 48); scale
    large fixed graphics (radars, OTP cells, map panels) with `useWindowDimensions` or
    flex so they never spill horizontally; wrap long or animated full-screen content in
    `ScrollView` so short devices can scroll instead of clipping; no horizontal
    scrollbars; CTAs and inputs stay full-width and tappable on slim screens.
16. **Always advise page vs overlay before building.** For every design, state (and notify
    the user of) whether it should be a **full page/screen**, a **popup modal**, or a
    **bottom sheet** — based on the HTML (sticky footers + close icon often mean a full
    screen; partial-height overlays with a scrim mean a sheet). Do not silently pick an
    presentation; recommend one and confirm if ambiguous.
17. **Never duplicate UI — this is a hard repository-wide requirement.** If any card, chip,
    button, link, header, row, list item, input, badge, tab, empty state, loading state, toast,
    icon, image, modal, bottom sheet, bottom navigation, header, status-bar treatment, or any
    other piece of markup appears (or is likely to appear) in more than one place, extract it
    as a reusable component under `src/components/*` (home primitives in
    `src/components/home/`, business primitives in `src/components/business/`, shared in
    `src/components/shared/`, generic in `src/components/ui/*`) before using it twice in a
    screen or across screens. Screens compose components — they do not re-implement them.
    Do not fork a second version of an existing component, string, color token, animation,
    modal shell, sheet behavior, or navigation bar. If two patterns look similar, extend the
    existing component with a documented prop or variant instead of copying it. Copying a
    second modal, text block, form section, or card is a bug even when the first version looks
    close enough. This also covers copy, modal/sheet behavior, bottom navigation,
    status-bar treatment, and any other repeated UI: **never fork a second version of an
    existing component, string, or shell.**
18. **All bottom sheets use the shared delayed-fade animation.** Build every bottom sheet
    with `src/components/shared/BottomSheet.tsx`; do not use a bare `Modal` or duplicate
    sheet animation logic. The scrim must remain transparent initially, fade to the design
    token after a short `120ms` delay, and the sheet must animate upward independently.
    On dismissal, animate both the scrim and sheet out before calling `onClose`; support
    Android back dismissal through `onRequestClose`. Sheet titles and headings must match
    the Stitch HTML type scale for supporting content, but the primary bottom-sheet title
    must always use `variant="headingXl"` **and** `text-heading-xl` in `className`.
    Never rely on the sheet's default heading size.
19. **Every new-screen request must run the Stitch + reuse audit first.** Before implementing one
    or many screens, locate each matching `code.html` and `screen.png`, classify every screen as
    page/modal/bottom sheet, and inventory its cards, rows, headers, tabs, badges, controls, and
    copy against existing `src/components/*` primitives. Reuse those primitives and centralized
    `Text`, `Button`, `Icon`, colors, fonts, sheets, and maps. When multiple requested screens
    share a pattern, create one reusable component and compose it everywhere; never copy a card,
    text style, button, font, color token, or layout implementation into multiple screens.
    Multi-screen requests must also verify all screens together for consistent hierarchy,
    responsive behavior, and cross-platform parity. If the user says screens are not to be wired,
    create/export the components only—do not add routes, deep links, navigator registrations, or
    hidden navigation side effects.

20. **Status-bar and safe-area ownership is global.** The iOS status-bar area must remain
    completely white on every screen, including auth, onboarding, modal-backed flows, and
    screens with a dark/hero header. The shared app shell owns the default status-bar treatment;
    screens may opt into a variant only through a shared primitive. Do not add per-screen
    status-bar colors, duplicate safe-area spacers, or let a background image/header bleed into
    the status-bar area. Verify on iOS and Android after changes.

## Key files

- `src/navigation/AuthStack.tsx`, `src/navigation/types.ts` — onboarding stack routes
  (`Welcome`, `DiscoverDeals`, `StartVemtap`).
- `src/features/auth/screens/*` — Welcome / Discover Deals / Start VEMTAP screens.
- `src/components/onboarding/*` — `OnboardingHeader`, `ProgressDots`, `DealCard`.
- `src/components/shared/BottomSheet.tsx` — shared delayed-fade bottom sheet primitive.
- `tailwind.config.js` + `src/theme/colors.ts` — color tokens; `src/components/ui/Text.tsx` —
  Inter weight families (`font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-sans-bold`).

## Verification

```bash
npm run verify        # typecheck + lint + tests
npx expo-doctor       # Expo Go compatibility (expect 0 issues)
```

Never commit without running `npm run verify` first.
