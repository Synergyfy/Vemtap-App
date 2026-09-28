import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { cn } from '@utils/cn';
import {
  ServiceFlowPage,
  ServiceSection,
} from '@features/business/components/ServiceFlowPrimitives';
import {
  serviceFlowDraft,
  serviceFlowImages,
} from '@features/business/data/serviceFlowData';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

export interface ServicePublishedStatusScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onAddAnother?: () => void;
  onCreateDeal?: () => void;
  onStatusChange?: (status: 'live' | 'draft') => void;
}

export function ServicePublishedStatusScreen({
  onBack,
  onNext,
  onSaveDraft,
  onAddAnother,
  onCreateDeal,
  onStatusChange,
}: ServicePublishedStatusScreenProps) {
  const [status, setStatus] = useState<'live' | 'draft'>('live');

  const selectStatus = (nextStatus: 'live' | 'draft') => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  return (
    <ServiceFlowPage
      title="Add Service   Step 5: Service Published Or Saved As Draft"
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      contentContainerClassName="w-full max-w-[640px] self-center gap-6 px-6 pb-10 pt-4"
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2 pt-2">
        <View className="flex-row items-center gap-2">
          <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
            Step 4 of 4
          </VemtapText>
          <View className="h-1.5 w-1.5 rounded-full bg-primary/40" />
          <VemtapText variant="caption" tone="secondary">
            Completion
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full bg-success-container px-2 py-1">
          <View className="h-2 w-2 rounded-full bg-success" />
          <VemtapText variant="caption" tone="success" className="font-sans-semibold">
            Live Online
          </VemtapText>
        </View>
      </View>

      <View className="items-center px-3 pt-1">
        <View className="relative mb-3 h-20 w-20 items-center justify-center rounded-full bg-surface-container-high shadow-sm">
          <View className="absolute inset-0 rounded-full bg-primary/10" />
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-md">
            <Icon name="verified" size={32} color={colors.surface} />
          </View>
          <View className="absolute -right-1 -top-1 h-7 w-7 items-center justify-center rounded-full bg-tertiary-container shadow-sm">
            <Icon name="autoAwesome" size={16} color={colors.surface} />
          </View>
        </View>
        <VemtapText
          accessibilityRole="header"
          variant="headingMd"
          className="text-center text-heading-md tracking-tight"
        >
          Service is Live on Storefront!
        </VemtapText>
        <VemtapText
          variant="bodyMd"
          tone="secondary"
          className="mt-1 max-w-[320px] text-center"
        >
          Clients within{' '}
          <VemtapText className="font-sans-semibold text-text">4.0 km</VemtapText> can now
          discover, schedule, and book appointments in real-time.
        </VemtapText>
      </View>

      <View
        accessibilityRole="tablist"
        className="flex-row gap-1 rounded-card-lg bg-surface-container-high p-1 shadow-inner"
      >
        {[
          { id: 'live' as const, label: 'Live on Storefront' },
          { id: 'draft' as const, label: 'Saved as Draft' },
        ].map(option => {
          const selected = status === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => selectStatus(option.id)}
              className={cn(
                'min-h-11 min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-2 py-2 active:scale-[0.98]',
                selected ? 'bg-surface shadow-sm' : null,
              )}
            >
              <View
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  selected
                    ? option.id === 'live'
                      ? 'bg-success'
                      : 'bg-tertiary'
                    : 'bg-text-tertiary',
                )}
              />
              <VemtapText
                variant="labelMd"
                className={cn(
                  'text-center',
                  selected ? 'font-sans-semibold text-text' : 'text-text-secondary',
                )}
              >
                {option.label}
              </VemtapText>
            </Pressable>
          );
        })}
      </View>

      <ServiceSection className="gap-3">
        <View className="flex-row items-start gap-3">
          <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
            <BusinessProductImage
              source={{ uri: serviceFlowImages.status.uri }}
              alt={serviceFlowImages.status.alt}
              className="h-full w-full"
              resizeMode="cover"
            />
            <View className="absolute bottom-1 right-1 rounded bg-inverse-surface/80 px-1.5 py-0.5">
              <VemtapText
                variant="micro"
                className="font-sans-medium text-inverse-on-surface"
              >
                {serviceFlowDraft.studioCount}
              </VemtapText>
            </View>
          </View>
          <View className="min-w-0 flex-1">
            <View className="mb-1 flex-row flex-wrap items-center justify-between gap-1">
              <View className="rounded-full bg-success-container px-2 py-0.5">
                <VemtapText
                  variant="caption"
                  tone="success"
                  className="font-sans-semibold"
                >
                  Active in Catalog
                </VemtapText>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {serviceFlowDraft.reference}
              </VemtapText>
            </View>
            <VemtapText
              variant="headingSm"
              className="truncate text-heading-sm text-text"
              numberOfLines={1}
            >
              {serviceFlowDraft.shortTitle}
            </VemtapText>
            <VemtapText
              variant="labelMd"
              tone="brand"
              className="mt-0.5 font-sans-semibold"
            >
              {serviceFlowDraft.priceRange}
            </VemtapText>
          </View>
        </View>
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 pt-1">
          <View className="flex-row items-center gap-1">
            <Icon name="schedule" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" tone="secondary">
              {serviceFlowDraft.durationRange}
            </VemtapText>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon name="storefront" size={16} color={colors.primary} />
            <VemtapText variant="labelSm" tone="secondary">
              {serviceFlowDraft.studios}
            </VemtapText>
          </View>
        </View>
      </ServiceSection>

      <View className="flex-row items-start gap-3 rounded-card-lg bg-surface-tint p-4">
        <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon name="activeNotifications" size={20} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
            Live Bookings Enabled
          </VemtapText>
          <VemtapText variant="caption" tone="secondary" className="leading-relaxed">
            Appointments appear instantly on your merchant calendar and dispatch WhatsApp
            alerts to your on-duty specialists. You can toggle this to Draft to
            temporarily pause new bookings.
          </VemtapText>
        </View>
      </View>

      <View className="overflow-hidden rounded-card-lg shadow-md">
        <LinearGradient
          colors={[colors.surface, colors.surfaceMuted, colors.surfaceContainerLow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="gap-4 p-4"
        >
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-tertiary-fixed px-2.5 py-1">
              <Icon name="fire" size={15} color={colors.tertiary} />
              <VemtapText variant="caption" className="font-sans-semibold text-tertiary">
                Growth Booster
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
              Instant One-Tap Import
            </VemtapText>
          </View>
          <View className="gap-1.5">
            <VemtapText variant="headingSm" className="text-heading-sm text-text">
              Fill Empty Slots with a VEMTAP Deal
            </VemtapText>
            <VemtapText variant="bodyMd" tone="secondary">
              Transform this Radiance Facial into a featured promotional voucher for slow
              hours or weekdays. Photos, duration tiers, and studio branches will pre-fill
              into Deal Studio automatically.
            </VemtapText>
          </View>
          <View className="flex-row items-start gap-2 rounded-lg bg-surface-container-high/60 p-2">
            <View className="h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-container">
              <Icon name="trendingUp" size={16} color={colors.badgeDiscountText} />
            </View>
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 font-sans-medium text-text"
            >
              Service deals get{' '}
              <VemtapText tone="brand" className="font-sans-bold">
                4.2x higher
              </VemtapText>{' '}
              first-time appointment bookings on the Hyperlocal Map.
            </VemtapText>
          </View>
          <Button
            label="Make as a Deal 🔥"
            labelVariant="labelMd"
            labelNumberOfLines={2}
            rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
            onPress={onCreateDeal}
          />
        </LinearGradient>
      </View>

      <View className="gap-3 pt-2">
        <Button
          label="View in Services Catalog"
          labelVariant="labelMd"
          variant="secondary"
          className="border-0 bg-surface-container-high"
          leftIcon={<Icon name="catalog" size={20} color={colors.secondary} />}
          onPress={onNext}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onAddAnother}
          className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-field px-3 active:opacity-75"
        >
          <Icon name="plus" size={18} color={colors.primary} />
          <VemtapText
            variant="labelMd"
            tone="brand"
            className="text-center font-sans-semibold"
          >
            Add Another Product or Service
          </VemtapText>
        </Pressable>
      </View>
    </ServiceFlowPage>
  );
}
