import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import {
  ServiceChoiceCard,
  ServiceChip,
  ServiceFlowFooter,
  ServiceFlowPage,
  ServiceMediaThumbnail,
  ServiceProgress,
  ServiceSection,
  ServiceSettingRow,
  ServiceTextField,
} from '@features/business/components/ServiceFlowPrimitives';
import {
  serviceDeliveryOptions,
  serviceFlowDraft,
  serviceFlowImages,
  serviceHighlightOptions,
} from '@features/business/data/serviceFlowData';
import { BusinessProductImage } from '@features/business/components/BusinessPrimitives';
import { uploadBusinessImage } from '@features/business/utils/uploadBusinessMedia';
import { extensionForMimeType } from '@api/uploadClient';
import { showError } from '@components/shared';
import { strings } from '@constants/strings';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export type ServiceBasicsValue = {
  title: string;
  delivery: string;
  description: string;
  highlights: string[];
  audience: string;
  mainImage?: string;
  galleryImages?: string[];
};

export interface AddServiceBasicsMediaScreenProps {
  onBack: () => void;
  onNext?: (value: ServiceBasicsValue) => void;
  onSaveDraft?: (value: ServiceBasicsValue) => void;
  /**
   * Live mode: the provider and category rows show the business itself, and
   * the form starts empty (or from `initialValue`) with no sample photos.
   */
  live?: {
    provider: string;
    providerLocation: string;
    primaryCategory: string;
    subCategory: string;
  };
  initialValue?: Partial<ServiceBasicsValue>;
}

const liveCopy = strings.serviceFlow;

export function AddServiceBasicsMediaScreen({
  onBack,
  onNext,
  onSaveDraft,
  live,
  initialValue,
}: AddServiceBasicsMediaScreenProps) {
  const sample = live === undefined;
  const [title, setTitle] = useState<string>(
    initialValue?.title ?? (sample ? serviceFlowDraft.title : ''),
  );
  const [description, setDescription] = useState<string>(
    initialValue?.description ?? (sample ? serviceFlowDraft.description : ''),
  );
  const [delivery, setDelivery] = useState(initialValue?.delivery ?? 'in-salon');
  const [highlights, setHighlights] = useState(
    () =>
      new Set(
        initialValue?.highlights ??
          (sample ? ['Sensitive Skin Safe', 'Organic Botanicals'] : []),
      ),
  );
  const [gender, setGender] = useState(initialValue?.audience ?? 'all');
  const [mainImage, setMainImage] = useState<string | undefined>(
    initialValue?.mainImage ?? (sample ? serviceFlowImages.cover.uri : undefined),
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialValue?.galleryImages ??
      (sample ? serviceFlowImages.thumbnails.map(t => t.uri) : []),
  );
  const canContinue = sample || title.trim().length > 0;
  const [uploading, setUploading] = useState(false);

  const currentValue: ServiceBasicsValue = {
    title,
    delivery,
    description,
    highlights: [...highlights],
    audience: gender,
    mainImage,
    galleryImages,
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const toggleHighlight = (value: string) => {
    setHighlights(current => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const uploadPicked = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploading(true);
    try {
      return await Promise.all(
        assets.map(asset =>
          uploadBusinessImage({
            fileUri: asset.uri,
            fileName: asset.fileName ?? `service.${extensionForMimeType(asset.mimeType)}`,
            mimeType: asset.mimeType,
          }),
        ),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleChangeCover = async () => {
    if (uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return;

    const uploaded = await uploadPicked(result.assets.slice(0, 1));
    const url = uploaded[0];
    if (!url) {
      showError(strings.common.uploadFailed);
      return;
    }
    setMainImage(url);
  };

  const handleAddPhotos = async () => {
    if (uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 10 - (galleryImages.length + 1)),
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return;

    const uploaded = await uploadPicked(result.assets);
    const urls = uploaded.filter((url): url is string => Boolean(url));
    // A dropped photo would otherwise leave the gallery looking complete.
    if (urls.length < result.assets.length) {
      showError(strings.common.uploadFailed);
    }
    if (!urls.length) return;
    setGalleryImages(current => [...current, ...urls]);
  };

  return (
    <ServiceFlowPage
      title="Add Service   Step 1: Service Basics & Media"
      onBack={onBack}
      onSaveDraft={() => onSaveDraft?.(currentValue)}
      footer={
        <ServiceFlowFooter
          primaryLabel="Continue to Duration & Pricing"
          primaryDisabled={!canContinue}
          onPrimary={() => onNext?.(currentValue)}
          secondaryLabel="Save as Draft & Exit"
          onSecondary={() => onSaveDraft?.(currentValue)}
        />
      }
      contentContainerClassName="px-6 pb-10 pt-4"
    >
      <View className="gap-6">
        <ServiceSection className="gap-2">
          <ServiceProgress
            stepLabel="Step 1 of 4"
            detailLabel="• Service Basics"
            statusLabel="25% completed"
            progress={25}
            description="Set up appointment bookings, treatments, or sessions with clear customer expectations."
          />
        </ServiceSection>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-1">
              <VemtapText variant="headingSm" className="text-heading-sm text-text">
                Service Media
              </VemtapText>
              <VemtapText variant="headingSm" tone="error">
                *
              </VemtapText>
            </View>
            <VemtapText variant="caption" tone="secondary">
              {galleryImages.length + (mainImage ? 1 : 0)} / 10 photos
            </VemtapText>
          </View>
          <View className="relative aspect-[4/3] w-full overflow-hidden rounded-card-lg bg-surface-container-high shadow-sm">
            {mainImage ? (
              <BusinessProductImage
                source={{ uri: mainImage }}
                alt={liveCopy.coverAlt}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={liveCopy.noPhotoYet}
                onPress={handleChangeCover}
                disabled={uploading}
                className="h-full w-full items-center justify-center gap-2"
              >
                <Icon name="addPhoto" size={28} color={colors.primary} />
                <VemtapText variant="labelMd" tone="brand" className="font-sans-medium">
                  {liveCopy.noPhotoYet}
                </VemtapText>
              </Pressable>
            )}
            <View className="absolute left-3 right-3 top-3 flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-row items-center gap-1 rounded-full bg-on-surface/90 px-2 py-1 shadow-sm">
                <Icon name="star" size={14} color={colors.tertiaryFixed} />
                <VemtapText variant="labelSm" className="text-inverse font-sans-medium">
                  Cover Photo
                </VemtapText>
              </View>
              <View className="min-w-0 flex-row items-center gap-1 rounded-full bg-surface/90 px-2 py-1 shadow-sm">
                <Icon name="drag" size={14} color={colors.textSecondary} />
                <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                  Drag to reorder
                </VemtapText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change cover photo"
              onPress={handleChangeCover}
              disabled={uploading}
              className="absolute bottom-3 right-3 min-h-11 flex-row items-center gap-1.5 rounded-lg bg-surface px-3 py-2 shadow-md active:bg-surface-muted"
            >
              <Icon name="camera" size={16} color={colors.primary} />
              <VemtapText variant="button">Change</VemtapText>
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            {galleryImages.map((uri, index) => (
              <ServiceMediaThumbnail
                key={uri}
                uri={uri}
                alt={`Gallery image ${index + 1}`}
                number={index + 1}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add photo"
              onPress={handleAddPhotos}
              disabled={uploading}
              className="aspect-square flex-1 flex-col items-center justify-center gap-1 rounded-lg bg-surface-container-low active:bg-surface-container"
            >
              <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest">
                <Icon name="addPhoto" size={18} color={colors.primary} />
              </View>
              <VemtapText variant="caption" tone="brand" className="font-sans-medium">
                + Add
              </VemtapText>
            </Pressable>
          </View>
          {sample ? (
            <View className="flex-row items-start gap-2 rounded-card-lg bg-surface-tint p-3">
              <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon name="lightbulb" size={18} color={colors.primary} />
              </View>
              <VemtapText
                variant="caption"
                tone="secondary"
                className="min-w-0 flex-1 leading-snug"
              >
                <VemtapText tone="brand" className="font-sans-medium">
                  Pro Tip:
                </VemtapText>{' '}
                Clean ambient treatment photos increase appointment bookings by up to{' '}
                <VemtapText tone="brand" className="font-sans-semibold">
                  3.4x
                </VemtapText>
                .
              </VemtapText>
            </View>
          ) : null}
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <VemtapText variant="headingSm" className="text-heading-sm text-text">
              Service Identity
            </VemtapText>
            <VemtapText variant="caption" tone="tertiary">
              Basic Info
            </VemtapText>
          </View>
          <ServiceSection className="gap-2">
            <ServiceTextField
              label="Service Title"
              required
              value={title}
              onChangeText={handleTitleChange}
              maxLength={80}
              count={`${title.length} / 80`}
              placeholder="e.g. 60 Min Classic Therapeutic Massage"
              hint="Be clear and descriptive so customers spot this immediately on search."
            />
          </ServiceSection>
          <ServiceSection className="gap-3">
            <VemtapText variant="labelSm" tone="secondary" className="font-sans-medium">
              Listed Under Provider
            </VemtapText>
            <View className="rounded-field bg-surface-container-low p-2">
              <View className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed">
                    <Icon name="spa" size={20} color={colors.primary} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-1">
                      <VemtapText
                        variant="labelMd"
                        className="min-w-0 flex-shrink font-sans-semibold text-text"
                        numberOfLines={1}
                      >
                        {live?.provider ?? serviceFlowDraft.provider}
                      </VemtapText>
                      <Icon name="verified" size={16} color={colors.primary} />
                    </View>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {live?.providerLocation ?? serviceFlowDraft.providerLocation}
                    </VemtapText>
                  </View>
                </View>
                {sample ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change listed provider"
                    className="min-h-11 shrink-0 justify-center rounded-field px-2 active:bg-surface-container"
                  >
                    <VemtapText
                      variant="labelSm"
                      tone="brand"
                      className="font-sans-medium"
                    >
                      Change
                    </VemtapText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </ServiceSection>
        </View>

        <View className="gap-3">
          <VemtapText variant="headingSm" className="text-heading-sm text-text">
            Category &amp; Treatment Type
          </VemtapText>
          <ServiceSection>
            <ServiceSettingRow
              icon="wellnessCategory"
              label="Primary Category"
              value={live?.primaryCategory ?? serviceFlowDraft.primaryCategory}
              actionLabel={live ? undefined : 'Change'}
            />
            <ServiceSettingRow
              icon="facialCategory"
              label="Sub-Category"
              value={live?.subCategory ?? serviceFlowDraft.subCategory}
              actionLabel={live ? undefined : 'Change'}
            />
            <View className="gap-2 pt-1">
              <VemtapText variant="labelMd" className="font-sans-medium text-text">
                Service Delivery Format
              </VemtapText>
              <View accessibilityRole="radiogroup" className="gap-2">
                {serviceDeliveryOptions.map(option => (
                  <ServiceChoiceCard
                    key={option.id}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    selected={delivery === option.id}
                    onPress={() => setDelivery(option.id)}
                  />
                ))}
              </View>
            </View>
          </ServiceSection>
        </View>

        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <VemtapText variant="headingSm" className="text-heading-sm text-text">
              Description &amp; Highlights
            </VemtapText>
            <View className="flex-row items-center gap-1 rounded-full bg-surface-tint px-2 py-1 shadow-sm">
              <Icon name="autoAwesome" size={14} color={colors.primary} />
              <VemtapText variant="caption" tone="brand" className="font-sans-medium">
                AI Polish Ready
              </VemtapText>
            </View>
          </View>
          <ServiceSection className="gap-3">
            <ServiceTextField
              label="Detailed Service Overview"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what client experiences during this treatment..."
              multiline
            />
            <View className="mt-1 gap-2">
              <VemtapText variant="caption" tone="secondary" className="font-sans-medium">
                Quick Highlight Tags (Tap to toggle)
              </VemtapText>
              <View className="flex-row flex-wrap gap-2">
                {serviceHighlightOptions.map(option => {
                  const selected = highlights.has(option);
                  return (
                    <ServiceChip
                      key={option}
                      label={`${selected ? '✓' : '+'} ${option}`}
                      selected={selected}
                      onPress={() => toggleHighlight(option)}
                    />
                  );
                })}
              </View>
            </View>
          </ServiceSection>
        </View>

        <View className="gap-3">
          <VemtapText variant="headingSm" className="text-heading-sm text-text">
            Client Requirements &amp; Suitability
          </VemtapText>
          <ServiceSection>
            <View className="gap-2">
              <VemtapText variant="labelMd" className="font-sans-medium text-text">
                Gender Suitability
              </VemtapText>
              <View accessibilityRole="radiogroup" className="flex-row gap-1.5">
                {[
                  ['all', 'All Welcome'],
                  ['women', 'Women Only'],
                  ['men', 'Men Only'],
                ].map(([value, label]) => (
                  <ServiceChip
                    key={value}
                    label={label}
                    selected={gender === value}
                    onPress={() => setGender(value)}
                    className="min-w-0 flex-1 basis-[84px] px-1"
                  />
                ))}
              </View>
            </View>
            <View className="flex-row flex-wrap items-center justify-between gap-3 pt-2">
              <View className="min-w-[170px] flex-1">
                <VemtapText variant="labelMd" className="font-sans-medium text-text">
                  Minimum Age Requirement
                </VemtapText>
                <VemtapText variant="caption" tone="secondary">
                  Mandatory for client consent forms
                </VemtapText>
              </View>
              <View className="shrink-0 flex-row items-center gap-1.5">
                <View className="rounded-full bg-surface-container px-3 py-2">
                  <VemtapText variant="labelMd" className="font-sans-semibold text-text">
                    Ages 16+
                  </VemtapText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit minimum age requirement"
                  className="h-11 w-11 items-center justify-center rounded-full bg-surface-container-low active:bg-surface-container"
                >
                  <Icon name="edit" size={18} color={colors.secondary} />
                </Pressable>
              </View>
            </View>
          </ServiceSection>
        </View>
      </View>
    </ServiceFlowPage>
  );
}
