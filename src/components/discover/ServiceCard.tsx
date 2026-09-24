import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { strings } from '@constants/strings';
import { cn } from '@utils/cn';
import {
  formatGlowNaira,
  type GlowProfileService,
  type GlowService,
} from '@features/discover/data/glowSerenityData';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface ServiceCardProps {
  service: GlowService | GlowProfileService;
  variant?: 'compact' | 'catalogue';
  expanded?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onAction?: () => void;
}

function isProfileService(
  service: GlowService | GlowProfileService,
): service is GlowProfileService {
  return 'shortDescription' in service;
}

export function ServiceCard({
  service,
  variant = 'catalogue',
  expanded = false,
  selected = false,
  onPress,
  onAction,
}: ServiceCardProps) {
  const compact = variant === 'compact';
  const description = isProfileService(service)
    ? service.shortDescription
    : service.description;
  const duration = isProfileService(service)
    ? service.duration
    : strings.glowServices.itemsDuration(service.duration);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      className={cn(
        compact
          ? 'w-44 shrink-0 border border-border bg-surface-subtle p-2 shadow-md'
          : 'w-full flex-row gap-3 border border-border bg-surface-canvas p-3 shadow-md',
        selected && 'border border-primary bg-surface-tint',
        compact ? 'rounded-2xl' : 'rounded-2xl',
      )}
    >
      <View
        className={cn(
          'relative overflow-hidden rounded-xl bg-surface-container',
          compact ? 'h-28 w-full' : 'h-24 w-24 shrink-0 self-start',
        )}
      >
        <Image
          source={{ uri: service.imageUri }}
          accessibilityLabel={service.imageAlt}
          className="h-full w-full"
          resizeMode="cover"
        />
        {compact ? (
          <View className="absolute bottom-1.5 left-1.5 rounded bg-surface-dark/70 px-1.5 py-0.5">
            <VemtapText variant="caption" tone="inverse">
              {duration}
            </VemtapText>
          </View>
        ) : null}
        {'discount' in service && service.discount ? (
          <View className="absolute left-1.5 top-1.5 rounded-md bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText className="font-sans-bold text-caption text-badge-discount-text">
              {service.discount}
            </VemtapText>
          </View>
        ) : null}
      </View>
      <View className={cn(compact ? 'gap-1 pt-2' : 'min-w-0 flex-1')}>
        <View className="flex-row flex-wrap items-center gap-1.5">
          {!compact ? (
            <View className="flex-row items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5">
              <Icon name="schedule" size={13} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary">
                {duration}
              </VemtapText>
            </View>
          ) : null}
          {!compact && 'badge' in service && service.badge ? (
            <View className="rounded bg-surface-tint px-1.5 py-0.5">
              <VemtapText className="font-sans-medium text-caption text-primary">
                {service.badge}
              </VemtapText>
            </View>
          ) : null}
        </View>
        <VemtapText
          variant="labelMd"
          className={cn('mt-1 font-sans-semibold text-text', compact && 'truncate')}
          numberOfLines={compact ? 1 : undefined}
        >
          {service.name}
        </VemtapText>
        <VemtapText
          variant="caption"
          tone="secondary"
          className={cn(!compact && !expanded && 'line-clamp-2')}
          numberOfLines={!compact && !expanded ? 2 : undefined}
        >
          {description}
        </VemtapText>
        <View
          className={cn(
            'flex-row items-center justify-between gap-2',
            compact ? 'mt-1' : 'mt-2',
          )}
        >
          <View className="min-w-0 flex-row items-baseline gap-1.5">
            <VemtapText variant="labelMd" className="font-sans-bold text-text">
              {formatGlowNaira(service.price)}
            </VemtapText>
            {'originalPrice' in service && service.originalPrice ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {formatGlowNaira(service.originalPrice)}
              </VemtapText>
            ) : null}
          </View>
          {onAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                selected ? strings.glowServices.added : strings.glowServices.select
              }
              accessibilityState={{ selected }}
              onPress={onAction}
              className={cn(
                'h-8 shrink-0 flex-row items-center gap-1 rounded-lg px-3',
                selected ? 'bg-primary' : 'bg-surface-subtle',
              )}
            >
              <Icon
                name={selected ? 'check' : 'plus'}
                size={16}
                color={selected ? colors.surface : colors.primary}
              />
              <VemtapText
                variant="labelSm"
                className={selected ? 'text-primary-foreground' : 'text-primary'}
              >
                {selected ? strings.glowServices.added : strings.glowServices.select}
              </VemtapText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
