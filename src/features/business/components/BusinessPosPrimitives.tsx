import React, { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon, type IconName } from '@components/ui/Icon';
import { Avatar } from '@components/ui/Avatar';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';
import { BusinessProductImage, BusinessStatusPill } from './BusinessPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

/* -------------------------------------------------------------------------- */
/* QR frame                                                                   */
/* -------------------------------------------------------------------------- */

export interface BusinessQrFrameProps {
  /** Payload the QR represents; shown to the customer under the code. */
  label?: string;
  caption?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Center glyph rendered inside the QR (brand mark or contactless). */
  glyph?: IconName;
  children?: ReactNode;
  className?: string;
}

/**
 * The one QR surface in the business app. `size` picks the viewport, `glyph`
 * the centre node and `caption` the helper line below. Decorative module
 * field only — a real payload must come from a QR generator.
 */
export function BusinessQrFrame({
  label,
  caption,
  size = 'md',
  glyph = 'contactless',
  children,
  className,
}: BusinessQrFrameProps) {
  const box = size === 'lg' ? 'h-56 w-56' : size === 'sm' ? 'h-36 w-36' : 'h-44 w-44';
  return (
    <View className={cn('items-center rounded-card bg-surface p-3 shadow-sm', className)}>
      {label ? (
        <VemtapText
          variant="labelMd"
          className="mb-2 font-sans-semibold"
          numberOfLines={1}
        >
          {label}
        </VemtapText>
      ) : null}
      <View className="relative items-center justify-center rounded-field bg-surface p-2">
        <View
          accessibilityRole="image"
          accessibilityLabel={caption ?? label ?? 'QR code'}
          className={cn('rounded-lg border border-border bg-surface', box)}
        >
          <View className="flex-1 p-2">
            {['left', 'right'].map(side => (
              <View
                key={side}
                className={cn(
                  'absolute h-9 w-9 rounded-lg bg-primary',
                  side === 'left' ? 'left-2 top-2' : 'right-2 top-2',
                )}
              />
            ))}
            <View className="absolute bottom-2 left-2 h-9 w-9 rounded-lg bg-primary" />
          </View>
        </View>
        <View className="absolute h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-md">
          <Icon name={glyph} size={20} color={colors.surface} />
        </View>
      </View>
      {children}
      {caption ? (
        <View className="mt-2 flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full bg-primary" />
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            className="text-center"
          >
            {caption}
          </VemtapText>
        </View>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Line item                                                                  */
/* -------------------------------------------------------------------------- */

export interface BusinessLineItemProps {
  name: string;
  modifier?: string;
  price: string;
  quantity?: string;
  /** `thumb` renders a leading product image square. */
  imageUri?: string;
  imageAlt?: string;
  className?: string;
}

/** Qty · name · modifier · price — receipts, bills and ring-up lines. */
export function BusinessLineItem({
  name,
  modifier,
  price,
  quantity,
  imageUri,
  imageAlt,
  className,
}: BusinessLineItemProps) {
  return (
    <View className={cn('flex-row items-start justify-between gap-3', className)}>
      {imageUri ? (
        <View className="h-12 w-12 shrink-0 overflow-hidden rounded-field bg-surface-container">
          <BusinessProductImage
            source={{ uri: imageUri }}
            alt={imageAlt ?? name}
            className="h-full w-full"
          />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <View className="flex-row items-baseline gap-2">
          {quantity ? (
            <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold">
              {quantity}
            </VemtapText>
          ) : null}
          <VemtapText variant="labelMd" className="min-w-0 flex-1" numberOfLines={1}>
            {name}
          </VemtapText>
        </View>
        {modifier ? (
          <VemtapText
            variant="caption"
            tone="tertiary"
            className="mt-0.5"
            numberOfLines={1}
          >
            {modifier}
          </VemtapText>
        ) : null}
        {quantity ? null : null}
      </View>
      <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold">
        {price}
      </VemtapText>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Totals row                                                                 */
/* -------------------------------------------------------------------------- */

export interface BusinessTotalsRowProps {
  label: string;
  value: string;
  tone?: 'default' | 'discount' | 'strong' | 'primary';
  /** Optional trailing hint under the label (e.g. `to Sunday M.`). */
  hint?: string;
  badge?: string;
  className?: string;
}

const totalsRowClass: Record<NonNullable<BusinessTotalsRowProps['tone']>, string> = {
  default: 'text-text-secondary',
  discount: 'text-badge-discount-text',
  strong: 'text-text',
  primary: 'text-primary',
};

/** Label/value pair used by every bill, receipt and payment breakdown. */
export function BusinessTotalsRow({
  label,
  value,
  tone = 'default',
  hint,
  badge,
  className,
}: BusinessTotalsRowProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3', className)}>
      <View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-1.5">
        <VemtapText variant="bodyMd" className={totalsRowClass[tone]} numberOfLines={1}>
          {label}
        </VemtapText>
        {badge ? <BusinessStatusPill label={badge} tone="success" /> : null}
        {hint ? (
          <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
            {hint}
          </VemtapText>
        ) : null}
      </View>
      <VemtapText
        variant="bodyMd"
        className={cn(
          'shrink-0',
          tone === 'default' ? 'font-sans-medium' : 'font-sans-semibold',
        )}
        numberOfLines={1}
      >
        {value}
      </VemtapText>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Grand total row                                                            */
/* -------------------------------------------------------------------------- */

export interface BusinessGrandTotalRowProps {
  label: string;
  value: string;
  /** Renders the hairline divider above the row; default true. */
  divided?: boolean;
  className?: string;
}

/**
 * The emphasised bottom-of-bill row — label plus the hero figure. Shared by the
 * order total, split bill, tip, payment and receipt screens so the amount a
 * guest is asked for always wears the same token and weight.
 */
export function BusinessGrandTotalRow({
  label,
  value,
  divided = true,
  className,
}: BusinessGrandTotalRowProps) {
  return (
    <View
      className={cn(
        'mt-2 flex-row items-center justify-between gap-3',
        divided && 'border-t border-border pt-3',
        className,
      )}
    >
      <VemtapText
        variant="labelMd"
        className="min-w-0 flex-1 font-sans-semibold"
        numberOfLines={1}
      >
        {label}
      </VemtapText>
      <VemtapText
        variant="headingLg"
        className="shrink-0 font-sans-bold text-primary"
        numberOfLines={1}
      >
        {value}
      </VemtapText>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Rating stars                                                               */
/* -------------------------------------------------------------------------- */

export interface BusinessRatingStarsProps {
  /** Filled star count (fractional values render a partial tint). */
  rating: number;
  max?: number;
  size?: number;
  onRate?: (value: number) => void;
  accessibilityLabel?: string;
  className?: string;
}

/** Star row shared by reviews, the tip screen and the merchant score card. */
export function BusinessRatingStars({
  rating,
  max = 5,
  size = 18,
  onRate,
  accessibilityLabel,
  className,
}: BusinessRatingStarsProps) {
  return (
    <View
      accessibilityRole={onRate ? 'radiogroup' : 'image'}
      accessibilityLabel={accessibilityLabel ?? `${rating} out of ${max}`}
      className={cn('flex-row items-center gap-0.5', className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = rating >= index + 1;
        const star = (
          <Icon
            name="starFilled"
            size={size}
            color={filled ? colors.tertiaryContainer : colors.surfaceContainerHighest}
          />
        );
        if (!onRate) {
          return <View key={index}>{star}</View>;
        }
        return (
          <Pressable
            key={index}
            accessibilityRole="radio"
            accessibilityState={{ selected: filled }}
            accessibilityLabel={`${index + 1}`}
            hitSlop={6}
            onPress={() => onRate(index + 1)}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Initials avatar                                                            */
/* -------------------------------------------------------------------------- */

export interface BusinessInitialsAvatarProps {
  initials: string;
  tone?: 'brand' | 'success' | 'tertiary' | 'neutral' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  /** Optional role badge glyph pinned to the bottom-right. */
  badgeIcon?: IconName;
  className?: string;
}

/** Initials disc for diners, reviewers and staff without a portrait. */
export function BusinessInitialsAvatar({
  initials,
  tone = 'brand',
  size = 'md',
  badgeIcon,
  className,
}: BusinessInitialsAvatarProps) {
  // Thin wrapper over the shared Avatar so there is exactly one initials disc
  // in the app; `sm` is 36px here (POS rows are dense) versus the shared 32px.
  return (
    <Avatar
      initials={initials}
      tone={tone}
      size={size === 'sm' ? 'xs' : size}
      badgeIcon={badgeIcon}
      className={cn(size === 'sm' ? 'h-9 w-9' : undefined, className)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Option grid (tips, split modes, tier picks)                                */
/* -------------------------------------------------------------------------- */

export interface BusinessOptionCard {
  id: string;
  title: string;
  value: string;
  icon?: IconName;
  badge?: string;
  /** Secondary line under the title (e.g. a reach figure). */
  hint?: string;
  /** Tertiary line under the value (e.g. what the reach covers). */
  footnote?: string;
}

export interface BusinessOptionGridProps {
  options: readonly BusinessOptionCard[];
  value: string;
  onChange: (id: string) => void;
  columns?: 2 | 3;
  /**
   * `stack` stacks title/hint/value/footnote in a tall card and is the default.
   * `row` renders a compact single line for short preset lists.
   */
  layout?: 'stack' | 'row';
  accessibilityLabel?: string;
  className?: string;
}

/** Selectable option cards used for tip presets and split modes. */
export function BusinessOptionGrid({
  options,
  value,
  onChange,
  columns = 2,
  layout = 'stack',
  accessibilityLabel = 'Options',
  className,
}: BusinessOptionGridProps) {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {options.map(option => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${accessibilityLabel}: ${option.title}`}
            onPress={() => onChange(option.id)}
            className={cn(
              'flex-1 justify-between rounded-card p-3 active:scale-[0.98]',
              layout === 'row' ? 'min-h-[52px] min-w-[45%]' : 'min-h-[76px]',
              columns === 3 ? 'min-w-[30%]' : 'min-w-[45%]',
              selected ? 'bg-primary shadow-md' : 'bg-surface-container',
            )}
          >
            <View className="flex-row items-center justify-between gap-2">
              <VemtapText
                variant="labelMd"
                className={selected ? 'text-primary-foreground' : 'text-text-secondary'}
                numberOfLines={2}
              >
                {option.title}
              </VemtapText>
              {option.hint ? (
                <VemtapText
                  variant="micro"
                  className={cn(
                    'shrink-0 font-sans-semibold',
                    selected ? 'text-primary-foreground' : 'text-primary',
                  )}
                  numberOfLines={1}
                >
                  {option.hint}
                </VemtapText>
              ) : null}
              {option.icon ? (
                <Icon
                  name={option.icon}
                  size={17}
                  color={selected ? colors.surface : colors.textTertiary}
                />
              ) : null}
            </View>
            <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className={
                  selected
                    ? 'font-sans-bold text-primary-foreground'
                    : 'font-sans-semibold'
                }
                numberOfLines={1}
              >
                {option.value}
              </VemtapText>
              {option.badge ? (
                <View className="rounded-full bg-surface px-2 py-0.5">
                  <VemtapText variant="micro" className="font-sans-semibold text-primary">
                    {option.badge}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            {option.footnote ? (
              <VemtapText
                variant="micro"
                className={
                  selected ? 'mt-1 text-primary-foreground' : 'mt-1 text-text-tertiary'
                }
                numberOfLines={2}
              >
                {option.footnote}
              </VemtapText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Setting row                                                                */
/* -------------------------------------------------------------------------- */

export interface BusinessSettingRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: 'brand' | 'neutral';
  /** `value` renders a trailing value + chevron, `switch` a trailing switch. */
  trailing: 'value' | 'switch' | 'chevron' | 'pill' | 'arrow';
  value?: string;
  valueTone?: 'default' | 'brand' | 'success' | 'error';
  badge?: string;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}

const settingIconTone: Record<
  NonNullable<BusinessSettingRowProps['iconTone']>,
  string
> = {
  brand: 'bg-surface-tint text-primary',
  neutral: 'bg-surface-container-high text-text',
};

const settingValueTone: Record<
  NonNullable<BusinessSettingRowProps['valueTone']>,
  string
> = {
  default: 'text-text',
  brand: 'text-primary',
  success: 'text-badge-discount-text',
  error: 'text-error',
};

/**
 * Grouped settings row: icon well, title, subtitle and a trailing affordance
 * (value + chevron, switch, pill or arrow). One owner for the whole list.
 */
export function BusinessSettingRow({
  title,
  subtitle,
  icon,
  iconTone = 'brand',
  trailing,
  value,
  valueTone = 'default',
  badge,
  switchValue = false,
  onSwitchChange,
  onPress,
  accessibilityLabel,
  className,
}: BusinessSettingRowProps) {
  // A switch row is a single control: the container stays a plain View so the
  // switch itself is the only accessible node (no duplicated label or role).
  const rowClassName = cn(
    'flex-row items-center justify-between gap-3 px-4 py-3',
    trailing === 'switch' ? '' : 'active:bg-surface-container-low',
    className,
  );
  const Container = trailing === 'switch' ? View : Pressable;
  const containerProps =
    trailing === 'switch'
      ? {}
      : {
          accessibilityRole: 'button' as const,
          accessibilityLabel: accessibilityLabel ?? title,
          onPress,
        };

  return (
    <Container {...containerProps} className={rowClassName}>
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        {icon ? (
          <View
            className={cn(
              'h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              settingIconTone[iconTone],
            )}
          >
            <Icon
              name={icon}
              size={19}
              color={iconTone === 'brand' ? colors.primary : colors.text}
            />
          </View>
        ) : null}
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <VemtapText variant="labelMd" className="min-w-0 flex-1" numberOfLines={1}>
              {title}
            </VemtapText>
            {badge ? (
              <View className="rounded bg-surface-container px-1.5 py-0.5">
                <VemtapText
                  variant="micro"
                  className="font-sans-bold text-text-secondary"
                >
                  {badge}
                </VemtapText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5"
              numberOfLines={1}
            >
              {subtitle}
            </VemtapText>
          ) : null}
        </View>
      </View>

      {trailing === 'switch' ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: switchValue }}
          accessibilityLabel={accessibilityLabel ?? title}
          onPress={() => onSwitchChange?.(!switchValue)}
          className={cn(
            'h-6 w-11 shrink-0 flex-row items-center rounded-full px-0.5',
            switchValue ? 'bg-primary' : 'bg-surface-container-highest',
          )}
        >
          <View
            className={cn(
              'h-5 w-5 rounded-full bg-surface shadow-sm',
              switchValue ? 'ml-auto' : null,
            )}
          />
        </Pressable>
      ) : (
        <View className="shrink-0 flex-row items-center gap-1">
          {value ? (
            <VemtapText
              variant="labelMd"
              className={cn('max-w-[150px]', settingValueTone[valueTone])}
              numberOfLines={1}
            >
              {value}
            </VemtapText>
          ) : null}
          {trailing === 'pill' && value ? (
            <View className="rounded-full bg-surface-container px-2.5 py-1">
              <VemtapText variant="caption" tone="secondary">
                {value}
              </VemtapText>
            </View>
          ) : null}
          {trailing === 'chevron' || trailing === 'value' ? (
            <Icon name="forward" size={20} color={colors.outline} />
          ) : null}
          {trailing === 'arrow' ? (
            <Icon name="arrowForward" size={20} color={colors.error} />
          ) : null}
        </View>
      )}
    </Container>
  );
}

/* -------------------------------------------------------------------------- */
/* Grouped settings card                                                      */
/* -------------------------------------------------------------------------- */

export interface BusinessSettingsGroupProps {
  rows: BusinessSettingRowProps[];
  className?: string;
}

/** Divider-separated card that owns a run of `BusinessSettingRow`s. */
export function BusinessSettingsGroup({ rows, className }: BusinessSettingsGroupProps) {
  return (
    <View className={cn('overflow-hidden rounded-card bg-surface shadow-sm', className)}>
      {rows.map((row, index) => (
        <View key={row.title}>
          {index > 0 ? <View className="h-px bg-surface-container-low" /> : null}
          <BusinessSettingRow {...row} />
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Checklist / verification pillar                                           */
/* -------------------------------------------------------------------------- */

export interface BusinessPillarProps {
  title: string;
  /** Completed status line, e.g. `Biometric ID Verified`. */
  status: string;
  icon: IconName;
  /** Supporting detail lines (entity name, account number, address). */
  lines?: readonly string[];
  detail?: string;
  cta?: string;
  onCtaPress?: () => void;
  /** `done` shows a check, `pending` a hollow clock. */
  state?: 'done' | 'pending';
  className?: string;
}

/**
 * Verification pillar card: icon, title, completed status, supporting detail
 * lines and an optional inline CTA. Shared by trust/verification surfaces and
 * onboarding checklists so a completed checkpoint always looks the same.
 */
export function BusinessPillar({
  title,
  status,
  icon,
  lines = [],
  detail,
  cta,
  onCtaPress,
  state = 'done',
  className,
}: BusinessPillarProps) {
  return (
    <View className={cn('gap-2 rounded-field bg-surface-subtle p-3', className)}>
      <View className="flex-row items-start gap-2.5">
        <View className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
          <Icon name={icon} size={18} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <VemtapText variant="labelMd" className="font-sans-semibold" numberOfLines={2}>
            {title}
          </VemtapText>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Icon
              name={state === 'done' ? 'checkCircle' : 'hourglass'}
              size={15}
              color={state === 'done' ? colors.badgeDiscountText : colors.outline}
            />
            <VemtapText
              variant="caption"
              className={
                state === 'done'
                  ? 'min-w-0 flex-1 text-badge-discount-text'
                  : 'min-w-0 flex-1 text-text-tertiary'
              }
              numberOfLines={2}
            >
              {status}
            </VemtapText>
          </View>
        </View>
      </View>
      {lines.length ? (
        <View className="gap-0.5 pl-0.5">
          {lines.map(line => (
            <VemtapText key={line} variant="caption" tone="secondary" numberOfLines={2}>
              {line}
            </VemtapText>
          ))}
        </View>
      ) : null}
      {detail ? (
        <VemtapText
          variant="caption"
          tone="tertiary"
          className="leading-relaxed"
          numberOfLines={3}
        >
          {detail}
        </VemtapText>
      ) : null}
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
          <Icon name="openInNew" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Checklist line (settings-style switch row with value)                      */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Collapsible FAQ / knowledge-base row                                       */
/* -------------------------------------------------------------------------- */

export interface BusinessFaqRowProps {
  question: string;
  answer: string;
  /** Leading glyph for knowledge-base categories. */
  icon?: IconName;
  badge?: string;
  defaultOpen?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
}

/** Disclosure row used by Support & Help (FAQ and knowledge-base entries). */
export function BusinessFaqRow({
  question,
  answer,
  icon,
  badge,
  defaultOpen = false,
  onPress,
  accessibilityLabel,
  className,
}: BusinessFaqRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View className={cn('overflow-hidden rounded-card bg-surface shadow-sm', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={accessibilityLabel ?? question}
        onPress={() => {
          setOpen(value => !value);
          onPress?.();
        }}
        className="flex-row items-center justify-between gap-3 p-4 active:bg-surface-subtle"
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          {icon ? (
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint">
              <Icon name={icon} size={19} color={colors.primary} />
            </View>
          ) : null}
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <VemtapText
                variant="labelMd"
                className="min-w-0 font-sans-semibold"
                numberOfLines={2}
              >
                {question}
              </VemtapText>
              {badge ? <BusinessStatusPill label={badge} tone="brandContainer" /> : null}
            </View>
            {icon && !open ? (
              <VemtapText
                variant="caption"
                tone="secondary"
                className="mt-0.5"
                numberOfLines={1}
              >
                {answer}
              </VemtapText>
            ) : null}
          </View>
        </View>
        <View className="shrink-0">
          <Icon
            name="expandMore"
            size={20}
            color={colors.textTertiary}
            style={open ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </View>
      </Pressable>
      {open ? (
        <View className="border-t border-border bg-surface-subtle px-4 pb-4 pt-3">
          <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
            {answer}
          </VemtapText>
        </View>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Channel tile                                                               */
/* -------------------------------------------------------------------------- */

export interface BusinessChannelTileProps {
  label: string;
  hint: string;
  icon: IconName;
  tone?: 'success' | 'brand' | 'secondary';
  onPress?: () => void;
  className?: string;
}

const channelTone: Record<
  NonNullable<BusinessChannelTileProps['tone']>,
  { tile: string; hint: string }
> = {
  success: { tile: 'bg-badge-discount-bg', hint: 'text-badge-discount-text' },
  brand: { tile: 'bg-surface-tint', hint: 'text-primary' },
  secondary: { tile: 'bg-secondary-fixed', hint: 'text-text-secondary' },
};

/** Support channel grid entry (WhatsApp / call / email). */
export function BusinessChannelTile({
  label,
  hint,
  icon,
  tone = 'brand',
  onPress,
  className,
}: BusinessChannelTileProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${hint}`}
      onPress={onPress}
      className={cn(
        'min-w-0 flex-1 items-center gap-1 rounded-card bg-surface p-3 shadow-sm active:scale-95',
        className,
      )}
    >
      <View
        className={cn(
          'h-10 w-10 items-center justify-center rounded-full',
          channelTone[tone].tile,
        )}
      >
        <Icon
          name={icon}
          size={20}
          color={
            tone === 'success'
              ? colors.badgeDiscountText
              : tone === 'secondary'
                ? colors.secondary
                : colors.primary
          }
        />
      </View>
      <VemtapText
        variant="labelSm"
        className="mt-1.5 font-sans-semibold"
        numberOfLines={1}
      >
        {label}
      </VemtapText>
      <VemtapText variant="caption" className={channelTone[tone].hint} numberOfLines={1}>
        {hint}
      </VemtapText>
    </Pressable>
  );
}
