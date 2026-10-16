import { useCallback, useState } from 'react';
import type { PosSettings, PosSettingsUpdate } from '@api/posApi';

/**
 * Local edits over the saved POS settings. Screens read `value(key)` (the edit
 * if there is one, else the saved value) and submit `draft` — only the fields
 * the user touched — so a save never overwrites settings the screen did not show.
 */
export function usePosSettingsDraft(settings: PosSettings) {
  const [draft, setDraft] = useState<PosSettingsUpdate>({});

  const value = useCallback(
    <K extends keyof Omit<PosSettings, 'permissions' | 'tenderRails'>>(
      key: K,
    ): PosSettings[K] =>
      (key in draft ? (draft as PosSettings)[key] : settings[key]) as PosSettings[K],
    [draft, settings],
  );

  const set = useCallback(
    <K extends keyof Omit<PosSettingsUpdate, 'permissions' | 'tenderRails'>>(
      key: K,
      next: PosSettingsUpdate[K],
    ) => setDraft(current => ({ ...current, [key]: next })),
    [],
  );

  const permission = useCallback(
    <K extends keyof PosSettings['permissions']>(key: K): PosSettings['permissions'][K] =>
      (draft.permissions && key in draft.permissions
        ? draft.permissions[key]
        : settings.permissions[key]) as PosSettings['permissions'][K],
    [draft.permissions, settings.permissions],
  );

  const setPermission = useCallback(
    <K extends keyof PosSettings['permissions']>(
      key: K,
      next: PosSettings['permissions'][K],
    ) =>
      setDraft(current => ({
        ...current,
        permissions: { ...current.permissions, [key]: next },
      })),
    [],
  );

  const setRails = useCallback(
    (next: NonNullable<PosSettingsUpdate['tenderRails']>) =>
      setDraft(current => ({
        ...current,
        tenderRails: {
          ...current.tenderRails,
          ...next,
          transfer: { ...current.tenderRails?.transfer, ...next.transfer },
          houseTab: { ...current.tenderRails?.houseTab, ...next.houseTab },
        },
      })),
    [],
  );

  const rails = {
    cash: draft.tenderRails?.cash ?? settings.tenderRails.cash,
    card: draft.tenderRails?.card ?? settings.tenderRails.card,
    oneTap: draft.tenderRails?.oneTap ?? settings.tenderRails.oneTap,
    transfer: { ...settings.tenderRails.transfer, ...draft.tenderRails?.transfer },
    houseTab: { ...settings.tenderRails.houseTab, ...draft.tenderRails?.houseTab },
  };

  const dirty = Object.keys(draft).length > 0;
  const reset = useCallback(() => setDraft({}), []);

  return { draft, dirty, value, set, permission, setPermission, rails, setRails, reset };
}

/** Number from a text field; `fallback` when it is empty or not a number. */
export const toNumber = (text: string, fallback = 0) => {
  const parsed = Number(text.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) && text.trim() !== '' ? parsed : fallback;
};
