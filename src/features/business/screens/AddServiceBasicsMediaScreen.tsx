import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
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
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

cssInterop(Pressable, { className: 'style' });
cssInterop(View, { className: 'style' });

export interface AddServiceBasicsMediaScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
}

export function AddServiceBasicsMediaScreen({
  onBack,
  onNext,
  onSaveDraft,
}: AddServiceBasicsMediaScreenProps) {
  const [title, setTitle] = useState<string>(serviceFlowDraft.title);
  const [titleCount, setTitleCount] = useState(47);
  const [delivery, setDelivery] = useState('in-salon');
  const [highlights, setHighlights] = useState(
    () => new Set(['Sensitive Skin Safe', 'Organic Botanicals']),
  );
  const [gender, setGender] = useState('all');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleCount(value.length);
  };

  const toggleHighlight = (value: string) => {
    setHighlights(current => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <ServiceFlowPage
      title="Add Service   Step 1: Service Basics & Media"
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      footer={
        <ServiceFlowFooter
          primaryLabel="Continue to Duration & Pricing"
          onPrimary={onNext}
          secondaryLabel="Save as Draft & Exit"
          onSecondary={onSaveDraft}
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
              4 / 10 photos
            </VemtapText>
          </View>
          <View className="relative aspect-[4/3] w-full overflow-hidden rounded-card-lg bg-surface-container-high shadow-sm">
            <BusinessProductImage
              source={{ uri: serviceFlowImages.cover.uri }}
              alt={serviceFlowImages.cover.alt}
              className="h-full w-full"
              resizeMode="cover"
            />
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
              className="absolute bottom-3 right-3 min-h-11 flex-row items-center gap-1.5 rounded-lg bg-surface px-3 py-2 shadow-md active:bg-surface-muted"
            >
              <Icon name="camera" size={16} color={colors.primary} />
              <VemtapText variant="button">Change</VemtapText>
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            {serviceFlowImages.thumbnails.map((image, index) => (
              <ServiceMediaThumbnail
                key={image.uri}
                uri={image.uri}
                alt={image.alt}
                number={index + 1}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add photo"
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
              count={`${titleCount} / 80`}
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
                        {serviceFlowDraft.provider}
                      </VemtapText>
                      <Icon name="verified" size={16} color={colors.primary} />
                    </View>
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {serviceFlowDraft.providerLocation}
                    </VemtapText>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change listed provider"
                  className="min-h-11 shrink-0 justify-center rounded-field px-2 active:bg-surface-container"
                >
                  <VemtapText variant="labelSm" tone="brand" className="font-sans-medium">
                    Change
                  </VemtapText>
                </Pressable>
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
              value={serviceFlowDraft.primaryCategory}
              actionLabel="Change"
            />
            <ServiceSettingRow
              icon="facialCategory"
              label="Sub-Category"
              value={serviceFlowDraft.subCategory}
              actionLabel="Change"
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
              value={serviceFlowDraft.description}
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
