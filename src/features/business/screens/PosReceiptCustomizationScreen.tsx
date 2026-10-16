import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { BusinessPanel } from '@features/business/components/BusinessOpsPrimitives';
import {
  BusinessSettingRow,
  BusinessTotalsRow,
} from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import type { PosSettings, PosSettingsUpdate } from '@api/posApi';
import { usePosSettingsDraft } from '@features/business/hooks/usePosSettingsDraft';
import type { ReceiptView } from '@features/business/utils/posMappers';

const copy = strings.posReceiptCustomization;

const TRIGGERS = ['sale', 'refund', 'kitchen'] as const;

export interface PosReceiptCustomizationScreenProps {
  settings?: PosSettings;
  businessName: string;
  /** The latest real sale, used for the preview lines; null before the first sale. */
  sample: ReceiptView | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isSaving?: boolean;
  canEdit?: boolean;
  onBack?: () => void;
  onSave?: (update: PosSettingsUpdate) => void;
}

/** Receipt header, footer and print triggers, with a preview of the next receipt. */
export function PosReceiptCustomizationScreen({
  settings,
  isLoading,
  isError,
  onRetry,
  onBack,
  ...formProps
}: PosReceiptCustomizationScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack }}
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
        <ReceiptForm {...formProps} settings={settings} />
      )}
    </BusinessScreenLayout>
  );
}

function ReceiptForm({
  settings,
  businessName,
  sample,
  isSaving,
  canEdit = true,
  onSave,
}: Omit<
  PosReceiptCustomizationScreenProps,
  'isLoading' | 'isError' | 'onRetry' | 'onBack'
> & { settings: PosSettings }) {
  const { draft, dirty, value, set } = usePosSettingsDraft(settings);
  const triggers = value('autoPrintOn');
  const width = value('receiptWidth');

  return (
    <>
      <BusinessPanel title={copy.settingsTitle} icon="receiptLong">
        <Input
          label={copy.headerLabel}
          value={value('receiptHeader')}
          editable={canEdit}
          onChangeText={text => set('receiptHeader', text)}
        />
        <Input
          label={copy.addressLabel}
          value={value('receiptAddress')}
          editable={canEdit}
          onChangeText={text => set('receiptAddress', text)}
        />
        <Input
          label={copy.phoneLabel}
          value={value('receiptPhone')}
          keyboardType="phone-pad"
          editable={canEdit}
          onChangeText={text => set('receiptPhone', text)}
        />
        <Input
          label={copy.footerLabel}
          value={value('receiptFooter')}
          editable={canEdit}
          onChangeText={text => set('receiptFooter', text)}
          multiline
        />
        <BusinessSettingRow
          title={copy.logoTitle}
          trailing="switch"
          switchValue={value('showLogo')}
          onSwitchChange={next => set('showLogo', next)}
        />
        <VemtapText variant="labelSm" className="font-sans-semibold">
          {copy.widthTitle}
        </VemtapText>
        <View className="flex-row gap-2">
          {([58, 80] as const).map(option => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: width === option }}
              accessibilityLabel={copy.widthOption(option)}
              onPress={() => set('receiptWidth', option)}
              className={`min-h-10 flex-1 items-center justify-center rounded-field ${width === option ? 'bg-primary' : 'bg-surface-container'}`}
            >
              <VemtapText
                variant="labelSm"
                className={`font-sans-semibold ${width === option ? 'text-surface' : ''}`}
              >
                {copy.widthOption(option)}
              </VemtapText>
            </Pressable>
          ))}
        </View>
      </BusinessPanel>

      <BusinessPanel className="mt-3" title={copy.printTitle} icon="printReceipt">
        <BusinessSettingRow
          title={copy.autoPrintTitle}
          trailing="switch"
          switchValue={value('autoPrintReceipt')}
          onSwitchChange={next => set('autoPrintReceipt', next)}
        />
        {TRIGGERS.map(trigger => (
          <BusinessSettingRow
            key={trigger}
            title={copy.triggers[trigger]}
            trailing="switch"
            switchValue={triggers.includes(trigger)}
            onSwitchChange={on =>
              set(
                'autoPrintOn',
                on ? [...triggers, trigger] : triggers.filter(item => item !== trigger),
              )
            }
          />
        ))}
        <BusinessSettingRow
          title={copy.kitchenChitsTitle}
          trailing="switch"
          switchValue={value('printKitchenChits')}
          onSwitchChange={next => set('printKitchenChits', next)}
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.previewTitle}
        icon="visibility"
        badge={copy.widthOption(width)}
        badgeTone="neutral"
      >
        <View className="gap-1.5 rounded-field border border-border bg-surface p-3">
          <VemtapText
            variant="labelMd"
            className="text-center font-sans-bold"
            numberOfLines={2}
          >
            {businessName}
          </VemtapText>
          {value('receiptHeader') ? (
            <VemtapText
              variant="caption"
              tone="secondary"
              className="text-center"
              numberOfLines={2}
            >
              {value('receiptHeader')}
            </VemtapText>
          ) : null}
          {[
            value('receiptAddress'),
            value('receiptPhone'),
            settings.tin ? `TIN ${settings.tin}` : '',
          ]
            .filter(Boolean)
            .map(line => (
              <VemtapText
                key={line}
                variant="micro"
                tone="tertiary"
                className="text-center"
                numberOfLines={2}
              >
                {line}
              </VemtapText>
            ))}
          {sample ? (
            <View className="mt-2 gap-1 border-t border-dashed border-border pt-2">
              <VemtapText variant="micro" tone="tertiary">
                {`${sample.receiptNumber} • ${sample.when}`}
              </VemtapText>
              {sample.lines.map(line => (
                <BusinessTotalsRow
                  key={line.id}
                  label={`${line.qty}× ${line.name}`}
                  value={line.price}
                />
              ))}
              {sample.totals.map(row => (
                <BusinessTotalsRow
                  key={row.id}
                  label={row.label}
                  value={row.value}
                  tone={row.tone}
                />
              ))}
              <BusinessTotalsRow
                label={copy.totalDueLabel}
                value={sample.amount}
                tone="strong"
              />
            </View>
          ) : (
            <VemtapText variant="micro" tone="tertiary" className="mt-2 text-center">
              {copy.noSample}
            </VemtapText>
          )}
          {value('receiptFooter') ? (
            <VemtapText
              variant="caption"
              tone="secondary"
              className="mt-2 text-center"
              numberOfLines={3}
            >
              {value('receiptFooter')}
            </VemtapText>
          ) : null}
          <VemtapText variant="micro" tone="tertiary" className="text-center">
            {copy.poweredLabel}
          </VemtapText>
        </View>
        {!canEdit ? <BusinessStatusPill label={copy.readOnly} tone="neutral" /> : null}
      </BusinessPanel>

      <View className="mt-4">
        <Button
          label={copy.saveCta}
          labelVariant="labelMd"
          disabled={!dirty || !canEdit}
          loading={isSaving}
          onPress={() => onSave?.(draft)}
        />
      </View>
    </>
  );
}
