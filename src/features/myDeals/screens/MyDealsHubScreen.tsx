import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HubHeader,
  HubSearchField,
  SectionLink,
  StatusPillTabs,
} from '@features/accountHub/components/HubPrimitives';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.myDealsHub;
const images = {
  grill:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBtUv6B8-bTHQgNJ5PXGNef2gEEXADX5DcmFBbYUJ-93hUriTuC5gdhgOpWuXr8-DhBStRXQunlJY5F9SdbkcdBi8xvdvz-GntvTSaV6q5gL_NewJ4iBPOb1hcQhqeF_PpIhen2N-Ge140mAfbDyY6ul2n97u9nvM3MeYDbipHkt775pu0Me4sJkMWmMlYa29eu16r-L8ZOymw6wi-sxBPMQhh0dCKUVc4qc6ZPE6yNd5QRd57GJbL29w',
  spa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXPTWtTNegdqmo4bANxsoYCcCeGBFCLcv0d8gE8a0lI5MVZ3L9jYKQfY2RaZDPPbnWRjgX7jze-Vq05elwWA-N1iSa9FW2FNDBrnzWv2C0NBlhfPjl6vWODgqTfknZWmJVL9l_b7gxK8dBVNRYCNOZF5HG967vRm0uRdR0_DpGpeAUrsBALXlvnmpPYygbDuSyDpLT_H4g07cEXECdCdiTCNGGBtsOxn06XnVW_0YV3gHrVtfjkZl8fg',
  boutique:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBQIAX-gY6vwGyuYRRw4AeOZYVkty6avo0e4GUSnvelqU9A0W62ITSfLptMvVCDZOlQ1cCPa7Ljvq6xCTiHn1mFjx99B5Em-kICYvZs0mPqo9Y6B3_KxsoOJxUqAvCvvKGrANTSpcrJasj5O2gbPrkMoVRNqaPMjZ0TuLq3n6FyI2zXwILmfSqXNcuYnp6fYzi2S5QDqpwdD4gqqyU3mJJNzq7jaA26OKs1Lzye8_rUOGmZpwpTbhIbHA',
};

export interface MyDealsHubScreenProps {
  onSearch?: () => void;
  onFilter?: () => void;
  onAccount?: () => void;
  onOpenDeal?: (dealId: string) => void;
  onViewGuidelines?: () => void;
}

export function MyDealsHubScreen({
  onSearch,
  onFilter,
  onAccount,
  onOpenDeal,
  onViewGuidelines,
}: MyDealsHubScreenProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <HubHeader
        title={copy.title}
        actionNames={['search', 'tune']}
        actionLabels={[copy.searchAction, copy.filterAction]}
        onActions={[onSearch, onFilter]}
        accountAction={onAccount}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-1 flex-row items-center justify-between rounded-card bg-surface-container-low p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-badge-discount-bg">
              <Icon name="loyalty" size={18} color={colors.badgeDiscountText} />
            </View>
            <View>
              <VemtapText variant="caption" tone="secondary">
                {copy.savings}
              </VemtapText>
              <VemtapText variant="headingSm">{copy.savingsValue}</VemtapText>
            </View>
          </View>
          <View className="h-7 w-px bg-outline" />
          <View className="items-end">
            <VemtapText variant="caption" tone="secondary">
              {copy.claimed}
            </VemtapText>
            <VemtapText variant="labelMd" tone="brand" className="font-sans-semibold">
              {copy.claimedValue}
            </VemtapText>
          </View>
        </View>
        <View className="my-3 px-4">
          <HubSearchField
            value={query}
            onChangeText={setQuery}
            placeholder={copy.search}
            filterLabel={copy.filterAction}
            onFilter={onFilter}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-4 pb-4"
        >
          <StatusPillTabs labels={copy.tabs} selected={tab} onSelect={setTab} />
        </ScrollView>
        {tab === 0 ? (
          <View className="gap-4 px-4">
            <ClaimedDealCard
              image={images.grill}
              discount="20% OFF"
              status="READY TO REDEEM"
              business="Urban Grill & Bistro"
              location="Apo Boulevard Branch • 0.8 km"
              deal="Prime Lunch Gourmet Combo"
              price="₦9,600"
              old="₦12,000"
              save="Save ₦2,400"
              expiry="2 days left"
              code="VT-48F261"
              useLabel={copy.useDeal}
              passLabel={copy.viewPass}
              onOpen={() => onOpenDeal?.('urban-grill-lunch')}
              onCopy={() => undefined}
            />
            <ClaimedDealCard
              image={images.spa}
              discount="20% OFF"
              status="CONFIRMED"
              business="Glow & Serenity Spa"
              location="Maitama Heights Branch • 1.4 km"
              deal="Deep Hydration Facial & Gel Manicure"
              appointment="Thu, Oct 17 • 1:15 PM"
              specialist="Specialist: Amara K."
              price="₦24,000"
              save="Saved ₦5,000"
              onOpen={() => onOpenDeal?.('glow-booking')}
            />
            <ClaimedDealCard
              image={images.boutique}
              discount="30% OFF"
              status="EXPIRES IN 6 HOURS"
              statusTone="urgent"
              close="Closes 9:00 PM"
              business="Sole District Boutique"
              location="Area 11 Mall • 1.2 km"
              deal="Selected Footwear & Apparel"
              price="₦28,000"
              old="₦40,000"
              code="VT-99A104"
              useLabel={copy.useDeal}
              onOpen={() => onOpenDeal?.('sole-streetwear')}
            />
          </View>
        ) : (
          <View className="px-4">
            <View className="items-center rounded-card bg-surface p-8 shadow-sm">
              <Icon name="inventory" size={36} color={colors.textTertiary} />
              <VemtapText variant="headingSm" className="mt-3">
                {copy.tabs[tab]}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-1">
                {copy.tabs[tab]} deals appear here.
              </VemtapText>
            </View>
          </View>
        )}
        <View className="mt-7 gap-3 px-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icon name="badge" size={20} color={colors.primary} />
              <VemtapText variant="headingSm">{copy.gifted}</VemtapText>
              <View className="rounded-full bg-surface-container-high px-2 py-0.5">
                <VemtapText variant="caption">1</VemtapText>
              </View>
            </View>
            <SectionLink label={copy.viewAll} />
          </View>
          <View className="gap-2 rounded-card bg-surface p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="min-w-0 flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary-fixed">
                  <VemtapText variant="labelMd">SA</VemtapText>
                </View>
                <View className="min-w-0">
                  <VemtapText variant="labelMd" className="font-sans-semibold">
                    Samuel Adeleke
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                    samuel.adeleke@example.com
                  </VemtapText>
                </View>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-badge-discount-bg px-2 py-0.5">
                <Icon name="doneAll" size={12} color={colors.badgeDiscountText} />
                <VemtapText variant="micro" className="text-badge-discount-text">
                  {copy.claimedBadge}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center justify-between rounded-lg bg-surface-subtle p-2">
              <View className="min-w-0">
                <VemtapText variant="labelSm" className="font-sans-medium">
                  Urban Grill 20% Off Combo
                </VemtapText>
                <VemtapText variant="caption" tone="tertiary">
                  Sent on Oct 14, 2024
                </VemtapText>
              </View>
              <SectionLink label={copy.receipt} />
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onViewGuidelines}
          className="mx-4 mt-6 flex-row items-start gap-3 rounded-card bg-surface-tint-blue p-4"
        >
          <Icon name="help" size={22} color={colors.primary} />
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" className="font-sans-semibold">
              {copy.helpTitle}
            </VemtapText>
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-1 leading-relaxed"
            >
              {copy.helpBody}
            </VemtapText>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ClaimedDealCard({
  image,
  discount,
  status,
  statusTone = 'success',
  close,
  business,
  location,
  deal,
  price,
  old,
  save,
  expiry,
  appointment,
  specialist,
  code,
  useLabel,
  passLabel,
  onOpen,
  onCopy,
}: {
  image: string;
  discount: string;
  status: string;
  statusTone?: 'success' | 'urgent';
  close?: string;
  business: string;
  location: string;
  deal: string;
  price: string;
  old?: string;
  save?: string;
  expiry?: string;
  appointment?: string;
  specialist?: string;
  code?: string;
  useLabel?: string;
  passLabel?: string;
  onOpen?: () => void;
  onCopy?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      className="gap-3 rounded-card bg-surface p-4 shadow-sm"
    >
      <View className="flex-row items-start gap-3">
        <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-field">
          <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
          <View className="absolute left-1 top-1 rounded bg-badge-discount-bg px-1.5 py-0.5">
            <VemtapText
              variant="micro"
              className="font-sans-bold text-badge-discount-text"
            >
              {discount}
            </VemtapText>
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <View className="mb-1 flex-row items-center justify-between gap-2">
            <View
              className={`min-w-0 flex-row items-center gap-1 rounded-full px-2 py-0.5 ${statusTone === 'urgent' ? 'bg-tertiary-fixed' : 'bg-badge-discount-bg'}`}
            >
              <View
                className={`h-1.5 w-1.5 rounded-full ${statusTone === 'urgent' ? 'bg-tertiary' : 'bg-badge-discount-text'}`}
              />
              <VemtapText
                variant="micro"
                numberOfLines={1}
                className={
                  statusTone === 'urgent' ? 'text-tertiary' : 'text-badge-discount-text'
                }
              >
                {status}
              </VemtapText>
            </View>
            {close ? (
              <VemtapText variant="micro" className="shrink-0 text-tertiary-container">
                {close}
              </VemtapText>
            ) : (
              <Icon name="more" size={18} color={colors.textTertiary} />
            )}
          </View>
          <VemtapText variant="headingSm" numberOfLines={1}>
            {business}
          </VemtapText>
          <View className="flex-row items-center gap-1">
            <Icon name="locationOn" size={14} color={colors.primary} />
            <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
              {location}
            </VemtapText>
          </View>
          <VemtapText variant="labelSm" className="font-sans-medium" numberOfLines={1}>
            {deal}
          </VemtapText>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            <VemtapText variant="labelMd" className="font-sans-bold">
              {price}
            </VemtapText>
            {old ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {old}
              </VemtapText>
            ) : null}
            {save ? (
              <VemtapText variant="labelSm" className="text-badge-discount-text">
                {save}
              </VemtapText>
            ) : null}
          </View>
        </View>
      </View>
      {appointment ? (
        <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low p-2">
          <View className="min-w-0 flex-row items-center gap-2">
            <Icon name="eventAvailable" size={18} color={colors.primary} />
            <View className="min-w-0">
              <VemtapText variant="labelSm" className="font-sans-semibold">
                {appointment}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {specialist}
              </VemtapText>
            </View>
          </View>
          <VemtapText variant="headingSm" className="shrink-0 font-sans-bold">
            {price}
          </VemtapText>
        </View>
      ) : null}
      {expiry ? (
        <View className="flex-row items-center justify-between gap-2 rounded-lg bg-surface-subtle p-2">
          <View className="min-w-0 flex-row flex-wrap items-center gap-2">
            <VemtapText variant="labelSm" className="font-sans-bold">
              {price}
            </VemtapText>
            {old ? (
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {old}
              </VemtapText>
            ) : null}
            <VemtapText variant="labelSm" className="text-badge-discount-text">
              {save}
            </VemtapText>
          </View>
          <VemtapText variant="labelSm" className="shrink-0 text-tertiary">
            {expiry}
          </VemtapText>
        </View>
      ) : null}
      {code ? (
        <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low px-3 py-2">
          <View className="min-w-0 flex-row items-center gap-2">
            <VemtapText variant="caption" tone="secondary">
              {copy.code}
            </VemtapText>
            <VemtapText variant="labelMd" className="font-sans-bold">
              {code}
            </VemtapText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onCopy}
            className="shrink-0 flex-row items-center gap-1"
          >
            <Icon name="copy" size={15} color={colors.primary} />
            <VemtapText variant="labelSm" tone="brand">
              {copy.copy}
            </VemtapText>
          </Pressable>
        </View>
      ) : null}
      {code && passLabel ? (
        <View className="flex-row items-center gap-1 px-1">
          <Icon name="info" size={15} color={colors.primary} />
          <VemtapText variant="caption" tone="secondary">
            {copy.showServer}
          </VemtapText>
        </View>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {useLabel ? (
          <Button
            label={useLabel}
            size="sm"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="qrCode" size={17} color={colors.surface} />}
            onPress={onOpen}
          />
        ) : null}
        {passLabel ? (
          <Button
            label={passLabel}
            variant="secondary"
            size="sm"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="voucher" size={17} color={colors.primary} />}
            onPress={onOpen}
          />
        ) : null}
        {!passLabel && !useLabel ? (
          <Button
            label={copy.viewBookingPass}
            size="sm"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="eventAvailable" size={17} color={colors.surface} />}
            onPress={onOpen}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
