import { ApiError } from '@api/ApiError';
import { branchPlanErrorMessage, isPlanError, PLAN_ERRORS } from '@api/planErrors';
import { strings } from '@constants/strings';

/**
 * A 403 from the branches endpoints means one of two specific things, and the
 * owner can act on both — but neither is "you do not have permission to do
 * that", which is what the generic fallback says and which is both wrong and a
 * dead end. The API ships a slug for exactly this; these pin the mapping.
 */

const planError = (code: string, message: string) =>
  new ApiError(message, { code, status: 403 });

describe('plan errors', () => {
  it('recognises a plan refusal carrying a known slug', () => {
    expect(isPlanError(planError(PLAN_ERRORS.FEATURE_NOT_INCLUDED, 'x'))).toBe(true);
    expect(isPlanError(planError(PLAN_ERRORS.LIMIT_REACHED, 'x'))).toBe(true);
  });

  it('does not treat an unrelated failure as a plan problem', () => {
    // A permission 403 from some other cause must keep the generic copy rather
    // than telling a paying merchant to upgrade.
    expect(isPlanError(new ApiError('nope', { code: 'HTTP_403', status: 403 }))).toBe(
      false,
    );
    // Same slug, wrong status — e.g. an unlabelled 500 that happens to echo it.
    expect(
      isPlanError(new ApiError('x', { code: PLAN_ERRORS.LIMIT_REACHED, status: 500 })),
    ).toBe(false);
    expect(isPlanError(new Error('boom'))).toBe(false);
    expect(isPlanError('boom')).toBe(false);
  });

  it('gives a plan refusal copy that says what to do next', () => {
    const copy = strings.locationsBranches;

    expect(
      branchPlanErrorMessage(
        planError(
          PLAN_ERRORS.FEATURE_NOT_INCLUDED,
          'The branches feature is not included in your current plan.',
        ),
      ),
    ).toBe(copy.planFeatureNotIncluded);

    expect(
      branchPlanErrorMessage(
        planError(
          PLAN_ERRORS.LIMIT_REACHED,
          'You have reached the branch limit for your plan (2 branches)',
        ),
      ),
    ).toBe(copy.planLimitReached);

    // Neither is the dead-end permission message.
    expect(copy.planFeatureNotIncluded).not.toBe(strings.errors.forbidden);
    expect(copy.planLimitReached).not.toBe(strings.errors.forbidden);
  });

  it('defers to the server wording for a 403 it cannot classify', () => {
    // An unlabelled 403 still says something useful in the body; preferring it
    // beats substituting copy that may describe the wrong cause.
    expect(
      branchPlanErrorMessage(
        new ApiError('Upgrade your plan first.', { code: 'HTTP_403', status: 403 }),
      ),
    ).toBeNull();

    expect(branchPlanErrorMessage(new Error('plain failure'))).toBeNull();
  });
});
