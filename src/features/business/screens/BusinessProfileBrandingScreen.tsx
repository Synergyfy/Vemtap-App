import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { RegistrationHeader } from '@components/auth/RegistrationHeader';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { businessProfileCopy as copy } from '@features/business/businessCopy';
import { businessBrandingImages } from '@features/business/businessData';
import {
  InlineImageCard,
  PreviewShell,
  PrimaryActionButton,
  SetupStepBar,
  SetupCallout,
  SetupSectionCard,
  StatusPill,
  TextActionButton,
} from '@features/business/components/BusinessSetupPrimitives';
import {
  FeedPreviewCard,
  GalleryTile,
} from '@features/business/components/BusinessSetupCards';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(SafeAreaView, { className: 'style' });

const GALLERY_MAX = 5;

const coverFade = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  top: '45%',
} as const;

export interface BusinessBrandingValue {
  logoChanged: boolean;
  logoRemoved: boolean;
  coverReplaced: boolean;
  galleryUris: string[];
}

export interface BusinessProfileBrandingScreenProps {
  onBack?: () => void;
  onContinue?: (value: BusinessBrandingValue) => void;
  onSaveDraft?: (value: BusinessBrandingValue) => void;
  onChangeLogo?: () => void;
  onChangeCover?: () => void;
  onAddPhoto?: () => string | undefined;
}

/**
 * Conversion of
 * stitch_vemtap_design_system_1/business_profile_2._visual_branding/code.html
 */
export function BusinessProfileBrandingScreen({
  onBack,
  onContinue,
  onSaveDraft,
  onChangeLogo,
  onChangeCover,
  onAddPhoto,
}: BusinessProfileBrandingScreenProps) {
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [logoChanged, setLogoChanged] = useState(false);
  const [coverReplaced, setCoverReplaced] = useState(false);
  const [galleryUris, setGalleryUris] = useState<string[]>([
    ...businessBrandingImages.gallery,
  ]);

  const handleBack = useCallback(() => onBack?.(), [onBack]);

  const onToggleLogo = useCallback(() => {
    setLogoRemoved(current => !current);
  }, []);

  const onChangeLogoPress = useCallback(() => {
    setLogoChanged(true);
    onChangeLogo?.();
  }, [onChangeLogo]);

  const onCoverPress = useCallback(() => {
    setCoverReplaced(true);
    onChangeCover?.();
  }, [onChangeCover]);

  const onAddGallery = useCallback(() => {
    if (galleryUris.length >= GALLERY_MAX) {
      return;
    }
    const next = onAddPhoto?.();
    if (typeof next === 'string') {
      setGalleryUris(current => [...current, next]);
    }
  }, [galleryUris.length, onAddPhoto]);

  const onRemoveGallery = useCallback((uri: string) => {
    setGalleryUris(current => current.filter(item => item !== uri));
  }, []);

  const value: BusinessBrandingValue = {
    logoChanged,
    logoRemoved,
    coverReplaced,
    galleryUris,
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <RegistrationHeader title={copy.branding.header} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SetupStepBar
          step={copy.branding.step}
          percent={copy.branding.percent}
          progress={66}
          stepStyle="plain"
          stepMarker="check"
          bordered
        />
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          {[copy.branding.stageOne, copy.branding.stageTwo, copy.branding.stageThree].map(
            (stage, index) => (
              <VemtapText
                key={stage}
                variant="caption"
                className={index === 1 ? 'text-primary' : 'text-text-secondary'}
              >
                {stage}
              </VemtapText>
            ),
          )}
        </View>

        <View className="gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            {copy.branding.title}
          </VemtapText>
          <VemtapText tone="secondary" className="mt-1">
            {copy.branding.subtitleLead}{' '}
            <VemtapText className="font-sans-semibold text-primary">
              {copy.branding.subtitleHighlight}
            </VemtapText>{' '}
            {copy.branding.subtitleTail}
          </VemtapText>
        </View>

        <SetupCallout
          icon="lightbulb"
          body={copy.branding.tip}
          className="items-center py-3"
        />

        <SetupSectionCard>
          <View className="gap-1">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <VemtapText variant="headingSm" className="text-text">
                {copy.branding.logoTitle}
              </VemtapText>
              <StatusPill label={copy.branding.logoSpec} tone="neutral" />
            </View>
            <VemtapText variant="caption" tone="secondary">
              {copy.branding.logoBody}
            </VemtapText>
          </View>
          <View className="mt-2 flex-row items-center gap-4">
            <View className="h-20 w-20 shrink-0 overflow-hidden rounded-field bg-surface-container shadow-sm">
              {logoRemoved ? (
                <View className="h-full w-full items-center justify-center bg-surface-container-high">
                  <Icon name="imagePlus" size={26} color={colors.textTertiary} />
                </View>
              ) : (
                <View className="relative h-full w-full items-center justify-center bg-surface-container-high">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm">
                    <Icon name="restaurant" size={26} color={colors.surface} />
                  </View>
                  <VemtapText
                    variant="caption"
                    className="absolute bottom-1 font-sans-bold tracking-wider text-on-secondary-container"
                  >
                    {copy.branding.logoEmblem}
                  </VemtapText>
                  <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-badge-discount-text" />
                </View>
              )}
            </View>
            <View className="min-w-0 flex-1 gap-2">
              <View className="flex-row flex-wrap items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.branding.logoChange}
                  onPress={onChangeLogoPress}
                  className="min-h-[36px] flex-row items-center gap-1.5 rounded-lg bg-surface-tint-blue px-4 shadow-sm active:scale-95"
                >
                  <Icon name="camera" size={18} color={colors.primary} />
                  <VemtapText variant="button" className="text-primary">
                    {copy.branding.logoChange}
                  </VemtapText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.branding.logoRemove}
                  onPress={onToggleLogo}
                  className="min-h-[36px] flex-row items-center gap-1 rounded-lg bg-surface-container-low px-3 active:scale-95"
                >
                  <Icon name="delete" size={18} color={colors.textSecondary} />
                  <VemtapText variant="button" className="text-text-secondary">
                    {copy.branding.logoRemove}
                  </VemtapText>
                </Pressable>
              </View>
              <VemtapText variant="caption" tone="tertiary">
                {copy.branding.logoHint}
              </VemtapText>
            </View>
          </View>
        </SetupSectionCard>

        <SetupSectionCard>
          <View className="flex-row flex-wrap items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="headingSm" className="text-text">
                {copy.branding.coverTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {copy.branding.coverBody}
              </VemtapText>
            </View>
            <StatusPill label={copy.branding.coverSpec} tone="neutral" />
          </View>
          <InlineImageCard
            uri={businessBrandingImages.cover}
            height={176}
            rounded="field"
          >
            <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-inverse-surface/80 px-2 py-0.5">
              <Icon name="aspectRatio" size={12} color={colors.inverseOnSurface} />
              <VemtapText variant="caption" className="text-inverse-on-surface">
                {copy.branding.coverDimensions}
              </VemtapText>
            </View>
            <LinearGradient
              colors={['transparent', 'rgba(17, 24, 39, 0.7)']}
              locations={[0, 1]}
              style={coverFade}
              pointerEvents="none"
            />
            <View className="absolute inset-x-0 bottom-0 flex-row items-end justify-between gap-2 p-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.branding.coverReplace}
                onPress={onCoverPress}
                className="min-h-[40px] flex-row items-center gap-2 rounded-field bg-surface-canvas px-4 shadow-md active:scale-95"
              >
                <Icon name="imagePlus" size={20} color={colors.primary} />
                <VemtapText variant="button" className="text-text">
                  {copy.branding.coverReplace}
                </VemtapText>
              </Pressable>
              <VemtapText
                variant="caption"
                className="hidden flex-1 text-right text-primary-foreground opacity-90 sm:flex"
                numberOfLines={1}
              >
                {copy.branding.coverFormats}
              </VemtapText>
            </View>
          </InlineImageCard>
        </SetupSectionCard>

        <SetupSectionCard>
          <View className="flex-row flex-wrap items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <VemtapText variant="headingSm" className="text-text">
                {copy.branding.galleryTitle}
              </VemtapText>
              <VemtapText variant="caption" tone="secondary" className="mt-0.5">
                {copy.branding.galleryBody}
              </VemtapText>
            </View>
            <VemtapText variant="labelSm" className="font-sans-semibold text-primary">
              {galleryUris.length} / {GALLERY_MAX}
            </VemtapText>
          </View>
          <View className="flex-row gap-2">
            {galleryUris.map(uri => (
              <GalleryTile
                key={uri}
                uri={uri}
                label={copy.branding.galleryTitle}
                onRemove={() => onRemoveGallery(uri)}
              />
            ))}
            {galleryUris.length < GALLERY_MAX ? (
              <GalleryTile label={copy.branding.galleryAdd} onAdd={onAddGallery} />
            ) : null}
          </View>
        </SetupSectionCard>

        <PreviewShell
          label={copy.branding.previewTitle}
          hint={copy.branding.previewHint}
          icon="visibility"
          tone="container"
        >
          <FeedPreviewCard
            imageUri={businessBrandingImages.feed}
            badge={copy.branding.previewBadge}
            openBadge={copy.branding.previewOpen}
            name={copy.branding.previewName}
            meta={copy.branding.previewMeta}
            rating="4.9"
          />
        </PreviewShell>
      </ScrollView>

      <View className="gap-2 px-6 pb-2 pt-3">
        <PrimaryActionButton
          label={copy.branding.continue}
          onPress={() => onContinue?.(value)}
        />
        <View className="flex-row items-center justify-between">
          <TextActionButton
            label={copy.branding.back}
            icon="back"
            onPress={handleBack}
            className="px-3"
          />
          <TextActionButton
            label={copy.branding.saveDraft}
            icon="bookmark"
            onPress={() => onSaveDraft?.(value)}
            className="px-3"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
