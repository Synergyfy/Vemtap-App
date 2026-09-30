import React from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { BottomSheet } from '@components/shared/BottomSheet';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  SetupCallout,
  SetupSectionCard,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';

const copy = strings.campaignWizard.segmentActions;

export interface SegmentActionsSheetProps {
  visible: boolean;
  segmentName?: string;
  onClose: () => void;
  onCreateCampaign?: (segmentId: string) => void;
  onComposeMessage?: (segmentId: string) => void;
  onPromoteDeal?: (segmentId: string) => void;
  onOpenCrm?: (segmentId: string) => void;
}

/**
 * Use Segment — marketing actions.
 * stitch_vemtap_mobile_app_design/use_segment_marketing_actions
 *
 * The source is a grabber + bottom-anchored panel, so it is rebuilt on the shared
 * `BottomSheet` (delayed-fade scrim, Android-back dismissal) rather than a second
 * sheet implementation. This is the single owner of segment actions — the
 * Customer Segments hub does not ship its own drawer.
 */
export function SegmentActionsSheet({
  visible,
  segmentName = 'Returning Customers',
  onClose,
  onCreateCampaign,
  onComposeMessage,
  onPromoteDeal,
  onOpenCrm,
}: SegmentActionsSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.title}
      titleVariant="headingXl"
      titleClassName="text-heading-xl"
    >
      <View className="gap-4">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <View className="rounded-full bg-surface-container-high px-2 py-0.5">
            <VemtapText
              variant="micro"
              className="font-sans-semibold uppercase tracking-wider text-primary"
            >
              {copy.tag}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="h-1.5 w-1.5 rounded-full bg-success" />
            <VemtapText variant="labelMd" tone="secondary" numberOfLines={1}>
              {copy.meta}
            </VemtapText>
          </View>
          <VemtapText variant="labelMd" tone="tertiary" numberOfLines={1}>
            {`\u2022 ${copy.rate}`}
          </VemtapText>
        </View>

        <SetupSectionCard tone="low" className="gap-2 p-4">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1 gap-0.5">
              <View className="flex-row items-center gap-1.5">
                <Icon name="group" size={15} color={colors.primary} />
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {segmentName}
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.business}
              </VemtapText>
            </View>
            <View className="shrink-0 items-end">
              <VemtapText variant="micro" tone="tertiary">
                {copy.spendLabel}
              </VemtapText>
              <VemtapText
                variant="headingSm"
                className="font-sans-bold"
                numberOfLines={1}
              >
                {copy.spend}
              </VemtapText>
            </View>
          </View>
          <VemtapText variant="caption" tone="secondary">
            {copy.body}
          </VemtapText>
          <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface p-2.5">
            <View className="flex-row items-center gap-1.5">
              <Icon name="sensors" size={13} color={colors.textSecondary} />
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {copy.pushReady}
              </VemtapText>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon name="message" size={13} color={colors.textSecondary} />
              <VemtapText variant="micro" tone="secondary" numberOfLines={1}>
                {copy.messageReady}
              </VemtapText>
            </View>
          </View>
        </SetupSectionCard>

        <View className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.actionTitle}
          </VemtapText>
          <VemtapText variant="caption" tone="secondary">
            {copy.actionBody}
          </VemtapText>
        </View>

        <View className="gap-3">
          {copy.actions.map(action => {
            const recommended = 'badge' in action && Boolean(action.badge);
            const crm = action.id === 'crm';
            return (
              <SetupSectionCard
                key={action.id}
                tone={recommended ? 'lowest' : 'subtle'}
                className="gap-2 p-4"
              >
                <View className="flex-row items-start gap-2.5">
                  <View
                    className={
                      recommended
                        ? 'h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary'
                        : 'h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high'
                    }
                  >
                    <Icon
                      name={action.icon}
                      size={20}
                      color={recommended ? colors.surface : colors.primary}
                    />
                  </View>
                  <View className="min-w-0 flex-1 gap-0.5">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      <VemtapText
                        variant="labelMd"
                        className="min-w-0 font-sans-semibold"
                        numberOfLines={2}
                      >
                        {action.title}
                      </VemtapText>
                      {recommended ? (
                        <View className="rounded-full bg-badge-discount-bg px-2 py-0.5">
                          <VemtapText
                            variant="micro"
                            className="font-sans-semibold text-badge-discount-text"
                            numberOfLines={1}
                          >
                            {action.badge}
                          </VemtapText>
                        </View>
                      ) : null}
                    </View>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {action.sub}
                    </VemtapText>
                  </View>
                </View>
                {'body' in action ? (
                  <VemtapText variant="caption" tone="secondary">
                    {action.body}
                  </VemtapText>
                ) : null}
                {action.note ? (
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="verifiedUser" size={12} color={colors.textTertiary} />
                    <VemtapText
                      variant="micro"
                      tone="tertiary"
                      className="min-w-0 flex-1"
                    >
                      {action.note}
                    </VemtapText>
                  </View>
                ) : null}
                <Button
                  label={action.cta}
                  labelVariant={recommended ? 'button' : 'labelMd'}
                  variant={recommended ? 'primary' : 'secondary'}
                  size="sm"
                  accessibilityLabel={action.cta}
                  className={crm ? 'min-h-[40px] self-start px-4' : 'min-h-[48px]'}
                  onPress={() => {
                    if (action.id === 'campaign') onCreateCampaign?.(segmentName);
                    if (action.id === 'message') onComposeMessage?.(segmentName);
                    if (action.id === 'deal') onPromoteDeal?.(segmentName);
                    if (action.id === 'crm') onOpenCrm?.(segmentName);
                    onClose();
                  }}
                />
              </SetupSectionCard>
            );
          })}
        </View>

        <SetupCallout
          icon="shield"
          title={copy.rulesTitle}
          body={copy.rulesBody}
          tone="subtle"
          bodyVariant="caption"
        />

        <TextActionButton
          label={copy.back}
          icon="back"
          tone="secondary"
          onPress={onClose}
        />
      </View>
    </BottomSheet>
  );
}
