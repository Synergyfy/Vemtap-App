import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import {
  BusinessInfoStrip,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';
import type { PosSettings, PosSettingsUpdate } from '@api/posApi';
import {
  toNumber,
  usePosSettingsDraft,
} from '@features/business/hooks/usePosSettingsDraft';

const copy = strings.taxesSurcharges;

export interface TaxesSurchargesScreenProps {
  settings?: PosSettings;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isSaving?: boolean;
  canEdit?: boolean;
  onBack?: () => void;
  onApply?: (update: PosSettingsUpdate) => void;
}

/** VAT, service and packaging surcharges, and the public QR ordering rules. */
export function TaxesSurchargesScreen({
  settings,
  isLoading,
  isError,
  onRetry,
  onBack,
  ...formProps
}: TaxesSurchargesScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack, titleVariant: 'labelMd' }}
      contentContainerClassName="pb-8"
    >
      {!settings ? (
        isError ? (
          <ErrorState
            title={copy.error.title}
            description={copy.error.body}
            onRetry={onRetry}
          />
        ) : (
          <LoadingState label={isLoading ? copy.loading : undefined} />
        )
      ) : (
        <TaxesForm {...formProps} settings={settings} />
      )}
    </BusinessScreenLayout>
  );
}

function TaxesForm({
  settings,
  isSaving,
  canEdit = true,
  onApply,
}: Omit<TaxesSurchargesScreenProps, 'isLoading' | 'isError' | 'onRetry' | 'onBack'> & {
  settings: PosSettings;
}) {
  const { draft, dirty, value, set } = usePosSettingsDraft(settings);
  const inclusive = value('pricesIncludeTax');

  return (
    <>
      <View className="gap-1">
        <VemtapText variant="headingLg" className="text-heading-lg" numberOfLines={1}>
          {copy.title}
        </VemtapText>
        <VemtapText variant="caption" tone="secondary" numberOfLines={2}>
          {copy.subtitle}
        </VemtapText>
      </View>

      <BusinessPanel className="mt-3" title={copy.statutoryTitle} icon="accountBalance">
        <BusinessSettingRow
          title={copy.vatEnabledTitle}
          subtitle={copy.vatEnabledBody}
          trailing="switch"
          switchValue={value('taxEnabled')}
          onSwitchChange={next => set('taxEnabled', next)}
        />
        <Input
          label={copy.vatTitle}
          keyboardType="decimal-pad"
          value={String(value('taxRate'))}
          editable={canEdit}
          onChangeText={text => set('taxRate', toNumber(text))}
        />
        <Input
          label={copy.taxLabelTitle}
          value={value('taxLabel')}
          editable={canEdit}
          onChangeText={text => set('taxLabel', text)}
        />
        <VemtapText variant="labelSm" className="mt-1 font-sans-semibold">
          {copy.applicationTitle}
        </VemtapText>
        <View className="gap-2">
          {[
            {
              id: 'exclusive',
              included: false,
              title: copy.exclusiveTitle,
              body: copy.exclusiveBody,
            },
            {
              id: 'inclusive',
              included: true,
              title: copy.inclusiveTitle,
              body: copy.inclusiveBody,
            },
          ].map(option => {
            const selected = inclusive === option.included;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.title}
                onPress={() => set('pricesIncludeTax', option.included)}
                className={`flex-row items-center gap-2.5 rounded-field p-2.5 ${selected ? 'bg-surface-tint' : 'bg-surface-subtle'}`}
              >
                <Icon
                  name={selected ? 'checkCircle' : 'radioButtonUnchecked'}
                  size={18}
                  color={selected ? colors.primary : colors.textTertiary}
                />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {option.title}
                  </VemtapText>
                  <VemtapText variant="micro" tone="secondary" numberOfLines={2}>
                    {option.body}
                  </VemtapText>
                </View>
              </Pressable>
            );
          })}
        </View>
        <BusinessSettingRow
          title={copy.exemptionTitle}
          subtitle={copy.exemptionBody}
          trailing="switch"
          switchValue={value('takeawayVatExempt')}
          onSwitchChange={next => set('takeawayVatExempt', next)}
        />
        <Input
          label={copy.tinLabel}
          value={value('tin')}
          editable={canEdit}
          onChangeText={text => set('tin', text)}
        />
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.serviceTitle} icon="roomService">
        <BusinessSettingRow
          title={copy.serviceChargeTitle}
          subtitle={copy.serviceChargeBody}
          trailing="switch"
          switchValue={value('serviceChargeEnabled')}
          onSwitchChange={next => set('serviceChargeEnabled', next)}
        />
        <Input
          label={copy.serviceRateLabel}
          keyboardType="decimal-pad"
          value={String(value('serviceChargeRate'))}
          editable={canEdit}
          onChangeText={text => set('serviceChargeRate', toNumber(text))}
        />
        <BusinessSettingRow
          title={copy.serviceWaiverTitle}
          trailing="switch"
          switchValue={value('serviceChargeWaivable')}
          onSwitchChange={next => set('serviceChargeWaivable', next)}
        />
        <Input
          label={copy.packagingTitle}
          keyboardType="numeric"
          value={String(value('packagingFee'))}
          editable={canEdit}
          onChangeText={text => set('packagingFee', toNumber(text))}
        />
        <BusinessSettingRow
          title={copy.packagingAutoTitle}
          trailing="switch"
          switchValue={value('packagingAutoApply')}
          onSwitchChange={next => set('packagingAutoApply', next)}
        />
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.qrTitle} icon="qrCode">
        <BusinessSettingRow
          title={copy.selfOrderTitle}
          subtitle={copy.selfOrderBody}
          trailing="switch"
          switchValue={value('selfOrderingEnabled')}
          onSwitchChange={next => set('selfOrderingEnabled', next)}
        />
        <Input
          label={copy.maxOrderTitle}
          keyboardType="numeric"
          value={value('maxQrOrderValue') ? String(value('maxQrOrderValue')) : ''}
          placeholder={copy.noLimit}
          editable={canEdit}
          onChangeText={text => set('maxQrOrderValue', toNumber(text))}
        />
        <BusinessSettingRow
          title={copy.rushTitle}
          subtitle={copy.rushBody}
          trailing="switch"
          switchValue={value('rushPause')}
          onSwitchChange={next => set('rushPause', next)}
        />
      </BusinessPanel>

      <BusinessInfoStrip
        className="mt-3"
        icon="info"
        title={copy.auditTitle}
        body={copy.auditBody}
        tone="subtle"
      />

      <View className="mt-4 gap-2">
        <Button
          label={copy.applyCta}
          labelVariant="labelMd"
          disabled={!dirty || !canEdit}
          loading={isSaving}
          onPress={() => onApply?.(draft)}
        />
        {!canEdit ? (
          <VemtapText variant="micro" tone="tertiary" className="text-center">
            {copy.applyNote}
          </VemtapText>
        ) : null}
      </View>
    </>
  );
}
