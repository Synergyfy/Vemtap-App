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

## Verification: unit tests only, never e2e

- **Run `npm run verify`** (`typecheck` + `lint` + `test`) to check any change.
  For the jest step alone use `npm test`; for a full run prefer
  `npx jest --maxWorkers=4 --forceExit`, since the suite is large enough that a
  plain run can look hung while workers start.
- **Never run `npm run test:live`** or any test under `__tests__/live/`. Those
  are contract checks against the real staging API: they need `LIVE_API_TESTS=1`
  plus credentials, and they depend on server state (seeded accounts, migration
  order) that a code change has no business invalidating. They stay skipped —
  and they stay skipped because the app's tests assert on _hypotheses about the
  API_, not on the API itself.
- **No e2e or device verification.** There is no e2e framework here, and walking
  a simulator or Expo Go build is not part of checking a change. A report from
  the device is a bug to fix, not a step to reproduce by hand.
- **Unit tests must not reach the network.** `jest.setup.js` stubs XHR with a 404
  envelope precisely so a leak fails loudly instead of calling the backend. A
  test that genuinely needs the API belongs in `__tests__/live/`, not in the
  unit suite — that is the only thing the flag is for.
- A change is not done until the command above is green: typecheck clean, no new
  lint errors, and the full jest suite passing.
