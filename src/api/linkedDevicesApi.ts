import { z } from 'zod';
import { request, requestValidated } from '@api/client';
import type { ApiRequestOptions } from '@app-types/api';

/** A device the account is signed in on (`GET /users/linked-devices`). */
export const linkedDeviceSchema = z.object({
  id: z.string(),
  deviceName: z.string().catch('Device'),
  platform: z.string().catch('web'),
  lastActiveAt: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  isCurrent: z.boolean().optional().catch(false),
});
export type LinkedDevice = z.infer<typeof linkedDeviceSchema>;

export const linkedDevicesApi = {
  async list(options: ApiRequestOptions = {}): Promise<LinkedDevice[]> {
    return requestValidated(
      { method: 'GET', url: '/users/linked-devices', ...options },
      z.array(linkedDeviceSchema),
    );
  },

  /** Names the session this token belongs to; sent once after sign-in. */
  async describeCurrent(
    input: { deviceName: string; platform: 'ios' | 'android' | 'web' },
    options: ApiRequestOptions = {},
  ): Promise<void> {
    await request<unknown>({
      method: 'PUT',
      url: '/users/linked-devices/current',
      data: input,
      ...options,
    });
  },

  /** Signs that device out (`DELETE /users/linked-devices/:id`). */
  async revoke(id: string, options: ApiRequestOptions = {}): Promise<void> {
    await request<unknown>({
      method: 'DELETE',
      url: `/users/linked-devices/${id}`,
      ...options,
    });
  },
};
