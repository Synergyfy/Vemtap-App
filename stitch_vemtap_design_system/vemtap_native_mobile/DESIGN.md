---
name: VEMTAP Native Mobile
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#424655'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#727786'
  outline-variant: '#c2c6d7'
  surface-tint: '#0058cb'
  primary: '#0055c4'
  on-primary: '#ffffff'
  primary-container: '#066cf4'
  on-primary-container: '#fcfaff'
  inverse-primary: '#b0c6ff'
  secondary: '#4a5e88'
  on-secondary: '#ffffff'
  secondary-container: '#bacfff'
  on-secondary-container: '#435881'
  tertiary: '#a13900'
  on-tertiary: '#ffffff'
  tertiary-container: '#c94a03'
  on-tertiary-container: '#fffaf9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00429b'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#b2c6f7'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#32466f'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
  surface-canvas: '#FFFFFF'
  surface-subtle: '#F8FAFC'
  surface-tint-blue: '#EEF5FF'
  border-subtle: '#E5E7EB'
  border-active: '#BFDBFE'
  text-primary: '#111827'
  text-secondary: '#4B5563'
  text-tertiary: '#9CA3AF'
  badge-discount-bg: '#ECFDF5'
  badge-discount-text: '#059669'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  heading-lg:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  heading-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  heading-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  heading-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  button-primary:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  button-secondary:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
  space-3xl: 3rem
---

## Brand & Style

The design system establishes a high-fidelity, consumer-first local commerce and discovery experience engineered natively for iOS and Android. Built around the core ethos of seamless hyper-local access ("One Tap. Lifetime Customer."), the visual language merges the precision of modern platform-native utilities with the tactile vibrancy of premium retail marketplaces.

### Emotional Response & Brand Personality

- **Immediate Utility:** Clean, uncluttered layouts emphasize fast comprehension; users can orient themselves and identify nearby value within three seconds.
- **Trustworthy & Crisp:** High-clarity typography, deliberate white surfaces, and subtle, structured borders create an institutional sense of reliability without corporate stiffness.
- **Energetic & Focused:** Brand blue anchors key interactions and badges, signaling momentum, freshness, and local activity without visual fatigue.
- **Universal Consumer Warmth:** Avoids cold SaaS dashboard tropes or gimmicky, childish illustrations; every viewport reads as an authentic, high-value shopping and discovery companion.

### Design Movement

**Modern Platform-Native Minimalism:** The system prioritizes content-first mobile surfaces, strict safe-area conformances, subtle surface tinting, micro-radius boundaries, and tactile physical affordances calibrated for 48–56px thumb-driven targets.

## Colors

The color palette centers on a single high-recognition chromatic anchor: `#066CF4` (Electric Local Blue). This primary hue is reserved for active CTAs, interactive indicators, primary icons, and deal badges. Secondary deep navy (`#0D254C`) provides grounded structural emphasis where high-contrast tonal containment is needed.

### Application Rules

- **Surfaces:** Pure white (`#FFFFFF`) forms the primary viewport and card layer. `#F8FAFC` is deployed for low-contrast section underlays and pill track backgrounds, while `#EEF5FF` provides contextual brand tints for icon containers and tag chips.
- **Text & Hierarchy:** Headings and primary copy use `#111827` (charcoal black), maintaining strict WCAG AAA contrast against white. Secondary narrative copy and metadata leverage `#4B5563`, while inactive elements, placeholders, and inactive progress dots use `#9CA3AF`.
- **Borders & Dividers:** Outlines never use high-contrast heavy lines; structural framing uses `#E5E7EB` (0.5px to 1px hairline rules) to maintain a modern, uncluttered mobile canvas.
- **Promotional Highlights:** Fictional retail discounts and savings badges utilize emerald green accents (`#ECFDF5` background, `#059669` label) to contrast cleanly with the primary blue identity.

## Typography

The design system standardizes on **Inter** across all roles to ensure geometric balance, superior on-screen legibility at micro-scales, and native alignment with modern mobile OS rendering engines.

### Hierarchy & Mobile Readability

- **Hero & Title Display:** Restricted to 32px–36px on mobile viewports with tight negative tracking (`-0.02em` to `-0.025em`) to ensure punchy headlines without orphan wraps.
- **`displayMobile` variant rule:** Every `VemtapText` using `variant="displayMobile"` must also include `text-heading-xl` in its `className` (e.g. `className="text-center text-heading-xl"`), rendering page headlines at 30px/38px. Apply this on all screens going forward.
- **Body & Supporting Copy:** Measured between 15px and 17px with comfortable leading (140–145%) to facilitate effortless scanning during rapid phone manipulation.
- **CTA & Interactive Roles:** Set strictly in Semibold/Medium (`600`/`500`) at 15–16px, vertically centered inside touch-friendly bounding targets.

## Layout & Spacing

Layout geometry follows an exact **8-point grid**, paired with a **4-point micro-step** (`space-2xs`: 4px) for tight component packaging, badge paddings, and icon-to-label gaps.

### Native Artboard Blueprint

- **Target Dimensions:** Designed for a standard viewport benchmark of `393 × 852px` (iPhone modern baseline) with proportional scaling for Android screens.
- **Safe Area Insets:**
  - Top: 44px–54px padding to guarantee clearance of hardware notches, Dynamic Islands, and native status bars.
  - Bottom: 34px reserve height dedicated to native gesture indicators and home bars.
- **Screen Margins:** Fixed horizontal gutters of `24px` (`margin: 1.5rem`) establish consistent visual rails down both screen edges.
- **Element Clearance:** Primary actionable containers and bottom sheets sit elevated above the home indicator, backed by vertical gaps of `16px` to `24px`.

## Elevation & Depth

Visual hierarchy is constructed through crisp tonal surfaces, ultra-subtle ambient drop shadows, and ghost borders, rejecting harsh skeuomorphic shadows or muddy blur blankets.

### Stacking Model

- **Level 0 (Canvas Base):** Pure white `#FFFFFF` or subtle neutral background `#F8FAFC`. Zero elevation.
- **Level 1 (Cards & Modules):** Raised container blocks (e.g., deal preview cards, business tiles). Finished with a 1px perimeter border (`#E5E7EB`) and an ambient tinted shadow:
  - `box-shadow: 0 4px 16px -2px rgba(13, 37, 76, 0.04), 0 2px 6px -1px rgba(13, 37, 76, 0.02);`
- **Level 2 (Floating Action Targets & Sticky Controls):** Primary CTA blocks and bottom-docked control decks.
  - `box-shadow: 0 8px 24px -4px rgba(6, 108, 244, 0.25);` on active brand buttons; subtle neutral floating shadows on sticky surfaces: `0 8px 24px -4px rgba(17, 24, 39, 0.08);`
- **Ghost Outlines:** Where visual separation is required between stacked white cards, 1px rules in `#E5E7EB` or `#F1F5F9` take precedence over deep drop shadows.

## Shapes

The design system adopts a contemporary rounded profile (Level 2), balancing friendly consumer accessibility with crisp architectural precision.

### Radius Assignments

- **Primary Buttons & Action Bars:** `14px` to `16px` corner radiuses for full-width 52px CTA containers, delivering a modern tactile button format without turning into full pills.
- **Deal & Content Cards:** `16px` to `20px` perimeter radius with matching child corner radiuses (using mathematical nested radius formulas: $R_{child} = R_{parent} - Padding$).
- **Badges, Tags & Progress Dots:** Full pill (`9999px`) for category chips, distance indicators, and status indicators.
- **Icon Enclosures:** `12px` softly rounded squares for feature icon backgrounds and merchant avatar backdrops.

## Components

### 1. Primary & Secondary Buttons

- **Primary CTA Button:** Height `52px`–`54px`, full width (accounting for 24px side margins). Background `#066CF4`, text `#FFFFFF`, font weight `600`, radius `16px`. Active/pressed state shifts to `#0559CA` with a subtle transform scale (`0.98`).
- **Secondary / Text Link Button:** Height `44px` minimum touch target. Transparent background, text `#111827` or `#4B5563`, font weight `500`. Tap target incorporates a minimum 48px hit area even when visual text is compact.
- **Subtle Business Link:** Nested text link positioned under onboarding CTAs: _"Own a business? Set up your business on VEMTAP →"_. The prompt text uses `#6B7280` (`14px`), while the action link uses `#066CF4` with a medium arrow indicator. Never styled as a filled button to ensure consumer focus remains dominant.

### 2. Deal Cards & Business Tiles

- **Deal Preview Card:** Elevated white card with 1px `#E5E7EB` border. Includes a 16:9 or 1:1 image container, business logo badge, merchant title (`15px`, bold), deal offer headline (`16px`, semibold), and location meta line (e.g., _"0.4 mi away"_ accompanied by a pin icon).
- **Discount Badges:** Positioned at top-left of image containers. Pill shape, `#ECFDF5` background, `#059669` bold label (`12px`).

### 3. Onboarding Progress Indicator

- **Three-Stage Dot System:** Horizontal cluster with `8px` spacing between nodes.
  - Active Step: Elongated pill `24px × 6px`, filled with `#066CF4`.
  - Inactive Step: Circular dot `6px × 6px`, filled with `#E5E7EB`.
- Centered above or alongside the primary CTA area to indicate linear progression across introductory screens.

### 4. Input Fields & Form Affordances

- Standard height `52px`, rounded corner `14px`, 1px border `#E5E7EB`, interior horizontal padding `16px`. Focus state shifts border to `#066CF4` with an ambient glow (`box-shadow: 0 0 0 3px rgba(6, 108, 244, 0.15)`).

### 5. Chips & Category Filters

- Height `36px`, rounded `9999px` (pill), interior padding `12px` horizontally.
- Inactive state: `#F8FAFC` background with 1px `#E5E7EB` border, text `#4B5563`.
- Active state: `#EEF5FF` background with 1px `#BFDBFE` border, text `#066CF4`.
