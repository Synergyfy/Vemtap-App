import React, { type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { AppModal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import type { TypeDensity } from '@theme/typography';
import { cn } from '@utils/cn';
import { StatusPill, type PillTone } from './BusinessSetupPrimitives';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

export interface VerificationPageProps {
  title?: string;
  onBack?: () => void;
  onHelp?: () => void;
  helpLabel?: string;
  progress?: { activeIndex: number; total: number };
  showHeader?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  contentContainerClassName?: string;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  background?: 'page' | 'surface';
  density?: TypeDensity;
}

/** Single owner of the verification / trial screen chrome: header, scroll body, action deck. */
export function VerificationPage({
  title,
  onBack,
  onHelp,
  helpLabel,
  progress,
  showHeader = true,
  footer,
  children,
  contentContainerClassName,
  keyboardShouldPersistTaps = 'handled',
  background = 'page',
  density = 'compact',
}: VerificationPageProps) {
  const insets = useSafeAreaInsets();
  return (
    <TypeDensityProvider density={density}>
      <SafeAreaView
        edges={['top', 'bottom']}
        className={cn(
          'flex-1',
          background === 'surface' ? 'bg-surface' : 'bg-background',
        )}
      >
        {showHeader && title ? (
          <RegistrationHeader
            title={title}
            onBack={onBack ?? (() => undefined)}
            helpLabel={helpLabel}
            onHelp={onHelp}
            titleAlign={helpLabel ? 'start' : 'center'}
            progress={progress}
          />
        ) : null}
        <ScrollView
          className="w-full max-w-screen flex-1 self-center"
          contentContainerClassName={cn(
            'w-full gap-5 px-6 pb-6 pt-4',
            contentContainerClassName,
          )}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer ? (
          <View
            className="w-full border-t border-border/40 bg-surface px-6 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="mx-auto w-full max-w-screen gap-2">{footer}</View>
          </View>
        ) : null}
      </SafeAreaView>
    </TypeDensityProvider>
  );
}

export type SealTone = 'brand' | 'success' | 'tertiary';

const sealHaloClass: Record<SealTone, string> = {
  brand: 'bg-primary-fixed',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
};

const sealRingClass: Record<SealTone, string> = {
  brand: 'bg-surface-tint-blue',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
};

const sealCoreClass: Record<SealTone, string> = {
  brand: 'bg-primary',
  success: 'bg-badge-discount-text',
  tertiary: 'bg-tertiary',
};

export type SealBadgeSurface = 'surface' | 'success' | 'tertiary' | 'primary';
export type SealBadgeTone = 'success' | 'tertiary' | 'inverse';

const sealBadgeSurfaceClass: Record<SealBadgeSurface, string> = {
  surface: 'bg-surface',
  success: 'bg-badge-discount-bg',
  tertiary: 'bg-tertiary-fixed',
  primary: 'bg-primary',
};

const sealBadgeColor: Record<SealBadgeTone, string> = {
  success: colors.badgeDiscountText,
  tertiary: colors.tertiary,
  inverse: colors.surface,
};

const sealOuterSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-20 w-20',
  md: 'h-24 w-24',
  lg: 'h-28 w-28',
};

const sealCoreSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
};

const sealIconSize: Record<'sm' | 'md' | 'lg', number> = {
  sm: 28,
  md: 34,
  lg: 42,
};

export interface VerificationSealProps {
  icon: IconName;
  accessibilityLabel: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: SealTone;
  badgeIcon?: IconName;
  badgeSurface?: SealBadgeSurface;
  badgeTone?: SealBadgeTone;
  className?: string;
}

/** Circular trust emblem shared by every verification and trial outcome hero. */
export function VerificationSeal({
  icon,
  accessibilityLabel,
  size = 'md',
  tone = 'brand',
  badgeIcon,
  badgeSurface = 'surface',
  badgeTone = 'success',
  className,
}: VerificationSealProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      className={cn('relative items-center justify-center', className)}
    >
      <View
        className={cn('absolute h-28 w-28 rounded-full opacity-30', sealHaloClass[tone])}
      />
      <View
        className={cn(
          'relative items-center justify-center rounded-full shadow-md',
          sealOuterSize[size],
          sealRingClass[tone],
        )}
      >
        <View
          className={cn(
            'items-center justify-center rounded-full',
            sealCoreSize[size],
            sealCoreClass[tone],
          )}
        >
          <Icon name={icon} size={sealIconSize[size]} color={colors.surface} />
        </View>
      </View>
      {badgeIcon ? (
        <View
          className={cn(
            'absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full shadow-sm',
            sealBadgeSurfaceClass[badgeSurface],
          )}
        >
          <Icon name={badgeIcon} size={16} color={sealBadgeColor[badgeTone]} />
        </View>
      ) : null}
    </View>
  );
}

export type StageState = 'done' | 'active' | 'pending';

export interface VerificationStage {
  label: string;
  state: StageState;
}

export interface VerificationStageRailProps {
  stages: VerificationStage[];
  accessibilityLabel: string;
  className?: string;
}

/** Setup → Verification → Activation pill tracker from the verification entry screen. */
export function VerificationStageRail({
  stages,
  accessibilityLabel,
  className,
}: VerificationStageRailProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'w-full flex-row flex-wrap items-center justify-center gap-1',
        className,
      )}
    >
      {stages.map((stage, index) => (
        <View key={stage.label} className="flex-row items-center gap-1">
          <View
            className={cn(
              'flex-row items-center gap-1.5 rounded-full py-1',
              stage.state === 'active' ? 'bg-surface-tint-blue px-3 shadow-sm' : 'px-2',
            )}
          >
            {stage.state === 'done' ? (
              <Icon name="checkCircle" size={15} color={colors.badgeDiscountText} />
            ) : (
              <View
                className={cn(
                  'rounded-full',
                  stage.state === 'active'
                    ? 'h-2 w-2 bg-primary'
                    : 'h-1.5 w-1.5 bg-border',
                )}
              />
            )}
            <VemtapText
              variant="labelSm"
              className={cn(
                stage.state === 'active'
                  ? 'font-sans-semibold text-primary'
                  : stage.state === 'pending'
                    ? 'text-text-tertiary'
                    : 'text-text-secondary',
              )}
            >
              {stage.label}
            </VemtapText>
          </View>
          {index < stages.length - 1 ? (
            <View
              className={cn(
                'h-[2px] w-3 rounded-full',
                stage.state === 'done' ? 'bg-primary/30' : 'bg-border',
              )}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export interface SelectableRadioCardProps {
  title: string;
  selected: boolean;
  onPress: () => void;
  body?: string;
  icon?: IconName;
  badge?: string;
  badgeIcon?: IconName;
  badgeTone?: PillTone;
  caption?: string;
  footnote?: string;
  footnoteHighlight?: string;
  footnoteTail?: string;
  footnoteIcon?: IconName;
  footnoteTone?: 'brand' | 'success';
  layout?: 'stacked' | 'inline' | 'grid';
  /** Compact the card copy (title/body) for dense auth-style screens. */
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <View
      className={cn(
        'h-6 w-6 shrink-0 items-center justify-center rounded-full',
        selected ? 'bg-primary' : 'bg-surface-container-high',
      )}
    >
      {selected ? <Icon name="check" size={16} color={colors.surface} /> : null}
    </View>
  );
}

/** Radio option card: ID pickers, CAC entity chips, registration and payment choices. */
export function SelectableRadioCard({
  title,
  selected,
  onPress,
  body,
  icon,
  badge,
  badgeIcon,
  badgeTone = 'brand',
  caption,
  footnote,
  footnoteHighlight,
  footnoteTail,
  footnoteIcon = 'autoAwesome',
  footnoteTone = 'brand',
  layout = 'inline',
  compact = false,
  disabled = false,
  className,
}: SelectableRadioCardProps) {
  const surfaceClass =
    layout === 'grid'
      ? selected
        ? 'bg-surface-container-high shadow-sm'
        : 'bg-surface-container-low'
      : layout === 'inline'
        ? selected
          ? 'bg-surface-container-low'
          : 'bg-surface shadow-sm'
        : selected
          ? 'bg-surface-tint-blue shadow-md'
          : 'bg-surface shadow-sm';

  const titleBlock = (
    <View className="min-w-0 flex-1">
      <View className="flex-row flex-wrap items-center gap-1.5">
        <VemtapText
          variant={compact ? 'labelMd' : 'headingSm'}
          numberOfLines={2}
          className={cn('min-w-0', compact ? 'font-sans-semibold' : 'text-heading-sm')}
        >
          {title}
        </VemtapText>
        {badge ? <StatusPill label={badge} tone={badgeTone} icon={badgeIcon} /> : null}
      </View>
      {body ? (
        <VemtapText
          variant={compact ? 'labelSm' : 'bodyMd'}
          tone="secondary"
          className="mt-0.5 leading-snug"
        >
          {body}
        </VemtapText>
      ) : null}
      {caption ? (
        <VemtapText variant="caption" tone="tertiary" className="mt-0.5">
          {caption}
        </VemtapText>
      ) : null}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'rounded-card',
        layout === 'grid' ? 'items-center gap-0.5 p-2.5' : 'p-4',
        surfaceClass,
        disabled && 'opacity-60',
        className,
      )}
    >
      {layout === 'stacked' ? (
        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            {badge ? (
              <StatusPill
                label={badge}
                tone={selected ? 'success' : 'neutral'}
                icon={badgeIcon}
              />
            ) : (
              <View />
            )}
            <RadioIndicator selected={selected} />
          </View>
          <View className="flex-row items-start gap-3">
            {icon ? (
              <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
                <Icon name={icon} size={22} color={colors.primary} />
              </View>
            ) : null}
            {titleBlock}
          </View>
          {footnote ? (
            <View className="flex-row items-center gap-1.5 rounded-lg bg-surface-subtle p-2">
              <Icon
                name={footnoteIcon}
                size={16}
                color={
                  footnoteTone === 'success' ? colors.badgeDiscountText : colors.primary
                }
              />
              <VemtapText variant="caption" className="min-w-0 flex-1 text-text">
                {footnote}
                {footnoteHighlight ? (
                  <VemtapText className="font-sans-semibold text-primary">
                    {footnoteHighlight}
                  </VemtapText>
                ) : null}
                {footnoteTail}
              </VemtapText>
            </View>
          ) : null}
        </View>
      ) : null}

      {layout === 'inline' ? (
        <View className="flex-row items-start gap-3">
          {icon ? (
            <View
              className={cn(
                'h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                selected ? 'bg-primary shadow-sm' : 'bg-surface-container',
              )}
            >
              <Icon
                name={icon}
                size={24}
                color={selected ? colors.surface : colors.textSecondary}
              />
            </View>
          ) : null}
          {titleBlock}
          <View className="shrink-0 pt-1">
            <RadioIndicator selected={selected} />
          </View>
        </View>
      ) : null}

      {layout === 'grid' ? (
        <>
          {icon ? (
            <Icon
              name={icon}
              size={18}
              color={selected ? colors.primary : colors.textSecondary}
            />
          ) : null}
          <VemtapText
            variant="labelSm"
            className={cn(
              'text-center',
              selected ? 'font-sans-semibold text-primary' : 'text-text-secondary',
            )}
          >
            {title}
          </VemtapText>
          {caption ? (
            <VemtapText variant="caption" tone="tertiary" className="text-center">
              {caption}
            </VemtapText>
          ) : null}
        </>
      ) : null}
    </Pressable>
  );
}

export interface DisclosureSectionProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
  className?: string;
}

/** Collapsible "full breakdown" disclosure shared by the plan screens. */
export function DisclosureSection({
  label,
  expanded,
  onToggle,
  children,
  accessibilityLabel,
  className,
}: DisclosureSectionProps) {
  return (
    <View className={cn('gap-3', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onToggle}
        className="min-h-[48px] w-full flex-row items-center justify-between gap-2 rounded-card bg-surface px-3 py-2.5 active:bg-surface-subtle"
      >
        <VemtapText variant="labelMd" className="min-w-0 flex-1">
          {label}
        </VemtapText>
        <Icon name="expandMore" size={20} color={colors.primary} />
      </Pressable>
      {expanded ? <View className="gap-3.5">{children}</View> : null}
    </View>
  );
}

export type TimelineMarkerTone = 'success' | 'brand' | 'muted';

const timelineMarkerClass: Record<TimelineMarkerTone, string> = {
  success: 'bg-badge-discount-bg',
  brand: 'bg-surface-container',
  muted: 'bg-surface-container-high',
};

export interface VerificationTimelineRowProps {
  title: string;
  state?: StageState;
  meta?: string;
  body?: string;
  markerIcon?: IconName;
  markerTone?: TimelineMarkerTone;
  trailingIcon?: IconName | null;
  showConnector?: boolean;
  highlightActive?: boolean;
  className?: string;
}

/** Vertical timeline / checklist row with done, active and pending markers. */
export function VerificationTimelineRow({
  title,
  state = 'done',
  meta,
  body,
  markerIcon,
  markerTone,
  trailingIcon,
  showConnector = false,
  highlightActive = false,
  className,
}: VerificationTimelineRowProps) {
  const resolvedTone: TimelineMarkerTone =
    markerTone ?? (state === 'done' ? 'success' : state === 'active' ? 'brand' : 'muted');
  return (
    <View
      className={cn(
        'relative flex-row items-start gap-3',
        highlightActive && state === 'active' && 'rounded-lg bg-surface-tint-blue/70 p-2',
        className,
      )}
    >
      {showConnector ? (
        <View className="absolute bottom-[-16px] left-3 top-7 w-[2px] bg-secondary-container" />
      ) : null}
      <View
        className={cn(
          'h-6 w-6 shrink-0 items-center justify-center rounded-full',
          timelineMarkerClass[resolvedTone],
          state === 'active' && 'bg-primary',
        )}
      >
        {markerIcon ? (
          <Icon
            name={markerIcon}
            size={14}
            color={
              resolvedTone === 'success'
                ? colors.badgeDiscountText
                : resolvedTone === 'brand'
                  ? colors.primary
                  : colors.textSecondary
            }
          />
        ) : state === 'pending' ? (
          <View className="h-2.5 w-2.5 rounded-full bg-outline-variant" />
        ) : state === 'active' ? (
          <View className="h-2.5 w-2.5 rounded-full bg-surface" />
        ) : null}
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center justify-between gap-1.5">
          <VemtapText
            variant="labelMd"
            className={cn(
              'min-w-0',
              state === 'active' && 'font-sans-semibold text-primary',
            )}
          >
            {title}
          </VemtapText>
          {meta ? (
            <VemtapText
              variant="caption"
              className={cn(
                'shrink-0',
                state === 'done' && 'text-badge-discount-text',
                state === 'active' && 'text-primary',
                state === 'pending' && 'text-text-secondary',
              )}
            >
              {meta}
            </VemtapText>
          ) : null}
        </View>
        {body ? (
          <VemtapText
            variant="caption"
            tone={state === 'pending' ? 'tertiary' : 'secondary'}
            className="mt-0.5 leading-snug"
          >
            {body}
          </VemtapText>
        ) : null}
      </View>
      {trailingIcon ? (
        <View className="shrink-0">
          <Icon
            name={trailingIcon}
            size={18}
            color={state === 'pending' ? colors.textTertiary : colors.badgeDiscountText}
          />
        </View>
      ) : null}
    </View>
  );
}

export interface VerificationPillarLine {
  highlight?: string;
  text: string;
  suffix?: string;
  tone?: 'secondary' | 'tertiary';
}

export interface VerificationPillarRowProps {
  icon: IconName;
  title: string;
  body?: string;
  lines?: readonly VerificationPillarLine[];
  statusLabel?: string;
  statusTone?: PillTone;
  statusIcon?: IconName;
  meta?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  layout?: 'stacked' | 'footer';
  surface?: 'plain' | 'subtle';
  tileSize?: 'sm' | 'md';
  tileTone?: 'container' | 'tint';
  className?: string;
}

/** Icon tile + title + trailing status row used for credentials and trust pillars. */
export function VerificationPillarRow({
  icon,
  title,
  body,
  lines,
  statusLabel,
  statusTone = 'success',
  statusIcon = 'checkCircle',
  meta,
  actionLabel,
  onAction,
  layout = 'stacked',
  surface = 'plain',
  tileSize = 'sm',
  tileTone = 'container',
  className,
}: VerificationPillarRowProps) {
  return (
    <View
      className={cn(
        'gap-3',
        surface === 'subtle' && 'rounded-lg bg-surface-subtle p-2',
        className,
      )}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={cn(
            'shrink-0 items-center justify-center',
            tileSize === 'md' ? 'h-10 w-10 rounded-lg' : 'h-9 w-9 rounded-full',
            surface === 'subtle' || tileTone === 'tint'
              ? 'bg-surface-tint-blue'
              : 'bg-surface-container',
          )}
        >
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center justify-between gap-1.5">
            <VemtapText variant="labelMd" className="min-w-0 font-sans-semibold">
              {title}
            </VemtapText>
            {statusLabel ? (
              <StatusPill label={statusLabel} tone={statusTone} icon={statusIcon} />
            ) : null}
          </View>
          {body ? (
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-0.5 leading-snug"
            >
              {body}
            </VemtapText>
          ) : null}
          {lines?.map(line => (
            <VemtapText
              key={`${line.highlight ?? ''}-${line.text}`}
              variant="caption"
              tone={line.tone === 'tertiary' ? 'tertiary' : 'secondary'}
              className="mt-1 leading-snug"
            >
              {line.highlight ? (
                <VemtapText className="font-sans-medium text-text">
                  {line.highlight}
                </VemtapText>
              ) : null}
              {line.text}
              {line.suffix ? (
                <VemtapText tone="tertiary">{line.suffix}</VemtapText>
              ) : null}
            </VemtapText>
          ))}
          {layout === 'stacked' && actionLabel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              onPress={onAction}
              className="min-h-9 flex-row items-center gap-1 self-start active:opacity-70"
            >
              <VemtapText variant="labelSm" className="text-primary">
                {actionLabel}
              </VemtapText>
              <Icon name="openInNew" size={15} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {layout === 'footer' ? (
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <VemtapText variant="caption" tone="tertiary" className="min-w-0 flex-1">
            {meta}
          </VemtapText>
          {actionLabel ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              onPress={onAction}
              className="min-h-9 flex-row items-center gap-0.5 active:opacity-70"
            >
              <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                {actionLabel}
              </VemtapText>
              <Icon name="forward" size={16} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export interface VerificationSummaryRowProps {
  label: string;
  value?: string;
  valueTone?: 'default' | 'brand' | 'success' | 'tertiary';
  valueVariant?: 'labelMd' | 'button' | 'caption' | 'headingMd';
  labelTrailing?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

/** Label-left / value-right pair used by every verification and billing summary card. */
export function VerificationSummaryRow({
  label,
  value,
  valueTone = 'default',
  valueVariant = 'labelMd',
  labelTrailing,
  trailing,
  className,
}: VerificationSummaryRowProps) {
  return (
    <View
      className={cn('flex-row flex-wrap items-center justify-between gap-2', className)}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
        <VemtapText variant="labelMd" tone="secondary" className="min-w-0">
          {label}
        </VemtapText>
        {labelTrailing}
      </View>
      {value ? (
        <View className="shrink-0 flex-row items-center gap-1.5">
          {trailing}
          <VemtapText
            variant={valueVariant}
            tone={valueTone}
            className="max-w-[60%] text-right"
            numberOfLines={2}
          >
            {value}
          </VemtapText>
        </View>
      ) : (
        <View className="shrink-0 flex-row items-center gap-1.5">{trailing}</View>
      )}
    </View>
  );
}

export interface UploadChipProps {
  fileName: string;
  onRemove: () => void;
  removeLabel: string;
  icon?: IconName;
  tone?: 'subtle' | 'success';
  className?: string;
}

/** Attachment chip for an uploaded verification document, with a remove control. */
export function UploadChip({
  fileName,
  onRemove,
  removeLabel,
  icon = 'fileDocument',
  tone = 'subtle',
  className,
}: UploadChipProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between gap-2 rounded-lg px-3 py-2.5',
        tone === 'success' ? 'bg-badge-discount-bg' : 'bg-surface-container',
        className,
      )}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Icon
          name={icon}
          size={18}
          color={tone === 'success' ? colors.badgeDiscountText : colors.primary}
        />
        <VemtapText
          variant="caption"
          className="min-w-0 flex-1 font-sans-medium text-text"
          numberOfLines={1}
        >
          {fileName}
        </VemtapText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={removeLabel}
        hitSlop={8}
        onPress={onRemove}
        className="h-8 w-8 shrink-0 items-center justify-center rounded-full active:bg-surface-container-high"
      >
        <Icon name="close" size={16} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

export type PlanFeatureState = 'included' | 'highlighted' | 'locked';

export interface PlanFeatureRowProps {
  label: string;
  meta?: string | null;
  badge?: string;
  state?: PlanFeatureState;
  icon?: IconName;
  size?: 'sm' | 'md';
  className?: string;
}

/** One line of a plan / feature comparison list. */
export function PlanFeatureRow({
  label,
  meta,
  badge,
  state = 'included',
  icon,
  size = 'md',
  className,
}: PlanFeatureRowProps) {
  return (
    <View className={cn('flex-row items-start gap-2.5', className)}>
      <View
        className={cn(
          'mt-0.5 shrink-0 items-center justify-center rounded-full',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          state === 'included' && 'bg-surface-tint-blue',
          state === 'highlighted' && 'bg-badge-discount-bg',
          state === 'locked' && 'bg-surface-container-high',
        )}
      >
        <Icon
          name={icon ?? (state === 'locked' ? 'lock' : 'check')}
          size={size === 'sm' ? 12 : 14}
          color={
            state === 'included'
              ? colors.primary
              : state === 'highlighted'
                ? colors.badgeDiscountText
                : colors.textTertiary
          }
        />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <VemtapText
            variant={size === 'sm' ? 'labelSm' : 'bodyMd'}
            tone={state === 'locked' ? 'tertiary' : 'default'}
            className="min-w-0 flex-1"
          >
            {label}
          </VemtapText>
          {badge ? (
            <View className="rounded bg-surface-tint-blue px-1.5 py-0.5">
              <VemtapText variant="caption" className="font-sans-semibold text-primary">
                {badge}
              </VemtapText>
            </View>
          ) : null}
        </View>
        {meta ? (
          <VemtapText variant="caption" tone="secondary" className="leading-snug">
            {meta}
          </VemtapText>
        ) : null}
      </View>
    </View>
  );
}

export interface DaysRemainingTileProps {
  label: string;
  days: number | string;
  unit: string;
  icon: IconName;
  tone?: 'brand' | 'warning';
  progress?: number;
  progressLeft?: string;
  progressRight?: string;
  footerLeft?: string;
  footerRight?: string;
  className?: string;
}

/** Countdown tile for the trial-active and trial-ending surfaces. */
export function DaysRemainingTile({
  label,
  days,
  unit,
  icon,
  tone = 'brand',
  progress,
  progressLeft,
  progressRight,
  footerLeft,
  footerRight,
  className,
}: DaysRemainingTileProps) {
  return (
    <View
      className={cn(
        'gap-4 rounded-card-lg p-5 shadow-sm',
        tone === 'warning' ? 'bg-tertiary-fixed' : 'bg-surface-subtle',
        className,
      )}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <VemtapText
            variant="caption"
            tone={tone === 'warning' ? 'default' : 'tertiary'}
            className="uppercase tracking-wider"
          >
            {label}
          </VemtapText>
          <View className="mt-0.5 flex-row flex-wrap items-baseline gap-1">
            <VemtapText
              variant="displayMobile"
              className={cn('text-heading-xl', tone === 'warning' ? '' : 'text-primary')}
            >
              {String(days)}
            </VemtapText>
            <VemtapText variant="headingSm" className="min-w-0 font-sans-semibold">
              {unit}
            </VemtapText>
          </View>
        </View>
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-tint-blue">
          <Icon name={icon} size={24} color={colors.primary} />
        </View>
      </View>
      {typeof progress === 'number' ? (
        <View className="gap-1.5">
          <View className="h-3 w-full overflow-hidden rounded-full bg-surface-container p-0.5">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {progressLeft}
            </VemtapText>
            <VemtapText variant="caption" className="shrink-0 font-sans-medium">
              {progressRight}
            </VemtapText>
          </View>
        </View>
      ) : null}
      {footerLeft || footerRight ? (
        <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-card bg-surface/60 px-3 py-2">
          <View className="min-w-0 flex-row items-center gap-1.5">
            <Icon name="calendar" size={16} color={colors.textTertiary} />
            <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
              {footerLeft}
            </VemtapText>
          </View>
          <VemtapText variant="caption" tone="tertiary">
            •
          </VemtapText>
          <View className="min-w-0 flex-row items-center gap-1.5">
            <Icon name="eventAvailable" size={16} color={colors.textTertiary} />
            <VemtapText variant="caption" className="min-w-0 flex-1 font-sans-medium">
              {footerRight}
            </VemtapText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export interface VerificationTileGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

/** Wrapping grid that keeps verification tiles side by side down to 320pt screens. */
export function VerificationTileGrid({
  children,
  columns = 2,
  className,
}: VerificationTileGridProps) {
  return (
    <View className={cn('-mx-1 flex-row flex-wrap', className)}>
      {React.Children.map(children, child => (
        <View
          key={React.isValidElement(child) ? child.key : undefined}
          className={cn('px-1 pb-2', columns === 3 ? 'w-1/3' : 'w-1/2')}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

export interface ProcessingOverlayProps {
  visible: boolean;
  title: string;
  body: string;
  icon?: IconName;
  onCancel?: () => void;
  cancelLabel?: string;
}

/** Blocking gateway-processing overlay rendered inside the shared modal shell. */
export function ProcessingOverlay({
  visible,
  title,
  body,
  icon = 'creditCard',
  onCancel,
  cancelLabel,
}: ProcessingOverlayProps) {
  return (
    <AppModal visible={visible} onClose={onCancel ?? (() => undefined)}>
      <View className="items-center gap-3 py-2">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-badge-discount-bg">
          <Icon name={icon} size={26} color={colors.badgeDiscountText} />
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingXl"
          className="text-center text-heading-xl"
        >
          {title}
        </VemtapText>
        <VemtapText variant="bodyMd" tone="secondary" className="text-center">
          {body}
        </VemtapText>
        {onCancel && cancelLabel ? (
          <Button
            label={cancelLabel}
            labelVariant="labelMd"
            variant="ghost"
            className="mt-1 w-full border-0"
            labelClassName="text-text-secondary"
            onPress={onCancel}
          />
        ) : null}
      </View>
    </AppModal>
  );
}
