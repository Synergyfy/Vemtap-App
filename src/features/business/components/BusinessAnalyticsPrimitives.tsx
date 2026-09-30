import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { BusinessStatusPill, type BusinessPillTone } from './BusinessPrimitives';
import { BusinessChipScroller } from './BusinessOpsPrimitives';
import { BusinessSelectionChip } from './BusinessPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

/* -------------------------------------------------------------------------- */
/* Analytics category navigation                                              */
/* -------------------------------------------------------------------------- */

export interface BusinessAnalyticsTab {
  key: string;
  label: string;
  icon?: IconName;
}

export const businessAnalyticsTabs: readonly BusinessAnalyticsTab[] = [
  { key: 'business', label: 'Business' },
  { key: 'customers', label: 'Customers' },
  { key: 'deals', label: 'Deals' },
  { key: 'locations', label: 'Locations' },
  { key: 'pos', label: 'POS Terminal' },
] as const;

export interface BusinessAnalyticsNavProps {
  tabs: readonly BusinessAnalyticsTab[];
  value: string;
  onChange: (key: string) => void;
  /** Sticky variant pins the strip to the top of the scroll column. */
  sticky?: boolean;
  /** `dot` marks the active pill, `icon` shows a glyph. */
  activeMarker?: 'dot' | 'icon';
  className?: string;
}

/**
 * The category strip shared by every analytics surface (Customers · Loyalty ·
 * Deals · Feedback, or the five-way Business/Customers/Deals/Locations/POS set).
 * Single owner so the analytics screens can never disagree on which segment is
 * active or how the active pill looks.
 */
export function BusinessAnalyticsNav({
  tabs,
  value,
  onChange,
  sticky = false,
  activeMarker = 'dot',
  className,
}: BusinessAnalyticsNavProps) {
  return (
    <View
      className={cn('bg-surface', sticky && 'sticky top-0 z-40 shadow-sm', className)}
    >
      <BusinessChipScroller>
        {tabs.map(tab => {
          const active = tab.key === value;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              onPress={() => onChange(tab.key)}
              className={cn(
                'min-h-9 flex-row items-center gap-1.5 rounded-full px-4 py-1.5 active:scale-95',
                active
                  ? 'bg-surface-tint shadow-sm'
                  : 'bg-surface-container text-text-secondary',
              )}
            >
              {active && activeMarker === 'dot' ? (
                <View className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              ) : null}
              {tab.icon ? (
                <Icon
                  name={tab.icon}
                  size={16}
                  color={active ? colors.primary : colors.textTertiary}
                />
              ) : null}
              <VemtapText
                variant="labelSm"
                className={
                  active ? 'font-sans-semibold text-primary' : 'text-text-secondary'
                }
                numberOfLines={1}
              >
                {tab.label}
              </VemtapText>
            </Pressable>
          );
        })}
      </BusinessChipScroller>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Date-range chips                                                           */
/* -------------------------------------------------------------------------- */

export interface BusinessDateRangeProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  className?: string;
}

/** Today / 7D / 30D / Custom range switch shared by the analytics surfaces. */
export function BusinessDateRange({
  value,
  options,
  onChange,
  className,
}: BusinessDateRangeProps) {
  return (
    <BusinessChipScroller className={className}>
      {options.map(option => (
        <BusinessSelectionChip
          key={option}
          label={option}
          selected={value === option}
          showCheck={false}
          onPress={() => onChange(option)}
        />
      ))}
    </BusinessChipScroller>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric grid                                                                */
/* -------------------------------------------------------------------------- */

export interface BusinessMetricCell {
  label: string;
  value: string;
  /** Optional footnote line (delta or descriptor). */
  note?: string;
  noteIcon?: IconName;
  noteTone?: 'default' | 'brand' | 'success' | 'tertiary';
  icon?: IconName;
  live?: boolean;
}

const metricNoteClass: Record<NonNullable<BusinessMetricCell['noteTone']>, string> = {
  default: 'text-text-secondary',
  brand: 'text-primary',
  success: 'text-badge-discount-text',
  tertiary: 'text-tertiary',
};

export interface BusinessMetricGridProps {
  cells: readonly BusinessMetricCell[];
  /** `wrap2` is a 2-up grid, `wrap3` a 3-up row. */
  columns?: 2 | 3;
  /** `tile` uses bordered cards, `bare` uses tint tiles inside a panel. */
  variant?: 'tile' | 'bare';
  className?: string;
}

/** KPI cell grid. One owner for the 2-up and 3-up analytics metric rows. */
export function BusinessMetricGrid({
  cells,
  columns = 2,
  variant = 'tile',
  className,
}: BusinessMetricGridProps) {
  const width = columns === 3 ? 'min-w-[30%]' : 'min-w-[45%]';
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {cells.map(cell => (
        <View
          key={cell.label}
          className={cn(
            width,
            'flex-1 gap-1',
            variant === 'tile'
              ? 'rounded-card-lg bg-surface p-3 shadow-sm'
              : 'rounded-field bg-surface-subtle p-2.5',
          )}
        >
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              className="min-w-0 flex-1 font-sans-medium"
            >
              {cell.label}
            </VemtapText>
            {cell.live ? (
              <View className="h-2.5 w-2.5 shrink-0 rounded-full bg-badge-discount-text" />
            ) : null}
            {cell.icon ? (
              <View className="h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                <Icon name={cell.icon} size={15} color={colors.primary} />
              </View>
            ) : null}
          </View>
          <VemtapText
            variant={columns === 3 ? 'headingSm' : 'headingLg'}
            className="font-sans-bold"
            numberOfLines={1}
          >
            {cell.value}
          </VemtapText>
          {cell.note ? (
            <View className="flex-row items-center gap-1">
              {cell.noteIcon ? (
                <Icon
                  name={cell.noteIcon}
                  size={13}
                  color={
                    cell.noteTone === 'success'
                      ? colors.badgeDiscountText
                      : cell.noteTone === 'tertiary'
                        ? colors.tertiary
                        : colors.textTertiary
                  }
                />
              ) : null}
              <VemtapText
                variant="caption"
                className={cn(
                  'min-w-0 flex-1',
                  metricNoteClass[cell.noteTone ?? 'default'],
                )}
                numberOfLines={2}
              >
                {cell.note}
              </VemtapText>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Comparative bar row                                                        */
/* -------------------------------------------------------------------------- */

export interface BusinessCompareRow {
  id: string;
  label: string;
  value: string;
  /** 0–100 relative to the largest row. */
  percent: number;
  dotClass?: string;
  fillClass?: string;
}

export interface BusinessCompareBarsProps {
  rows: readonly BusinessCompareRow[];
  /** `segmented` is a compact legend, `titled` shows label + value headers. */
  variant?: 'segmented' | 'titled';
  height?: 'sm' | 'md';
  className?: string;
}

/**
 * Horizontal comparison bars. Also backs the "channel split" and "cohort mix"
 * stacks by passing the widths straight through.
 */
export function BusinessCompareBars({
  rows,
  variant = 'titled',
  height = 'md',
  className,
}: BusinessCompareBarsProps) {
  return (
    <View className={cn('gap-2', className)}>
      {rows.map(row => (
        <View key={row.id} className="gap-1">
          {variant === 'titled' ? (
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-row items-center gap-2">
                {row.dotClass ? (
                  <View
                    className={cn('h-2.5 w-2.5 shrink-0 rounded-full', row.dotClass)}
                  />
                ) : null}
                <VemtapText
                  variant="labelSm"
                  className="min-w-0 flex-1 font-sans-semibold"
                  numberOfLines={1}
                >
                  {row.label}
                </VemtapText>
              </View>
              <VemtapText variant="labelSm" className="shrink-0 font-sans-semibold">
                {row.value}
              </VemtapText>
            </View>
          ) : null}
          <View className="flex-row overflow-hidden rounded-full bg-surface-container-low">
            <View
              className={cn(
                height === 'sm' ? 'h-2' : 'h-3',
                'rounded-full bg-primary',
                row.fillClass,
              )}
              style={{ width: `${Math.max(2, Math.min(100, row.percent))}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Section header with a right-hand pill                                      */
/* -------------------------------------------------------------------------- */

export interface BusinessSectionHeaderProps {
  title: string;
  meta?: string;
  badge?: string;
  badgeTone?: BusinessPillTone;
  icon?: IconName;
  /** Renders a small live dot before the title. */
  live?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Title + optional meta/badge row used across every analytics section. */
export function BusinessSectionHeader({
  title,
  meta,
  badge,
  badgeTone = 'brand',
  icon,
  live = false,
  children,
  className,
}: BusinessSectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-2', className)}>
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        {live ? (
          <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
        ) : null}
        {icon ? <Icon name={icon} size={19} color={colors.primary} /> : null}
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={2}
        >
          {title}
        </VemtapText>
      </View>
      {meta ? (
        <VemtapText
          variant="caption"
          tone="secondary"
          className="shrink-0"
          numberOfLines={1}
        >
          {meta}
        </VemtapText>
      ) : null}
      {badge ? <BusinessStatusPill label={badge} tone={badgeTone} /> : null}
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Tappable analytics row                                                     */
/* -------------------------------------------------------------------------- */

export interface BusinessAnalyticsRowProps {
  title: string;
  subtitle?: string;
  /** Leading glyph well; omit for a plain leading text/figure. */
  icon?: IconName;
  /** Arbitrary leading node (avatar, image) that replaces the icon well. */
  leading?: ReactNode;
  /** Trailing figure rendered in `trailingTone` before the optional badge. */
  trailing?: string;
  trailingTone?: 'default' | 'brand' | 'success';
  badge?: string;
  badgeTone?: BusinessPillTone;
  /** Renders a trailing chevron after any badge/figure. */
  chevron?: boolean;
  onPress?: () => void;
  className?: string;
}

const analyticsTrailingTone: Record<
  NonNullable<BusinessAnalyticsRowProps['trailingTone']>,
  string
> = {
  default: 'text-text',
  brand: 'text-primary',
  success: 'text-badge-discount-text',
};

/**
 * Tappable list row for analytics panels — segment, customer, item, staff and
 * branch lists. One owner so every drill-down row shares the same affordance,
 * hit target and label semantics.
 */
export function BusinessAnalyticsRow({
  title,
  subtitle,
  icon,
  leading,
  trailing,
  trailingTone = 'default',
  badge,
  badgeTone = 'neutral',
  chevron = false,
  onPress,
  className,
}: BusinessAnalyticsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className={cn(
        'min-h-[52px] flex-row items-center gap-3 rounded-field bg-surface-subtle p-2.5 active:bg-surface-container',
        className,
      )}
    >
      {leading ?? null}
      {leading || !icon ? null : (
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
          <Icon name={icon} size={18} color={colors.primary} />
        </View>
      )}
      <View className="min-w-0 flex-1">
        <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={1}>
          {title}
        </VemtapText>
        {subtitle ? (
          <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
            {subtitle}
          </VemtapText>
        ) : null}
      </View>
      {badge ? <BusinessStatusPill label={badge} tone={badgeTone} /> : null}
      {chevron ? (
        <View className="shrink-0">
          <Icon name="forward" size={18} color={colors.textTertiary} />
        </View>
      ) : null}
      {trailing ? (
        <VemtapText
          variant="labelSm"
          className={cn(
            'shrink-0 font-sans-semibold',
            analyticsTrailingTone[trailingTone],
          )}
          numberOfLines={1}
        >
          {trailing}
        </VemtapText>
      ) : null}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Insight / recommendation card                                              */
/* -------------------------------------------------------------------------- */

export interface BusinessInsightCardProps {
  title: string;
  body: string;
  icon: IconName;
  cta?: string;
  onCtaPress?: () => void;
  className?: string;
}

/** Generated-insight card: icon, headline, supporting copy and a single CTA. */
export function BusinessInsightCard({
  title,
  body,
  icon,
  cta,
  onCtaPress,
  className,
}: BusinessInsightCardProps) {
  return (
    <View className={cn('gap-2 rounded-field bg-surface-subtle p-3', className)}>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name={icon} size={17} color={colors.primary} />
        </View>
        <VemtapText
          variant="labelMd"
          className="min-w-0 flex-1 font-sans-semibold"
          numberOfLines={2}
        >
          {title}
        </VemtapText>
      </View>
      <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
        {body}
      </VemtapText>
      {cta ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cta}
          onPress={onCtaPress}
          className="min-h-9 flex-row items-center gap-1 self-start px-1"
        >
          <VemtapText
            variant="labelSm"
            className="font-sans-semibold text-primary"
            numberOfLines={1}
          >
            {cta}
          </VemtapText>
          <Icon name="forward" size={15} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Heatmap                                                                    */
/* -------------------------------------------------------------------------- */

export interface BusinessHeatmapRow {
  label: string;
  /** One entry per column: a level token or a highlighted `Peak`/`Rush` label. */
  cells: readonly string[];
}

export const heatmapLevels: Record<string, string> = {
  lowest: 'bg-surface-container-low',
  low: 'bg-surface-container-high',
  mid: 'bg-surface-container',
  high: 'bg-secondary-container',
  peak: 'bg-primary-container',
};

export interface BusinessHeatmapProps {
  columns: readonly string[];
  rows: readonly BusinessHeatmapRow[];
  className?: string;
}

/** Footfall heatmap grid: level tokens for quiet cells, pills for peaks. */
export function BusinessHeatmap({ columns, rows, className }: BusinessHeatmapProps) {
  return (
    <View className={cn('gap-1', className)}>
      <View className="flex-row">
        <View className="flex-1" />
        {columns.map(column => (
          <View key={column} className="flex-1 items-center px-1">
            <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
              {column}
            </VemtapText>
          </View>
        ))}
      </View>
      {rows.map(row => (
        <View key={row.label} className="flex-row items-center">
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="flex-1 pr-1"
          >
            {row.label}
          </VemtapText>
          {row.cells.map((cell, index) => (
            <View
              key={`${row.label}-${columns[index] ?? index}`}
              className="flex-1 px-0.5"
            >
              {heatmapLevels[cell] ? (
                <View className={cn('h-6 rounded', heatmapLevels[cell])} />
              ) : (
                <View className="h-6 items-center justify-center rounded bg-primary">
                  <VemtapText
                    variant="micro"
                    className="font-sans-bold text-primary-foreground"
                  >
                    {cell}
                  </VemtapText>
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
