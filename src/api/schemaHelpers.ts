import { z } from 'zod';

/**
 * Helpers for columns the API stores as nullable.
 *
 * The trap these exist to avoid: `z.string().default('')` only fills in a key
 * that is *absent*. When the API sends an explicit `null` — which it does for
 * every nullable column — `z.string()` rejects it and the whole response fails
 * validation. That is what broke customer login, because `User.roleTag`,
 * `phone`, `jobTitle`, `googleId` and others are all nullable in the database.
 *
 * So nullable fields are coerced rather than merely defaulted, and the parsed
 * type stays a plain string/boolean/array so screens never handle `null`.
 *
 * Every helper needs an explicit `.optional()`. Including `z.undefined()` in a
 * union only lets the *value* be undefined; it does not make the key optional,
 * so an absent key would still fail with "expected nonoptional, received
 * undefined". Both cases have to work, since the API both sends nulls and omits
 * keys depending on the column.
 */

/** A nullable text column. Absent or `null` becomes `fallback`. */
export const nullableText = (fallback = '') =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform(value => value ?? fallback);

/** A nullable timestamp column. Kept as the raw string; parsing is the caller's. */
export const nullableTimestamp = () => z.union([z.string(), z.null()]).optional();

/** A nullable boolean column. Absent or `null` becomes `fallback`. */
export const nullableFlag = (fallback = false) =>
  z
    .union([z.boolean(), z.null()])
    .optional()
    .transform(value => value ?? fallback);

/** A nullable string-array column (Postgres `text[]`). */
export const nullableStringArray = (fallback: string[] = []) =>
  z
    .union([z.array(z.string()), z.null()])
    .optional()
    .transform(value => value ?? fallback);

/**
 * A nested relation the API may leave empty (`user.business`, `user.branch`).
 *
 * Left undefined rather than forced to null, so callers can tell "not included"
 * from "not set".
 */
export const nullableRelation = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.null()]).optional();

/**
 * An array or count the API may send as null instead of omitting the key.
 * Like `nullableText`, the parsed value is always the fallback, never null —
 * `.nullish().default(...)` would accept the null and hand it straight through,
 * because a zod default only fires on an *absent* key.
 */
export const nullableArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([z.array(schema), z.null()])
    .optional()
    .transform(value => value ?? ([] as z.infer<typeof schema>[]));

export const nullableNumber = (fallback = 0) =>
  z
    .union([z.number(), z.null()])
    .optional()
    .transform(value => value ?? fallback);

/**
 * A Postgres `decimal`/`numeric` column. `pg` returns these as strings
 * ("8000.00"), so unless the backend entity attaches its `numericTransformer`
 * the API sends a string where the schema expects a number — and one string
 * price used to fail the whole response (the Business hub's
 * `GET /catalogue/offers/admin`). Both shapes are accepted and the parsed value
 * is always a number.
 *
 * Deliberately not `z.coerce.number()`: that turns `null` and `''` into `0`,
 * which would show a free deal instead of a missing price.
 */
const numericString = z
  .string()
  .trim()
  .refine(
    value => value !== '' && Number.isFinite(Number(value)),
    'Expected a numeric string',
  )
  .transform(Number);

/** A required decimal column; number or numeric string in, number out. */
export const decimal = () => z.union([z.number(), numericString]);

/**
 * A nullable decimal column: number or numeric string in, number out; `null`
 * stays `null` (never `0`) and an absent key stays absent, so the parsed shape
 * matches a plain `z.number().nullish()`.
 */
export const nullableDecimal = () =>
  z.union([z.number(), numericString, z.null()]).optional();
