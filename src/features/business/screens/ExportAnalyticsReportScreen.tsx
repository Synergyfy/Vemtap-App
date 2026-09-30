import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { BusinessAnalyticsRow } from '@features/business/components/BusinessAnalyticsPrimitives';
import {
  BusinessLinkRow,
  BusinessPanel,
  BusinessSegmentTabs,
  type BusinessSegmentTab,
} from '@features/business/components/BusinessOpsPrimitives';

cssInterop(Pressable, { className: 'style' });

const copy = strings.businessIntelligence.exportReport;

const formatTabs: BusinessSegmentTab[] = [
  { key: copy.formats[0].id, label: copy.formats[0].name, icon: 'table' },
  { key: copy.formats[1].id, label: copy.formats[1].name, icon: 'pdfFile' },
];

export interface ExportAnalyticsReportScreenProps {
  onClose?: () => void;
  onExport?: (payload: ExportAnalyticsReportPayload) => void;
}

export interface ExportAnalyticsReportPayload {
  format: string;
  modules: string[];
  destination: string;
}

/**
 * Export Analytics Report.
 * stitch_vemtap_mobile_app_design/export_analytics_report — full page (sticky footer
 * action bar, no scrim), hosted by the shared Business Operations header owner.
 */
export function ExportAnalyticsReportScreen({
  onClose,
  onExport,
}: ExportAnalyticsReportScreenProps) {
  const [format, setFormat] = useState<string>(copy.formats[0].id);
  const [modules, setModules] = useState<string[]>(copy.modules.map(module => module.id));
  const [destination, setDestination] = useState<string>(copy.destinations[0].id);
  const [generating, setGenerating] = useState(false);

  const formatLabel =
    copy.formats.find(option => option.id === format)?.name ?? copy.formats[0].name;

  function toggleModule(id: string) {
    setModules(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1 gap-1">
              <VemtapText
                variant="headingLg"
                className="font-sans-semibold text-heading-lg"
                numberOfLines={2}
              >
                {copy.title}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
                {copy.subtitle}
              </VemtapText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.close}
              onPress={onClose}
              className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface"
            >
              <Icon name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <BusinessPanel className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.scopeTitle}
            </VemtapText>
            <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
              <Icon name="checkCircle" size={12} color={colors.badgeDiscountText} />
              <VemtapText
                variant="micro"
                className="font-sans-semibold text-badge-discount-text"
              >
                {copy.scopeReady}
              </VemtapText>
            </View>
          </View>
          <View className="flex-row items-center gap-2 rounded-field bg-surface-subtle p-2.5">
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary">
                {copy.timeframe}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.timeframeValue}
              </VemtapText>
            </View>
            <VemtapText variant="micro" className="shrink-0 text-primary">
              {copy.timeframeMeta}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-2 rounded-field bg-surface-subtle p-2.5">
            <Icon name="store" size={14} color={colors.textSecondary} />
            <View className="min-w-0 flex-1">
              <VemtapText variant="micro" tone="tertiary">
                {copy.branch}
              </VemtapText>
              <VemtapText
                variant="caption"
                className="font-sans-semibold"
                numberOfLines={1}
              >
                {copy.branchValue}
              </VemtapText>
            </View>
            <VemtapText variant="micro" className="shrink-0 text-primary">
              {copy.branchMeta}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-2">
            <Icon name="databaseLocal" size={14} color={colors.textSecondary} />
            <VemtapText
              variant="micro"
              tone="secondary"
              className="min-w-0 flex-1"
              numberOfLines={2}
            >
              {copy.volume}
            </VemtapText>
          </View>
        </BusinessPanel>

        <BusinessPanel className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.formatTitle}
            </VemtapText>
            <VemtapText variant="micro" tone="tertiary" numberOfLines={1}>
              {copy.formatMeta}
            </VemtapText>
          </View>
          <BusinessSegmentTabs
            tabs={formatTabs}
            value={format}
            onChange={setFormat}
            accessibilityLabel={copy.formatTitle}
          />
          {copy.formats.map(option => (
            <View
              key={option.id}
              className={cn(
                'gap-1.5 rounded-field border p-3',
                option.id === format
                  ? 'border-primary bg-primary-fixed'
                  : 'border-outline-variant bg-surface-subtle',
              )}
            >
              <View className="flex-row items-center justify-between gap-2">
                <VemtapText
                  variant="labelSm"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {option.meta}
                </VemtapText>
                {option.id === format ? (
                  <Icon name="checkCircle" size={16} color={colors.primary} />
                ) : null}
              </View>
              <VemtapText variant="micro" tone="tertiary">
                {option.body}
              </VemtapText>
            </View>
          ))}
        </BusinessPanel>

        <BusinessPanel className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="labelMd"
              className="font-sans-semibold"
              numberOfLines={2}
            >
              {copy.modulesTitle}
            </VemtapText>
            <View className="shrink-0">
              <BusinessLinkRow
                label={
                  modules.length === copy.modules.length
                    ? copy.deselectAll
                    : copy.selectAll
                }
                icon={modules.length === copy.modules.length ? 'remove' : 'doneAll'}
                onPress={() =>
                  setModules(
                    modules.length === copy.modules.length
                      ? []
                      : copy.modules.map(module => module.id),
                  )
                }
              />
            </View>
          </View>
          <VemtapText variant="micro" tone="tertiary">
            {copy.modulesSelected
              .replace('{count}', String(modules.length))
              .replace('{total}', String(copy.modules.length))}
          </VemtapText>
          {copy.modules.map(module => (
            <BusinessAnalyticsRow
              key={module.id}
              title={module.name}
              subtitle={module.meta}
              icon={modules.includes(module.id) ? 'checkCircle' : 'addCircle'}
              onPress={() => toggleModule(module.id)}
            />
          ))}
        </BusinessPanel>

        <BusinessPanel className="gap-2">
          <VemtapText variant="labelMd" className="font-sans-semibold">
            {copy.deliveryTitle}
          </VemtapText>
          {copy.destinations.map(option => (
            <BusinessAnalyticsRow
              key={option.id}
              title={option.name}
              subtitle={option.meta}
              icon={
                option.id === 'device'
                  ? 'download'
                  : option.id === 'email'
                    ? 'mail'
                    : 'whatsapp'
              }
              trailing={option.id === destination ? copy.selected : undefined}
              trailingTone="brand"
              onPress={() => setDestination(option.id)}
            />
          ))}
        </BusinessPanel>

        <Button
          label={
            generating ? copy.generating : copy.generate.replace('{format}', formatLabel)
          }
          labelVariant="labelMd"
          size="md"
          disabled={generating || modules.length === 0}
          leftIcon={<Icon name="download" size={18} color={colors.surface} />}
          onPress={() => {
            if (generating || modules.length === 0) return;
            setGenerating(true);
            onExport?.({ format, modules, destination });
          }}
        />

        <View className="flex-row items-center gap-1.5">
          <Icon name="verifiedUser" size={14} color={colors.textTertiary} />
          <VemtapText variant="micro" tone="tertiary" className="min-w-0 flex-1">
            {copy.footer}
          </VemtapText>
        </View>
      </ScrollView>
    </View>
  );
}
