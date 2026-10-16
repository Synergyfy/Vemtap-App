import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessActionDock,
  BusinessInlineAction,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessPanel,
  BusinessStatTile,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';

const copy = strings.posCustomerDossier;

export interface PosDossierView {
  name: string;
  initials: string;
  phone: string;
  email: string;
  tier: string;
  since: string;
  stats: { id: string; label: string; value: string; note: string }[];
  rewards: { id: string; title: string; body: string; affordable: boolean }[];
  visits: {
    id: string;
    reference: string;
    when: string;
    total: string;
    items: string;
    tender: string;
  }[];
}

export interface PosCustomerDossierScreenProps {
  view?: PosDossierView;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onBack?: () => void;
  onAttachToSale?: () => void;
  onOpenRewards?: () => void;
  onOpenVisit?: (saleId: string) => void;
  onOpenCrm?: () => void;
}

/** A patron's quick dossier at the till: standing, redeemable rewards and recent visits. */
export function PosCustomerDossierScreen({
  view,
  isLoading,
  isError,
  onRetry,
  onBack,
  onAttachToSale,
  onOpenRewards,
  onOpenVisit,
  onOpenCrm,
}: PosCustomerDossierScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
      contentContainerClassName="pb-8"
      footer={
        view ? (
          <BusinessActionDock>
            <Button
              label={copy.attachCta(view.name)}
              labelVariant="labelMd"
              onPress={onAttachToSale}
              leftIcon={<Icon name="link" size={17} color={colors.surface} />}
            />
          </BusinessActionDock>
        ) : undefined
      }
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
          <View className="flex-row items-center gap-3">
            <BusinessInitialsAvatar
              initials={view.initials}
              size="lg"
              tone="brand"
              badgeIcon="verified"
            />
            <View className="min-w-0 flex-1">
              <VemtapText
                variant="headingSm"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {view.name}
              </VemtapText>
              <BusinessStatusPill
                label={view.tier}
                tone="brand"
                className="mt-1 self-start"
              />
              {view.phone ? (
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="mt-1"
                  numberOfLines={1}
                >
                  {view.phone}
                </VemtapText>
              ) : null}
              {view.email ? (
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {view.email}
                </VemtapText>
              ) : null}
            </View>
          </View>
          <VemtapText variant="micro" tone="tertiary" className="mt-2" numberOfLines={1}>
            {view.since}
          </VemtapText>

          <View className="mt-3 flex-row gap-2">
            {view.stats.map(stat => (
              <BusinessStatTile
                key={stat.id}
                label={stat.label}
                value={stat.value}
                className="p-2.5"
              />
            ))}
          </View>

          <BusinessPanel
            className="mt-3"
            title={copy.perksTitle}
            icon="loyalty"
            badge={copy.perksBadge(
              view.rewards.filter(reward => reward.affordable).length,
            )}
            badgeTone="success"
          >
            {view.rewards.length ? (
              <View className="gap-2">
                {view.rewards.map(reward => (
                  <View
                    key={reward.id}
                    className="flex-row items-center gap-2 rounded-field bg-surface-subtle p-2.5"
                  >
                    <View className="min-w-0 flex-1">
                      <VemtapText
                        variant="labelSm"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {reward.title}
                      </VemtapText>
                      <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                        {reward.body}
                      </VemtapText>
                    </View>
                    {reward.affordable ? (
                      <BusinessStatusPill label={copy.readyBadge} tone="success" />
                    ) : null}
                  </View>
                ))}
                <BusinessInlineAction
                  label={copy.rewardsCta}
                  icon="arrowForward"
                  onPress={onOpenRewards}
                />
              </View>
            ) : (
              <VemtapText variant="caption" tone="secondary">
                {copy.noRewards}
              </VemtapText>
            )}
          </BusinessPanel>

          <BusinessPanel
            className="mt-3"
            title={copy.visitsTitle}
            icon="history"
            badge={copy.visitsBadge(view.visits.length)}
            badgeTone="neutral"
          >
            {view.visits.length ? (
              <View className="gap-2">
                {view.visits.map(visit => (
                  <Pressable
                    key={visit.id}
                    accessibilityRole="button"
                    accessibilityLabel={visit.reference}
                    onPress={() => onOpenVisit?.(visit.id)}
                    className="gap-0.5 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <VemtapText
                        variant="labelSm"
                        className="font-sans-semibold"
                        numberOfLines={1}
                      >
                        {visit.reference}
                      </VemtapText>
                      <VemtapText
                        variant="labelSm"
                        className="font-sans-bold"
                        numberOfLines={1}
                      >
                        {visit.total}
                      </VemtapText>
                    </View>
                    <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                      {`${visit.when} • ${visit.tender}`}
                    </VemtapText>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                      {visit.items}
                    </VemtapText>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                variant="contained"
                title={copy.empty.title}
                description={copy.empty.body}
              />
            )}
          </BusinessPanel>

          <View className="mt-3 gap-2 rounded-card bg-surface-tint p-3">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {copy.crmTitle}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary" numberOfLines={3}>
              {copy.crmBody}
            </VemtapText>
            <BusinessInlineAction
              label={copy.crmCta}
              icon="arrowForward"
              onPress={onOpenCrm}
            />
          </View>
        </>
      )}
    </BusinessScreenLayout>
  );
}
