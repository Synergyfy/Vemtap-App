import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { EmptyState } from '@components/shared/EmptyState';
import {
  BusinessActionDock,
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessAnalyticsNav,
  BusinessAnalyticsRow,
  BusinessMetricGrid,
} from '@features/business/components/BusinessAnalyticsPrimitives';
import { BusinessQrFrame } from '@features/business/components/BusinessPosPrimitives';
import {
  locationQrNetwork,
  locationQrRules,
  qrSubTabIcon,
  qrSubTabs,
  scanPoints,
} from '@features/business/data/businessGrowthData';

const copy = strings.locationQr;

const qrTabs = qrSubTabs.map(label => ({ key: label, label, icon: qrSubTabIcon[label] }));

export interface LocationQrScreenProps {
  onBack?: () => void;
  onOpenNotifications?: () => void;
  onOpenSubTab?: (tabKey: string) => void;
  onNewPoint?: () => void;
  onFilterBranch?: (branchId: string) => void;
  onOpenPoint?: (pointId: string) => void;
  onViewTag?: (pointId: string) => void;
  onPrintSticker?: (pointId: string) => void;
  onShare?: (pointId: string) => void;
  onSavePng?: (pointId: string) => void;
  onExportAll?: () => void;
  onOrderAcrylics?: () => void;
  onOpenRule?: (ruleId: string) => void;
  onOpenProfile?: () => void;
}

/**
 * Location QR: branch-grouped scan points with their weekly traffic and
 * per-point actions, the network-wide live status, and the smart branch rules
 * (dynamic table numbering, off-hours redirect) plus bulk export/ordering.
 */
export function LocationQrScreen({
  onBack,
  onOpenNotifications,
  onOpenSubTab,
  onNewPoint,
  onFilterBranch,
  onOpenPoint,
  onViewTag,
  onPrintSticker,
  onShare,
  onSavePng,
  onExportAll,
  onOrderAcrylics,
  onOpenRule,
  onOpenProfile,
}: LocationQrScreenProps) {
  const [subTab, setSubTab] = useState(qrSubTabs[1]);
  const [branch, setBranch] = useState<string>(copy.branchGroups[0].id);

  const visible =
    branch === 'all' ? scanPoints : scanPoints.filter(point => point.branchId === branch);

  return (
    <BusinessScreenLayout
      header={{
        title: copy.headerTitle,
        onBack,
        actions: [
          { icon: 'bellRing', label: copy.headerTitle, onPress: onOpenNotifications },
          { icon: 'accountCircle', label: copy.headerTitle, onPress: onOpenProfile },
        ],
      }}
      contentContainerClassName="pb-8"
      footer={
        <BusinessActionDock>
          <Button
            label={copy.newPointCta}
            labelVariant="labelMd"
            onPress={onNewPoint}
            leftIcon={<Icon name="plus" size={18} color={colors.surface} />}
          />
          <View className="flex-row gap-2">
            <View className="min-w-0 flex-1">
              <Button
                label={copy.exportCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onExportAll}
              />
            </View>
            <View className="min-w-0 flex-1">
              <Button
                label={copy.acrylicCta}
                labelVariant="labelSm"
                variant="secondary"
                onPress={onOrderAcrylics}
              />
            </View>
          </View>
        </BusinessActionDock>
      }
    >
      <View className="gap-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {copy.manageLabel}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.manageSubtitle}
        </VemtapText>
      </View>

      <BusinessAnalyticsNav
        tabs={qrTabs}
        value={subTab}
        onChange={next => {
          setSubTab(next as typeof subTab);
          onOpenSubTab?.(next);
        }}
        className="-mx-6 mt-3"
      />

      <BusinessChipScroller className="mt-3">
        {copy.branchGroups.map(group => (
          <BusinessCountChip
            key={group.id}
            label={group.label}
            count={group.count}
            selected={group.id === branch}
            onPress={() => {
              setBranch(group.id);
              onFilterBranch?.(group.id);
            }}
          />
        ))}
      </BusinessChipScroller>

      <BusinessPanel
        className="mt-3"
        title={copy.networkTitle}
        icon="trendingUp"
        badge={copy.networkBadge}
        badgeTone="brand"
      >
        <BusinessMetricGrid
          cells={locationQrNetwork.map(item => ({
            label: item.label,
            value: item.value,
            icon: item.icon,
          }))}
          columns={3}
          variant="bare"
        />
      </BusinessPanel>

      <View className="mt-3 gap-2">
        {visible.map(point => (
          <View key={point.id} className="gap-2 rounded-card bg-surface p-3 shadow-sm">
            <View className="flex-row items-center gap-2.5">
              <BusinessIconWell icon={point.icon} tone="brand" />
              <View className="min-w-0 flex-1">
                <VemtapText
                  variant="labelMd"
                  className="font-sans-semibold"
                  numberOfLines={1}
                >
                  {point.name}
                </VemtapText>
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  {`${point.branch} • ${point.branchCode}`}
                </VemtapText>
              </View>
              <BusinessStatusPill label={point.status} tone="success" />
            </View>

            {point.hero ? (
              <View className="flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5">
                <View className="shrink-0">
                  <BusinessQrFrame size="sm" glyph="contactless" caption={point.meta} />
                </View>
                <View className="min-w-0 flex-1 gap-1">
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    {point.meta}
                  </VemtapText>
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="checkCircle" size={14} color={colors.badgeDiscountText} />
                    <VemtapText
                      variant="caption"
                      className="min-w-0 flex-1 text-badge-discount-text"
                      numberOfLines={1}
                    >
                      {copy.readyLabel}
                    </VemtapText>
                  </View>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
                    {point.weeklyScans}
                  </VemtapText>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center gap-1.5">
                <Icon name="insights" size={14} color={colors.textTertiary} />
                <VemtapText
                  variant="caption"
                  tone="secondary"
                  className="min-w-0 flex-1"
                  numberOfLines={1}
                >
                  {point.weeklyScans}
                </VemtapText>
              </View>
            )}

            <View className="flex-row flex-wrap gap-1.5">
              {point.badges.map(badge => (
                <View
                  key={badge}
                  className="rounded-full bg-surface-container px-2.5 py-1"
                >
                  <VemtapText
                    variant="micro"
                    className="text-text-secondary"
                    numberOfLines={1}
                  >
                    {badge}
                  </VemtapText>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {point.ctas.map(cta => (
                <Pressable
                  key={cta}
                  accessibilityRole="button"
                  accessibilityLabel={`${cta}: ${point.name}`}
                  onPress={() => {
                    if (cta === copy.viewTagCta) onViewTag?.(point.id);
                    else if (cta === copy.printStickerCta) onPrintSticker?.(point.id);
                    else if (cta === copy.shareCta) onShare?.(point.id);
                    else if (cta === copy.savePngCta) onSavePng?.(point.id);
                    else onOpenPoint?.(point.id);
                  }}
                  className={`min-h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-field px-3 active:scale-95 ${
                    cta === copy.viewTagCta ? 'bg-primary' : 'bg-surface-container'
                  }`}
                >
                  <Icon
                    name={
                      cta === copy.viewTagCta
                        ? 'qrCode'
                        : cta === copy.printStickerCta
                          ? 'printReceipt'
                          : cta === copy.shareCta
                            ? 'share'
                            : 'download'
                    }
                    size={15}
                    color={cta === copy.viewTagCta ? colors.surface : colors.text}
                  />
                  <VemtapText
                    variant="labelSm"
                    className={
                      cta === copy.viewTagCta
                        ? 'font-sans-semibold text-surface'
                        : 'font-sans-semibold'
                    }
                    numberOfLines={1}
                  >
                    {cta}
                  </VemtapText>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>

      {visible.length === 0 ? (
        <EmptyState
          icon="qrCodeScanner"
          variant="contained"
          title={copy.empty.title}
          description={copy.empty.body}
        />
      ) : null}

      <BusinessPanel className="mt-3" title={copy.rulesTitle} icon="bolt">
        <View className="gap-2">
          {locationQrRules.map(rule => (
            <BusinessAnalyticsRow
              key={rule.id}
              title={rule.title}
              subtitle={rule.body}
              icon={rule.icon}
              chevron
              onPress={() => onOpenRule?.(rule.id)}
            />
          ))}
        </View>
      </BusinessPanel>
    </BusinessScreenLayout>
  );
}
