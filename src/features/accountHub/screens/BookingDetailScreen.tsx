import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AccountHeader,
  ActionGrid,
  PageScroll,
} from '@features/accountHub/components/AccountScreensPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

const copy = strings.accountScreens.bookingDetail;

export interface BookingDetailScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onAddCalendar?: () => void;
  onCopy?: (value: string) => void;
  onOpenMaps?: () => void;
  onChat?: () => void;
  onCall?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

export function BookingDetailScreen({
  onBack,
  onShare,
  onMore,
  onAddCalendar,
  onCopy,
  onOpenMaps,
  onChat,
  onCall,
  onReschedule,
  onCancel,
}: BookingDetailScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <AccountHeader
        title={copy.title}
        onBack={onBack}
        onAction={onShare ?? onMore}
        actionIcon="share"
      />
      <PageScroll>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row items-center justify-between gap-2">
            <View className="rounded-full bg-badge-discount-bg px-3 py-1">
              <VemtapText variant="labelSm" tone="success">
                ✓ {copy.confirmed}
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary">
              {copy.instant}
            </VemtapText>
          </View>
          <View className="gap-2 rounded-field bg-surface-tint p-4">
            <VemtapText variant="caption" tone="secondary">
              DATE &amp; SCHEDULE
            </VemtapText>
            <VemtapText variant="headingMd">{copy.date}</VemtapText>
            <View className="flex-row items-center gap-2">
              <Icon name="schedule" size={18} color={colors.primary} />
              <VemtapText variant="labelSm" tone="secondary">
                {copy.time}
              </VemtapText>
              <View className="h-1 w-1 rounded-full bg-outline" />
              <VemtapText variant="caption" tone="tertiary">
                {copy.duration}
              </VemtapText>
            </View>
            <Button
              label={copy.calendar}
              variant="secondary"
              size="sm"
              onPress={onAddCalendar}
              leftIcon={<Icon name="eventAvailable" size={18} color={colors.primary} />}
            />
          </View>
        </View>
        <View className="gap-4 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-surface-container">
              <VemtapText variant="headingSm" tone="brand">
                G
              </VemtapText>
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1">
                <VemtapText variant="headingSm" numberOfLines={1}>
                  {copy.business}
                </VemtapText>
                <Icon name="verified" size={17} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                {copy.address}
              </VemtapText>
              <View className="flex-row items-center gap-1">
                <Icon name="star" size={15} color={colors.tertiary} />
                <VemtapText variant="caption" className="font-sans-semibold">
                  {copy.rating}
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  {copy.reviews}
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="flex-row items-center gap-2 rounded-field bg-surface-subtle p-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
              <VemtapText variant="labelSm" className="text-on-secondary-container">
                AK
              </VemtapText>
            </View>
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.specialist}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.specialistRole}
              </VemtapText>
            </View>
            <View className="rounded-full bg-surface-container px-2 py-1">
              <VemtapText variant="caption" tone="brand">
                {copy.requested}
              </VemtapText>
            </View>
          </View>
          <View className="gap-2">
            <VemtapText variant="labelSm" tone="tertiary" className="uppercase">
              {copy.services}
            </VemtapText>
            {[
              [copy.serviceOne, copy.serviceOneMeta, copy.serviceOnePrice],
              [copy.serviceTwo, copy.serviceTwoMeta, copy.serviceTwoPrice],
            ].map(([name, meta, price]) => (
              <View key={name} className="flex-row justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <VemtapText variant="bodyMd" className="font-sans-medium">
                    {name}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {meta}
                  </VemtapText>
                </View>
                <VemtapText variant="labelMd" className="shrink-0 font-sans-semibold">
                  {price}
                </VemtapText>
              </View>
            ))}
            <View className="gap-1 rounded-field bg-surface-subtle p-3">
              <View className="flex-row justify-between">
                <VemtapText variant="labelSm" tone="secondary">
                  {copy.subtotal}
                </VemtapText>
                <VemtapText variant="labelSm">₦25,000</VemtapText>
              </View>
              <View className="flex-row justify-between">
                <VemtapText variant="labelSm" tone="success">
                  {copy.discount}
                </VemtapText>
                <VemtapText variant="labelSm" tone="success">
                  -₦5,000
                </VemtapText>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row justify-between">
                <VemtapText variant="headingSm">{copy.total}</VemtapText>
                <VemtapText variant="headingSm" tone="brand">
                  {copy.totalValue}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>
        <View className="flex-row gap-3 rounded-card bg-surface p-4 shadow-sm">
          <Icon name="storefront" size={22} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.payment}
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              {copy.paymentBody}
            </VemtapText>
          </View>
        </View>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row justify-between">
            <VemtapText variant="labelSm" tone="tertiary" className="uppercase">
              {copy.verification}
            </VemtapText>
            <VemtapText variant="caption" tone="brand">
              ✓ {copy.authenticated}
            </VemtapText>
          </View>
          {[
            [copy.reference, '#VT-BK-44218'],
            [copy.code, 'VT-SPA8821'],
          ].map(([label, value]) => (
            <View
              key={label}
              className="flex-row items-center justify-between rounded-field bg-surface-subtle p-3"
            >
              <View>
                <VemtapText variant="caption" tone="secondary">
                  {label}
                </VemtapText>
                <VemtapText variant="labelMd" className="font-sans-bold">
                  {value}
                </VemtapText>
              </View>
              <Button
                label={copy.copy}
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => onCopy?.(value)}
                leftIcon={<Icon name="copy" size={16} color={colors.primary} />}
              />
            </View>
          ))}
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary-container">
              <VemtapText variant="caption" tone="secondary">
                ZA
              </VemtapText>
            </View>
            <View>
              <VemtapText variant="labelMd">Zainab Ahmed</VemtapText>
              <VemtapText variant="caption" tone="tertiary">
                zainab.ahmed@example.com
              </VemtapText>
            </View>
          </View>
        </View>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row justify-between gap-2">
            <VemtapText variant="headingSm" className="min-w-0 flex-1" numberOfLines={2}>
              {copy.location}
            </VemtapText>
            <VemtapText variant="labelSm" tone="secondary" className="shrink-0">
              {copy.maitama}
            </VemtapText>
          </View>
          <View className="h-40 items-center justify-center rounded-card bg-surface-container">
            <Icon name="locationOn" size={38} color={colors.primary} />
            <VemtapText variant="labelSm">Maitama Heights Plaza</VemtapText>
            <Pressable accessibilityRole="button" onPress={onOpenMaps}>
              <VemtapText variant="labelSm" tone="brand">
                {copy.openMaps} ↗
              </VemtapText>
            </Pressable>
          </View>
          <ActionGrid
            actions={[
              { label: copy.chat, icon: 'message', onPress: onChat },
              { label: copy.call, icon: 'phone', onPress: onCall },
            ]}
          />
        </View>
        <View className="gap-3 rounded-card bg-surface p-4 shadow-sm">
          <View className="flex-row gap-2">
            <Icon name="info" size={20} color={colors.secondary} />
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold">
                {copy.policy}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.policyBody}
              </VemtapText>
            </View>
          </View>
          <Button label={copy.reschedule} variant="secondary" onPress={onReschedule} />
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="items-center rounded-field py-3"
          >
            <VemtapText variant="labelMd" tone="error">
              {copy.cancel}
            </VemtapText>
          </Pressable>
        </View>
      </PageScroll>
    </SafeAreaView>
  );
}
