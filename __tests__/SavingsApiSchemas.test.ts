import { savingsBreakdownSchema, savingsPageSchema } from '@api/savingsApi';

/**
 * The server sums `totalSavedAmount` with `reduce(…, 0)`, so a real payload
 * always carries a number — but every consumer reads it as one, so an absent
 * or explicitly null key must still land as `0`. `.nullish().default(0)` only
 * substitutes for an *absent* key, so an explicit `null` survived and widened
 * the parsed type to `number | null`; the shared `amountSchema` coerces
 * instead, exactly as it already does for the per-entry money fields.
 */

test('an absent or null saved total parses as zero', () => {
  expect(savingsPageSchema.parse({}).totalSavedAmount).toBe(0);
  expect(savingsPageSchema.parse({ totalSavedAmount: null }).totalSavedAmount).toBe(0);
  expect(savingsPageSchema.parse({ totalSavedAmount: 43750 }).totalSavedAmount).toBe(
    43750,
  );

  expect(savingsBreakdownSchema.parse({}).totalSavedAmount).toBe(0);
  expect(savingsBreakdownSchema.parse({ totalSavedAmount: null }).totalSavedAmount).toBe(
    0,
  );
});

test('the parsed total is a plain number, never null', () => {
  const parsed = savingsPageSchema.parse({ totalSavedAmount: null });

  // This assignment only compiles while the schema coerces to `number`.
  const total: number = parsed.totalSavedAmount;

  expect(total).toBe(0);
});
