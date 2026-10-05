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
