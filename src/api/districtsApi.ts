import { z } from 'zod';
import { requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/**
 * Districts (Wuse 2, Maitama…) and clusters: named areas with a centre and a
 * radius that boosts, campaigns and segments target, and that a consumer's
 * chosen area is saved as. Shapes follow `apps/backend/src/modules/clusters`
 * (`DistrictView`) and promotions' `TargetArea`.
 */
export const targetAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  radiusMeters: z.number(),
});
export type TargetArea = z.infer<typeof targetAreaSchema>;

export const districtsApi = {
  /** Active districts (`GET /clusters/districts`, public). */
  async list(options: ApiRequestOptions = {}): Promise<TargetArea[]> {
    return requestValidated<TargetArea[]>(
      { method: 'GET', url: '/clusters/districts', ...options },
      z.array(targetAreaSchema),
    );
  },
};
