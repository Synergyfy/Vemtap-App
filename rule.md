# Project Rules

## Reusable components first

- **Always check for an existing component before creating one.** Reuse what is
  already in the codebase; do not create a new component (or utility) when an
  existing one fits.
- Look in these places before writing anything new:
  - `src/components/ui/` — `Button`, `Text`, `Icon`, `Input`, `Modal`, `Card`, `Loader`, etc.
  - `src/components/shared/` — `BottomSheet`, `EmptyState`, `LoadingState`, etc.
  - `src/features/business/components/` — `BusinessSetupPrimitives`,
    `BusinessSetupCards`, `BusinessPrimitives`, `BusinessOpsPrimitives`, etc.
- Prefer **composing existing primitives** (e.g. `PrimaryActionButton` wraps the
  shared `Button`) over hand-rolling a `Pressable` with one-off styling.
- If an existing component is close but missing a small capability, **extend it
  with an optional prop** (with a sensible default) rather than forking it.
- Only create a new component when nothing existing can be reasonably extended,
  and place it next to the closest existing sibling following the same naming.
- Screens should own their inputs and delegate actions via props/callbacks, so
  they stay testable; shared visual pieces stay in the component folders above.
