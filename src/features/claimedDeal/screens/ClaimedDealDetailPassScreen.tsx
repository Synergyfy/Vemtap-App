import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { LocationMapView } from '@components/shared/LocationMapView';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { ClaimPassQrCode } from '../components/ClaimPassQrCode';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const copy = strings.claimedDealPass;
const image =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHNsQYzlQAh9oju3O9Pp7b2OqE4Q1w9NTs0_fLXsac8VzxG06oD2NcwkkT8F3q8guxDTRfKEplRfmk3C-S9j62uAZ-X3SG4rkR3dDcngRx8sOpiwe5UeKWYk-lyy81904uUukw2Do3wMAOVj0Vg_7dv90NC6KTvhmoR0HFL6aPR56jOI4gZrX7w67mzbdQcgA44gm5lNRoAe6oGg6V1rNX8nBhjhfYCCBlRIssV7QqZImEOkPqpYnQDw';
const region = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export interface ClaimedDealDetailPassScreenProps {
  onBack?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onUseDeal?: () => void;
  onOpenChat?: () => void;
  onGetDirections?: () => void;
  onCallBranch?: () => void;
  onReview?: () => void;
  onCancel?: () => void;
}

export function ClaimedDealDetailPassScreen({
  onBack,
  onShare,
  onMore,
  onUseDeal,
  onOpenChat,
  onGetDirections,
  onCallBranch,
  onReview,
  onCancel,
}: ClaimedDealDetailPassScreenProps) {
  const { width } = useWindowDimensions();
  const [copied, setCopied] = useState(false);
  const qrSize = Math.min(width - 104, 192);
  const copyCode = useCallback(() => {
    Clipboard.setString(copy.code);
    setCopied(true);
  }, []);
  const requestUse = useCallback(() => {
    Alert.alert(copy.useNow, copy.present, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: copy.useNow, onPress: onUseDeal },
    ]);
  }, [onUseDeal]);
  const requestCancel = useCallback(() => {
    Alert.alert(copy.cancel, copy.present, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: copy.cancel, style: 'destructive', onPress: onCancel },
    ]);
  }, [onCancel]);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <RegistrationHeader
        title={copy.title}
        onBack={onBack ?? (() => undefined)}
        showShareAction
        onShare={onShare}
        showMoreAction
        onMore={onMore}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-28 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-card-lg bg-surface shadow-xl">
          <View className="flex-col justify-between gap-2 bg-surface-container-low p-4 sm:flex-row sm:items-center">
            <View className="w-fit flex-row items-center gap-1.5 rounded-full bg-badge-discount-bg px-2 py-1">
              <View className="h-2 w-2 rounded-full bg-badge-discount-text" />
              <VemtapText
                variant="labelSm"
                className="font-sans-semibold uppercase tracking-wider text-badge-discount-text"
              >
                {copy.active}
              </VemtapText>
            </View>
            <View className="min-w-0 flex-row items-center gap-1">
              <Icon name="hourglass" size={16} color={colors.tertiary} />
              <VemtapText variant="caption" tone="secondary">
                {copy.expires}
              </VemtapText>
            </View>
          </View>
          <View className="gap-4 p-4">
            <View className="relative h-44 overflow-hidden rounded-field">
              <Image
                source={{ uri: image }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', colors.surfaceDark]}
                className="absolute inset-0"
              />
              <View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-full bg-surface px-2 py-0.5">
                <Icon name="fire" size={16} color={colors.primary} />
                <VemtapText variant="labelSm" tone="brand" className="font-sans-semibold">
                  {copy.saved}
                </VemtapText>
              </View>
            </View>
            <View>
              <View className="flex-row items-center gap-1">
                <VemtapText variant="labelMd" className="font-sans-semibold">
                  {copy.business}
                </VemtapText>
                <Icon name="verified" size={16} color={colors.primary} />
              </View>
              <VemtapText variant="headingMd" className="mt-0.5">
                {copy.deal}
              </VemtapText>
              <View className="mt-1 flex-row items-start gap-1">
                <Icon name="pin" size={16} color={colors.primary} />
                <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                  {copy.address}
                </VemtapText>
              </View>
            </View>
            <View className="flex-row items-center justify-between rounded-card bg-surface-tint-blue p-3">
              <View>
                <VemtapText variant="caption" tone="secondary">
                  {copy.discounted}
                </VemtapText>
                <VemtapText variant="headingMd" className="font-sans-bold text-primary">
                  {copy.price}
                </VemtapText>
              </View>
              <View className="items-end">
                <VemtapText variant="caption" tone="tertiary" className="line-through">
                  {copy.regular}
                </VemtapText>
                <VemtapText variant="labelSm" className="text-badge-discount-text">
                  {copy.save}
                </VemtapText>
              </View>
            </View>
          </View>
          <View className="my-1 flex-row items-center justify-center">
            <View className="-ml-3 h-6 w-6 rounded-full bg-background" />
            <View className="mx-4 flex-1 border-t-2 border-dashed border-outline" />
            <View className="-mr-3 h-6 w-6 rounded-full bg-background" />
          </View>
          <PassCodes qrSize={qrSize} copied={copied} onCopy={copyCode} />
        </View>
        <Button
          label={copy.useNow}
          leftIcon={<Icon name="checkCircle" size={20} color={colors.surface} />}
          onPress={requestUse}
        />
        <View className="flex-row gap-2">
          <Button
            label={copy.chat}
            variant="secondary"
            size="sm"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="message" size={18} color={colors.primary} />}
            onPress={onOpenChat}
          />
          <Button
            label={copy.directions}
            variant="secondary"
            size="sm"
            fullWidth={false}
            className="min-w-0 flex-1"
            leftIcon={<Icon name="nearMe" size={18} color={colors.primary} />}
            onPress={onGetDirections}
          />
        </View>
        <DetailCard
          title={copy.verification}
          badge={copy.reference}
          rows={[
            [copy.claimedOn, copy.claimedOnValue],
            [copy.holder, copy.holderValue],
            [copy.payment, copy.paymentValue],
            [copy.allocation, copy.personal],
          ]}
        />
        <View className="gap-4 rounded-card-lg bg-surface p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed">
              <Icon name="verified" size={18} color={colors.primary} />
            </View>
            <View>
              <VemtapText variant="headingSm">{copy.how}</VemtapText>
              <VemtapText variant="caption" tone="secondary">
                {copy.howSub}
              </VemtapText>
            </View>
          </View>
          <View className="gap-3">
            {copy.steps.map((step, index) => (
              <View key={step[0]} className="flex-row items-start gap-3">
                <View className="h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                  <VemtapText variant="labelSm" className="text-primary-foreground">
                    {index + 1}
                  </VemtapText>
                </View>
                <View className="min-w-0 flex-1">
                  <VemtapText variant="bodyMd" className="font-sans-medium">
                    {step[0]}
                  </VemtapText>
                  <VemtapText variant="caption" tone="secondary">
                    {step[1]}
                  </VemtapText>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className="gap-2 rounded-card-lg bg-surface p-4 shadow-sm">
          <VemtapText variant="headingSm">{copy.rules}</VemtapText>
          {copy.rulesList.map((rule, index) => (
            <View key={rule} className="flex-row items-start gap-2">
              <Icon
                name={
                  (['eventAvailable', 'restaurant', 'voucher', 'block'] as IconName[])[
                    index
                  ]
                }
                size={16}
                color={colors.primary}
              />
              <VemtapText variant="caption" tone="secondary" className="min-w-0 flex-1">
                {rule}
              </VemtapText>
            </View>
          ))}
        </View>
        <View className="gap-3 rounded-card-lg bg-surface p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-field bg-surface-container">
              <VemtapText variant="labelMd" className="text-primary">
                UG
              </VemtapText>
            </View>
            <View>
              <VemtapText variant="headingSm">{copy.business}</VemtapText>
              <VemtapText variant="caption" className="text-badge-discount-text">
                ● {copy.open}
              </VemtapText>
            </View>
          </View>
          <LocationMapView
            region={region}
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
          >
            <View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-lg bg-surface px-2 py-1 shadow-sm">
              <Icon name="locationOn" size={16} color={colors.primary} />
              <VemtapText variant="caption" className="font-sans-semibold">
                {copy.distance}
              </VemtapText>
            </View>
          </LocationMapView>
          <View className="flex-row gap-2">
            <Button
              label={copy.call}
              variant="secondary"
              size="sm"
              fullWidth={false}
              className="min-w-0 flex-1"
              leftIcon={<Icon name="phone" size={18} color={colors.primary} />}
              onPress={onCallBranch}
            />
            <Button
              label={copy.inAppChat}
              variant="secondary"
              size="sm"
              fullWidth={false}
              className="min-w-0 flex-1"
              leftIcon={<Icon name="message" size={18} color={colors.primary} />}
              onPress={onOpenChat}
            />
          </View>
        </View>
        <View className="items-center gap-2 pt-1">
          <View className="flex-row flex-wrap items-center justify-center gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={onShare}
              className="flex-row items-center gap-1"
            >
              <Icon name="share" size={18} color={colors.primary} />
              <VemtapText variant="labelMd" tone="brand">
                {copy.sharePass}
              </VemtapText>
            </Pressable>
            <View className="h-1 w-1 rounded-full bg-outline" />
            <Pressable
              accessibilityRole="button"
              onPress={onReview}
              className="flex-row items-center gap-1"
            >
              <Icon name="message" size={18} color={colors.textSecondary} />
              <VemtapText variant="labelMd" tone="secondary">
                {copy.review}
              </VemtapText>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={requestCancel}>
            <VemtapText variant="caption" tone="tertiary" className="underline">
              {copy.cancel}
            </VemtapText>
          </Pressable>
        </View>
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 flex-row gap-2 border-t border-border bg-surface px-4 pb-2 pt-3">
        <Button
          label={copy.barcode}
          variant="secondary"
          fullWidth={false}
          className="min-w-0 flex-1"
          leftIcon={<Icon name="qrCodeScanner" size={19} color={colors.surfaceDark} />}
          onPress={requestUse}
        />
        <Button
          label={copy.useBarcode}
          className="min-w-0 flex-[2]"
          leftIcon={<Icon name="bolt" size={19} color={colors.surface} />}
          onPress={requestUse}
        />
      </View>
    </SafeAreaView>
  );
}

function PassCodes({
  qrSize,
  copied,
  onCopy,
}: {
  qrSize: number;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <View className="items-center gap-3 bg-surface-subtle p-4">
      <View className="items-center rounded-card-lg bg-surface p-3 shadow-sm">
        <ClaimPassQrCode size={qrSize} />
        <VemtapText variant="caption" tone="secondary" className="mt-2">
          {copy.scan}
        </VemtapText>
      </View>
      <View className="flex-row gap-2">
        <View className="flex-1 items-center rounded-card bg-surface p-2">
          <VemtapText variant="caption" tone="secondary">
            {copy.merchantCode}
          </VemtapText>
          <View className="flex-row items-center gap-1">
            <VemtapText variant="headingSm" className="font-sans-bold">
              {copy.code}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.merchantCode}
              onPress={onCopy}
            >
              <Icon name={copied ? 'check' : 'copy'} size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 items-center rounded-card bg-surface p-2">
          <VemtapText variant="caption" tone="secondary">
            {copy.cashierPin}
          </VemtapText>
          <VemtapText variant="headingSm" tone="brand" className="font-sans-bold">
            {copy.pin}
          </VemtapText>
        </View>
      </View>
      <VemtapText variant="caption" tone="secondary" className="text-center">
        {copy.present}
      </VemtapText>
    </View>
  );
}

function DetailCard({
  title,
  badge,
  rows,
}: {
  title: string;
  badge: string;
  rows: string[][];
}) {
  return (
    <View className="gap-2 rounded-card-lg bg-surface p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <VemtapText variant="headingSm">{title}</VemtapText>
        <View className="rounded-full bg-surface-container-high px-2 py-0.5">
          <VemtapText variant="labelSm">{badge}</VemtapText>
        </View>
      </View>
      {rows.map(row => (
        <View key={row[0]} className="flex-row items-center justify-between gap-3 py-1">
          <VemtapText variant="caption" tone="secondary">
            {row[0]}
          </VemtapText>
          <VemtapText
            variant="caption"
            className="min-w-0 flex-1 text-right font-sans-medium"
          >
            {row[1]}
          </VemtapText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
  },
});
