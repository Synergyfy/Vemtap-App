import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import {
  BusinessCheckRow,
  BusinessHeaderDots,
  BusinessProductImage,
  BusinessProgress,
  BusinessScreenLayout,
  BusinessSectionHeading,
  BusinessSelectField,
  BusinessStatusPill,
  BusinessSwitchRow,
  BusinessTextArea,
  SetupCard,
} from '@features/business/components/BusinessPrimitives';
import {
  businessMedia,
  productBranches,
  productIdentity,
} from '@features/business/data/businessSetupData';

export type ProductLocationPricingValue = {
  productName: string;
  category: string;
  description: string;
  selectedBranchIds: string[];
  pricingMode: 'uniform' | 'branch';
  inStock: boolean;
};

export interface AddProductLocationPricingScreenProps {
  onBack: () => void;
  onSave?: (value: ProductLocationPricingValue) => void;
  onDiscard?: () => void;
  onChangePhoto?: () => void;
  onSelectCategory?: () => void;
}

export function AddProductLocationPricingScreen({
  onBack,
  onSave,
  onDiscard,
  onChangePhoto,
  onSelectCategory,
}: AddProductLocationPricingScreenProps) {
  const [productName, setProductName] = useState<string>(productIdentity.name);
  const [category, setCategory] = useState<string>(productIdentity.category);
  const [description, setDescription] = useState<string>(
    productIdentity.locationDescription,
  );
  const [selectedBranchIds, setSelectedBranchIds] = useState(['wuse', 'garki']);
  const [pricingMode, setPricingMode] = useState<'uniform' | 'branch'>('branch');
  const [inStock, setInStock] = useState(true);

  const toggleBranch = (id: string) => {
    setSelectedBranchIds(current =>
      current.includes(id)
        ? current.filter(branchId => branchId !== id)
        : [...current, id],
    );
  };

  const save = () => {
    onSave?.({
      productName,
      category,
      description,
      selectedBranchIds,
      pricingMode,
      inStock,
    });
  };

  return (
    <BusinessScreenLayout
      header={{
        title: 'Location Details',
        onBack,
        accessory: <BusinessHeaderDots activeCount={1} />,
      }}
      contentContainerClassName="gap-5 pb-8"
    >
      <View className="gap-4">
        <View className="gap-2">
          <View className="flex-row items-center justify-between gap-2">
            <VemtapText className="min-w-0 flex-1 font-sans-semibold text-label-sm uppercase tracking-wide text-primary">
              Step 3 of 4 • New Product
            </VemtapText>
            <BusinessStatusPill label="Draft Auto-saved" tone="success" />
          </View>
          <BusinessProgress label="" percent={75} />
        </View>
        <View className="gap-1">
          <VemtapText
            accessibilityRole="header"
            variant="headingMd"
            className="text-heading-md"
          >
            Add Product
          </VemtapText>
          <VemtapText tone="secondary">
            Define product details, select branch availability, and configure
            location-specific pricing.
          </VemtapText>
        </View>
      </View>

      <SetupCard>
        <View className="flex-row items-center justify-between gap-3">
          <BusinessSectionHeading title="General Details" icon="dining" />
          <VemtapText variant="caption" tone="tertiary">
            Core Item
          </VemtapText>
        </View>
        <View className="flex-row items-center gap-4 rounded-lg bg-surface-subtle p-3">
          <View className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container shadow-sm">
            <BusinessProductImage
              source={businessMedia.ribeyeCover}
              alt="Woodfire aged ribeye steak prepared for the product catalogue"
              className="h-full w-full"
            />
            <View className="absolute bottom-1 right-1 h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm">
              <Icon name="check" size={12} color={colors.surface} />
            </View>
          </View>
          <View className="min-w-0 flex-1">
            <VemtapText variant="labelMd" numberOfLines={1}>
              woodfire-ribeye-final.jpg
            </VemtapText>
            <VemtapText variant="caption" tone="secondary">
              1080 x 1080px • JPEG
            </VemtapText>
            <Button
              label="Change Photo"
              labelVariant="labelSm"
              variant="secondary"
              size="sm"
              fullWidth={false}
              className="mb-2 min-h-9 self-start rounded-md border-0 bg-surface-container-high px-3"
              leftIcon={<Icon name="camera" size={16} color={colors.primary} />}
              onPress={onChangePhoto}
            />
          </View>
        </View>
        <View className="gap-3.5">
          <Input
            label="Product Name"
            value={productName}
            onChangeText={setProductName}
            accessibilityLabel="Product Name"
            containerClassName="gap-1.5"
            className="bg-surface-subtle"
            fieldClassName="bg-surface-subtle"
          />
          <BusinessSelectField
            label="Category"
            value={category}
            leadingIcon="category"
            onPress={() => {
              onSelectCategory?.();
              setCategory(productIdentity.category);
            }}
          />
          <BusinessTextArea
            label="Description"
            value={description}
            onChangeText={setDescription}
            accessibilityLabel="Description"
            counter="118 / 200"
            minHeight={112}
          />
        </View>
      </SetupCard>

      <SetupCard>
        <BusinessSectionHeading
          title="Where is this product available?"
          icon="storefront"
          subtitle="Select which branches stock or prepare this item."
        />
        <View className="gap-2.5">
          {productBranches.map(branch => (
            <BusinessCheckRow
              key={branch.id}
              title={branch.name}
              subtitle={branch.address}
              badge={branch.badge}
              selected={selectedBranchIds.includes(branch.id)}
              onPress={() => toggleBranch(branch.id)}
            />
          ))}
        </View>
      </SetupCard>

      <SetupCard>
        <View className="gap-1">
          <BusinessSectionHeading
            title="Pricing Configuration"
            icon="payments"
            trailing={
              <BusinessStatusPill label="Per-Branch Mode" tone="brandHigh" icon="tune" />
            }
          />
          <VemtapText variant="caption" tone="secondary">
            Adapt retail menu costs to distinct regional supply or delivery overheads.
          </VemtapText>
        </View>
        <View className="gap-2.5">
          <BusinessCheckRow
            type="radio"
            title="Use the same price at all selected locations"
            selected={pricingMode === 'uniform'}
            onPress={() => setPricingMode('uniform')}
          />
          <BusinessCheckRow
            type="radio"
            title="Set different prices per location"
            subtitle="Recommended for varying logistics, logistics surcharges, or mall tenant rents."
            selected={pricingMode === 'branch'}
            onPress={() => setPricingMode('branch')}
          />
        </View>
      </SetupCard>

      <SetupCard>
        <BusinessSwitchRow
          icon="inventory"
          title="In Stock & Ready for Orders"
          subtitle="Enables immediate customer purchasing across selected stores"
          value={inStock}
          onValueChange={setInStock}
          activeTone="success"
        />
      </SetupCard>

      <View className="gap-3 pt-2">
        <Button
          label="Save Product & Availability"
          labelVariant="labelMd"
          className="shadow-lg"
          rightIcon={<Icon name="arrowForward" size={20} color={colors.surface} />}
          onPress={save}
        />
        <Button
          label="Cancel and Discard Changes"
          labelVariant="labelMd"
          variant="ghost"
          className="min-h-11"
          onPress={onDiscard}
        />
      </View>
    </BusinessScreenLayout>
  );
}
