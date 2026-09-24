import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { BottomSheet } from '@components/shared/BottomSheet';
import { LocationMapView } from '@components/shared/LocationMapView';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { dealsGrid } from '@features/deals/data/dealsFeed';
import type { AppStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { ContactBusinessOptionsSheet } from '../components/ContactBusinessOptionsSheet';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

type Props = NativeStackScreenProps<AppStackParamList, 'MyClaimedDeal'>;

const copy = strings.myClaimedDeal;
const claimCode = 'VT-48F2G1';
const apoRegion = {
  latitude: 9.0765,
  longitude: 7.3986,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

function ClaimQrCode() {
  return (
    <Svg
      width={144}
      height={144}
      viewBox="0 0 100 100"
      accessibilityLabel={copy.scanWithBusiness}
    >
      <Path
        fill={colors.surfaceDark}
        d="M5 5h30v30H5V5zm6 6v18h18V11H11zM15 15h10v10H15v-10zM65 5h30v30H65V5zm6 6v18h18V11H71zM75 15h10v10H75v-10zM5 65h30v30H5V65zm6 6v18h18V71H11zM15 75h10v10H15V75z"
      />
      <Path
        fill={colors.surfaceDark}
        d="M42 6h6v6h-6zm12 0h6v6h-6zm-12 12h18v6H42zm0 12h6v6h-6zm12 0h6v6h-6zM6 42h6v6H6zm12 0h6v12h-6zm12 0h6v6h-6zm12 0h12v6H42zm18 0h6v18h-6zm12 0h6v6h-6zm12 0h6v12h-6zm-42 12h6v6h-6zm12 0h12v6H54zm-30 6h6v6h-6zm12 0h6v12h-6zm24 0h12v6H66zm24 0h6v6h-6zm-48 6h6v6h-6zm36 0h6v18h-6zm-48 6h6v12H30zm12 0h6v6h-6zm24 0h6v6h-6zm-24 12h12v6H42zm24 0h6v6h-6zm12 0h12v6H78zm-36 6h6v6h-6zm24 0h18v6H66zm-18 6h12v6H48z"
      />
    </Svg>
  );
}

function RedeemStep({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <View className="flex-row items-start gap-4">
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container">
        <VemtapText variant="labelMd" className="font-sans-bold text-primary">
          {number}
        </VemtapText>
      </View>
      <View className="min-w-0 flex-1 pt-0.5">
        <VemtapText variant="labelMd" className="font-sans-semibold text-text">
          {title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" className="mt-0.5 leading-snug">
          {body}
        </VemtapText>
      </View>
    </View>
  );
}

export function MyClaimedDealScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const deal = dealsGrid.find(item => item.id === route.params.dealId) ?? dealsGrid[0];
  const merchant = deal.merchant.split(' • ')[0] || 'Urban Grill & Bistro';
  const area = deal.merchant.split(' • ')[1] || 'Apo, Abuja';

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(() => {
    Clipboard.setString(claimCode);
    setCopied(true);
  }, []);

  const handleDirections = useCallback(() => {
    Linking.openURL('https://maps.google.com').catch(() => undefined);
  }, []);

  const handleShare = useCallback(() => {
    Share.share({ message: `https://vemtap.com/deals/${deal.id}` }).catch(
      () => undefined,
    );
  }, [deal.id]);

  const handleCancel = useCallback(() => {
    Alert.alert(copy.cancelClaim, copy.cancelConfirmation, [
      { text: copy.keepClaim, style: 'cancel' },
      {
        text: copy.cancelClaim,
        style: 'destructive',
        onPress: () => {
          Alert.alert(copy.claimReleased);
          navigation.goBack();
        },
      },
    ]);
  }, [navigation]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-surface">
        <RegistrationHeader
          title={copy.title}
          onBack={navigation.goBack}
          showShareAction
          onShare={handleShare}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between rounded-xl bg-surface-container-low p-4 shadow-sm">
          <View className="min-w-0 flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-badge-discount-text" />
            <VemtapText className="font-sans-semibold text-label-sm uppercase tracking-wide text-badge-discount-text">
              {copy.active}
            </VemtapText>
          </View>
          <View className="ml-2 shrink-0 flex-row items-center gap-1.5">
            <Icon name="schedule" size={18} color={colors.textSecondary} />
            <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
              {copy.expires}
            </VemtapText>
          </View>
        </View>

        <View className="flex-row items-center gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <View className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
            <Image source={deal.image} className="h-full w-full" resizeMode="cover" />
            <View className="absolute left-1 top-1 rounded-full bg-badge-discount-bg px-1.5 py-0.5 shadow-sm">
              <VemtapText className="font-sans-semibold text-caption text-badge-discount-text">
                {deal.leftBadge.label}
              </VemtapText>
            </View>
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1">
              <Icon name="storefront" size={15} color={colors.textTertiary} />
              <VemtapText variant="caption" tone="tertiary" numberOfLines={1}>
                {merchant} • {area}
              </VemtapText>
            </View>
            <VemtapText
              variant="headingSm"
              className="mt-0.5 text-text"
              numberOfLines={1}
            >
              {deal.title}
            </VemtapText>
            <View className="mt-1 flex-row flex-wrap items-baseline gap-x-1.5">
              <VemtapText className="font-sans-bold text-heading-md text-primary">
                {deal.price}
              </VemtapText>
              <VemtapText variant="caption" tone="tertiary" className="line-through">
                {deal.priceWas}
              </VemtapText>
              <View className="rounded bg-badge-discount-bg px-1.5 py-0.5">
                <VemtapText variant="labelSm" className="text-badge-discount-text">
                  {deal.save}
                </VemtapText>
              </View>
            </View>
          </View>
        </View>

        <View className="items-center overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <View className="mb-3 w-full flex-row items-center justify-between gap-2">
            <VemtapText
              variant="caption"
              tone="tertiary"
              className="font-sans-medium uppercase tracking-wider"
            >
              {copy.merchantClaimCode}
            </VemtapText>
            <View className="flex-row items-center gap-1">
              <Icon name="verified" size={14} color={colors.textSecondary} />
              <VemtapText variant="caption" tone="secondary">
                {copy.oneTimeUse}
              </VemtapText>
            </View>
          </View>
          <View className="w-full items-center gap-4 rounded-xl bg-surface-subtle p-4">
            <VemtapText className="font-sans-bold text-display-mobile tracking-wider text-text">
              {claimCode}
            </VemtapText>
            <Pressable
              accessibilityRole="button"
              onPress={handleCopy}
              className="flex-row items-center gap-1 rounded-full bg-surface-tint-blue px-4 py-1.5 active:bg-secondary-fixed"
            >
              <Icon
                name={copied ? 'checkCircle' : 'copy'}
                size={16}
                color={colors.primary}
              />
              <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
                {copied ? copy.copied : copy.tapToCopy}
              </VemtapText>
            </Pressable>
            <View className="items-center rounded-xl bg-surface-canvas px-3 py-2 shadow-sm">
              <ClaimQrCode />
              <VemtapText variant="caption" tone="tertiary" className="mt-1">
                {copy.scanWithBusiness}
              </VemtapText>
            </View>
          </View>
          <View className="mt-4 w-full flex-row items-start gap-2 rounded-lg bg-surface-container-low px-4 py-2">
            <Icon name="info" size={20} color={colors.primary} />
            <VemtapText
              variant="caption"
              tone="secondary"
              className="min-w-0 flex-1 leading-snug"
            >
              {copy.cashierGuidance}
            </VemtapText>
          </View>
        </View>

        <View className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <VemtapText variant="headingSm" className="mb-4 text-text">
            {copy.howToRedeem}
          </VemtapText>
          <View className="gap-4">
            <RedeemStep number="1" title={copy.stepOneTitle} body={copy.stepOneBody} />
            <RedeemStep number="2" title={copy.stepTwoTitle} body={copy.stepTwoBody} />
            <RedeemStep
              number="3"
              title={copy.stepThreeTitle}
              body={copy.stepThreeBody}
            />
          </View>
        </View>

        <View className="gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                {merchant}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {copy.address}
              </VemtapText>
            </View>
            <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
              <Icon name="locationOn" size={18} color={colors.primary} />
            </View>
          </View>
          <LocationMapView
            region={apoRegion}
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <View className="absolute bottom-2 right-2 flex-row items-center gap-1 rounded bg-surface-canvas px-2 py-1 shadow-sm">
              <Icon name="nearMe" size={14} color={colors.primary} />
              <VemtapText variant="caption" className="text-text">
                {copy.distanceAway}
              </VemtapText>
            </View>
          </LocationMapView>
          <View className="flex-row gap-3 pt-1">
            <Button
              label={copy.getDirections}
              leftIcon={<Icon name="nearMe" size={20} color={colors.surface} />}
              className="min-w-0 flex-1 bg-primary-container shadow-md"
              labelClassName="text-primary-foreground"
              onPress={handleDirections}
            />
            <Button
              label={copy.contactBusiness}
              leftIcon={<Icon name="help" size={20} color={colors.surfaceDark} />}
              variant="secondary"
              className="min-w-0 flex-1 bg-surface-container-highest shadow-sm"
              labelClassName="text-on-surface"
              onPress={() => setContactVisible(true)}
            />
          </View>
        </View>

        <View className="items-center gap-3 pt-1">
          <Pressable
            accessibilityRole="button"
            onPress={() => setTermsVisible(true)}
            className="flex-row items-center gap-1"
          >
            <Icon name="rule" size={18} color={colors.primary} />
            <VemtapText variant="button" tone="brand">
              {copy.viewTerms}
            </VemtapText>
          </Pressable>
          <View className="flex-row flex-wrap items-center justify-center gap-3 pt-1">
            <Pressable
              accessibilityRole="button"
              onPress={() => Alert.alert(copy.supportTitle, copy.supportMessage)}
            >
              <VemtapText variant="caption" tone="secondary">
                {copy.needHelp}
              </VemtapText>
            </Pressable>
            <View className="h-1 w-1 rounded-full bg-text-tertiary" />
            <Pressable accessibilityRole="button" onPress={handleCancel}>
              <VemtapText variant="caption" tone="error">
                {copy.cancelClaim}
              </VemtapText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        title={copy.dealTerms}
      >
        <ScrollView
          className="px-6"
          contentContainerClassName="gap-2 pb-4"
          showsVerticalScrollIndicator={false}
        >
          {[copy.termsOne, copy.termsTwo, copy.termsThree, copy.termsFour].map(term => (
            <View key={term} className="flex-row items-start gap-2">
              <VemtapText variant="bodyMd" tone="secondary">
                •
              </VemtapText>
              <VemtapText variant="bodyMd" tone="secondary" className="min-w-0 flex-1">
                {term}
              </VemtapText>
            </View>
          ))}
          <Button
            label={copy.understood}
            className="mt-3"
            onPress={() => setTermsVisible(false)}
          />
        </ScrollView>
      </BottomSheet>

      <ContactBusinessOptionsSheet
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
        onOpenChat={() => {
          setContactVisible(false);
          navigation.navigate('MerchantChat', { dealId: deal.id });
        }}
      />

      <View pointerEvents="none" style={{ height: insets.bottom }} />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
