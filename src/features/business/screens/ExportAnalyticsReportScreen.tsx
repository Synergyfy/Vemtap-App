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

export interface ExportAnalyticsReportScope {
  /** `1 Oct – 30 Oct 2026`. */
  timeframe: string;
  /** `30 days`. */
  timeframeMeta: string;
  /** `All Locations` or the branch name. */
  branch: string;
}

export interface ExportAnalyticsReportScreenProps {
  scope: ExportAnalyticsReportScope;
  isExporting?: boolean;
  /** Result line after an export: success, or why it failed. */
  message?: { tone: 'success' | 'error'; text: string } | null;
  onClose?: () => void;
  onExport?: (payload: ExportAnalyticsReportPayload) => void;
}

export interface ExportAnalyticsReportPayload {
  format: ExportFormatId;
  modules: ExportModuleId[];
}

export type ExportFormatId = (typeof copy.formats)[number]['id'];
export type ExportModuleId = (typeof copy.modules)[number]['id'];

/**
 * Export Analytics Report.
 * stitch_vemtap_mobile_app_design/export_analytics_report — full page (sticky footer
 * action bar, no scrim), hosted by the shared Business Operations header owner.
 */
export function ExportAnalyticsReportScreen({
  scope,
  isExporting = false,
  message,
  onClose,
  onExport,
}: ExportAnalyticsReportScreenProps) {
  const [format, setFormat] = useState<ExportFormatId>(copy.formats[0].id);
  const [modules, setModules] = useState<ExportModuleId[]>(
    copy.modules.map(module => module.id),
  );

  const formatLabel =
    copy.formats.find(option => option.id === format)?.name ?? copy.formats[0].name;

  function toggleModule(id: ExportModuleId) {
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
                {scope.timeframe}
              </VemtapText>
            </View>
            <VemtapText variant="micro" className="shrink-0 text-primary">
              {scope.timeframeMeta}
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
                {scope.branch}
              </VemtapText>
            </View>
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
            onChange={key => setFormat(key as ExportFormatId)}
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
          <View className="flex-row items-center gap-2">
            <Icon name="share" size={14} color={colors.textSecondary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {copy.deliveryBody}
            </VemtapText>
          </View>
        </BusinessPanel>

        {message ? (
          <View
            className={cn(
              'flex-row items-center gap-2 rounded-field p-2.5',
              message.tone === 'success' ? 'bg-badge-discount-bg' : 'bg-error-container',
            )}
          >
            <Icon
              name={message.tone === 'success' ? 'checkCircle' : 'alert'}
              size={16}
              color={message.tone === 'success' ? colors.badgeDiscountText : colors.error}
            />
            <VemtapText
              variant="caption"
              className={cn(
                'min-w-0 flex-1',
                message.tone === 'success' ? 'text-badge-discount-text' : 'text-error',
              )}
            >
              {message.text}
            </VemtapText>
          </View>
        ) : null}

        <Button
          label={
            isExporting ? copy.generating : copy.generate.replace('{format}', formatLabel)
          }
          labelVariant="labelMd"
          size="md"
          loading={isExporting}
          disabled={isExporting || modules.length === 0}
          leftIcon={<Icon name="download" size={18} color={colors.surface} />}
          onPress={() => {
            if (isExporting || modules.length === 0) return;
            onExport?.({ format, modules });
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
