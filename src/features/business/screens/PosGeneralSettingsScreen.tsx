import React from 'react';
import { View } from 'react-native';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import type { IconName } from '@components/ui/Icon';

const copy = strings.posGeneralSettings;

export type PosSettingLinkId =
  | 'receipt'
  | 'hardware'
  | 'payments'
  | 'taxes'
  | 'public-pos'
  | 'offline'
  | 'kitchen'
  | 'tills'
  | 'security';

export interface PosGeneralSettingsView {
  venue: string;
  branch: string;
  online: boolean;
  /** Chip value per settings row. */
  values: Record<PosSettingLinkId, string>;
  telemetry: { id: string; label: string; value: string }[];
}

export interface PosGeneralSettingsScreenProps {
  view?: PosGeneralSettingsView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onOpenSetting?: (settingId: PosSettingLinkId) => void;
}

const GROUPS: { id: string; links: { id: PosSettingLinkId; icon: IconName }[] }[] = [
  {
    id: 'hardware',
    links: [
      { id: 'receipt', icon: 'receiptLong' },
      { id: 'hardware', icon: 'devices' },
    ],
  },
  {
    id: 'payments',
    links: [
      { id: 'payments', icon: 'payments' },
      { id: 'taxes', icon: 'accountBalance' },
    ],
  },
  {
    id: 'operations',
    links: [
      { id: 'public-pos', icon: 'qrCode' },
      { id: 'kitchen', icon: 'roomService' },
      { id: 'offline', icon: 'cloudQueue' },
      { id: 'tills', icon: 'pointOfSale' },
    ],
  },
  { id: 'security', links: [{ id: 'security', icon: 'adminPanel' }] },
];

/** The POS settings hub: every settings area with its current value. */
export function PosGeneralSettingsScreen({
  view,
  isLoading,
  isError,
  onRetry,
  onBack,
  onOpenSetting,
}: PosGeneralSettingsScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
    >
      {!view ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <>
          <View className="gap-1 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className="min-w-0 flex-1 font-sans-semibold"
                numberOfLines={1}
              >
                {view.venue}
              </VemtapText>
              <BusinessStatusPill
                label={view.online ? copy.liveBadge : copy.offlineBadge}
                tone={view.online ? 'success' : 'warning'}
              />
            </View>
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {view.branch}
            </VemtapText>
            <View className="mt-2 flex-row gap-2">
              {view.telemetry.map(item => (
                <View
                  key={item.id}
                  className="min-w-0 flex-1 rounded-field bg-surface-subtle p-2"
                >
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {item.label}
                  </VemtapText>
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {item.value}
                  </VemtapText>
                </View>
              ))}
            </View>
          </View>

          {GROUPS.map(group => (
            <BusinessPanel
              key={group.id}
              className="mt-3"
              title={copy.groups[group.id as keyof typeof copy.groups]}
            >
              {group.links.map(link => (
                <BusinessSettingRow
                  key={link.id}
                  icon={link.icon}
                  title={copy.links[link.id].title}
                  subtitle={copy.links[link.id].body}
                  trailing="value"
                  value={view.values[link.id]}
                  onPress={() => onOpenSetting?.(link.id)}
                />
              ))}
            </BusinessPanel>
          ))}
        </>
      )}
    </BusinessScreenLayout>
  );
}
