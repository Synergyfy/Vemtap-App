import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@components/ui/Button';
import { BottomSheet } from '@components/shared/BottomSheet';
import { ErrorState } from '@components/shared/ErrorState';
import { LoadingState } from '@components/shared/LoadingState';
import { Icon, type IconName } from '@components/ui/Icon';
import { Input } from '@components/ui/Input';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import {
  BusinessChipScroller,
  BusinessCountChip,
  BusinessIconWell,
  BusinessPanel,
} from '@features/business/components/BusinessOpsPrimitives';
import { BusinessSettingRow } from '@features/business/components/BusinessPosPrimitives';
import {
  BusinessScreenLayout,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import type {
  PeripheralConnection,
  PeripheralType,
  PosSettings,
  PosSettingsUpdate,
} from '@api/posApi';
import {
  toNumber,
  usePosSettingsDraft,
} from '@features/business/hooks/usePosSettingsDraft';

const copy = strings.paymentHardwareSetup;

const TYPES: PeripheralType[] = [
  'card_terminal',
  'printer',
  'cash_drawer',
  'scanner',
  'kds',
  'customer_display',
];
const CONNECTIONS: PeripheralConnection[] = ['ip', 'bluetooth', 'usb'];

const typeIcon: Record<PeripheralType, IconName> = {
  card_terminal: 'creditCard',
  printer: 'printReceipt',
  cash_drawer: 'pointOfSale',
  scanner: 'barcodeScan',
  kds: 'roomService',
  customer_display: 'devices',
};

const statusTone = {
  connected: 'success',
  disconnected: 'neutral',
  error: 'tertiary',
} as const;

export interface PeripheralView {
  id: string;
  type: PeripheralType;
  name: string;
  meta: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface NewPeripheralInput {
  type: PeripheralType;
  name: string;
  model?: string;
  connection: PeripheralConnection;
  address?: string;
}

export interface PaymentHardwareSetupScreenProps {
  settings?: PosSettings;
  devices?: PeripheralView[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isSaving?: boolean;
  canEdit?: boolean;
  onBack?: () => void;
  onSaveRails?: (update: PosSettingsUpdate) => void;
  onAddDevice?: (input: NewPeripheralInput) => void;
  onRemoveDevice?: (id: string) => void;
}

/** Tender rails the till offers and the devices configured at this branch. */
export function PaymentHardwareSetupScreen({
  settings,
  devices,
  isLoading,
  isError,
  onRetry,
  onBack,
  ...formProps
}: PaymentHardwareSetupScreenProps) {
  return (
    <BusinessScreenLayout
      header={{ title: copy.headerTitle, onBack, titleVariant: 'labelMd' }}
      contentContainerClassName="pb-8"
    >
      {!settings || !devices ? (
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
        <HardwareForm {...formProps} settings={settings} devices={devices} />
      )}
    </BusinessScreenLayout>
  );
}

function HardwareForm({
  settings,
  devices,
  isSaving,
  canEdit = true,
  onSaveRails,
  onAddDevice,
  onRemoveDevice,
}: Omit<
  PaymentHardwareSetupScreenProps,
  'isLoading' | 'isError' | 'onRetry' | 'onBack'
> & {
  settings: PosSettings;
  devices: PeripheralView[];
}) {
  const { draft, dirty, rails, setRails } = usePosSettingsDraft(settings);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<PeripheralType>('printer');
  const [connection, setConnection] = useState<PeripheralConnection>('ip');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [address, setAddress] = useState('');

  return (
    <>
      <BusinessPanel title={copy.methodsTitle} icon="payments">
        <BusinessSettingRow
          title={copy.cashTitle}
          subtitle={copy.cashBody}
          trailing="switch"
          switchValue={rails.cash}
          onSwitchChange={next => canEdit && setRails({ cash: next })}
        />
        <BusinessSettingRow
          title={copy.cardTitle}
          subtitle={copy.cardBody}
          trailing="switch"
          switchValue={rails.card}
          onSwitchChange={next => canEdit && setRails({ card: next })}
        />
        <BusinessSettingRow
          title={copy.bankTitle}
          subtitle={copy.bankBody}
          trailing="switch"
          switchValue={Boolean(rails.transfer.enabled)}
          onSwitchChange={next => canEdit && setRails({ transfer: { enabled: next } })}
        />
        {rails.transfer.enabled ? (
          <>
            <Input
              label={copy.bankNameLabel}
              value={rails.transfer.bankName}
              editable={canEdit}
              onChangeText={text => setRails({ transfer: { bankName: text } })}
            />
            <Input
              label={copy.accountNumberLabel}
              keyboardType="number-pad"
              value={rails.transfer.accountNumber}
              editable={canEdit}
              onChangeText={text =>
                setRails({
                  transfer: { accountNumber: text.replace(/\D/g, '').slice(0, 10) },
                })
              }
            />
            <Input
              label={copy.accountNameLabel}
              value={rails.transfer.accountName}
              editable={canEdit}
              onChangeText={text => setRails({ transfer: { accountName: text } })}
            />
          </>
        ) : null}
        <BusinessSettingRow
          title={copy.oneTapTitle}
          subtitle={copy.oneTapBody}
          trailing="switch"
          switchValue={rails.oneTap}
          onSwitchChange={next => canEdit && setRails({ oneTap: next })}
        />
        <BusinessSettingRow
          title={copy.houseTabTitle}
          subtitle={copy.houseTabBody}
          trailing="switch"
          switchValue={Boolean(rails.houseTab.enabled)}
          onSwitchChange={next => canEdit && setRails({ houseTab: { enabled: next } })}
        />
        {rails.houseTab.enabled ? (
          <Input
            label={copy.houseTabLimitLabel}
            keyboardType="numeric"
            value={rails.houseTab.limit ? String(rails.houseTab.limit) : ''}
            editable={canEdit}
            onChangeText={text => setRails({ houseTab: { limit: toNumber(text) } })}
          />
        ) : null}
        <Button
          label={copy.saveCta}
          labelVariant="labelMd"
          disabled={!dirty || !canEdit}
          loading={isSaving}
          onPress={() => onSaveRails?.(draft)}
        />
      </BusinessPanel>

      <BusinessPanel
        className="mt-3"
        title={copy.hardwareTitle}
        icon="devices"
        badge={copy.hardwareBadge(devices.length)}
        badgeTone="brand"
      >
        {devices.length ? (
          <View className="gap-2">
            {devices.map(device => (
              <View
                key={device.id}
                className="flex-row items-center gap-2.5 rounded-field bg-surface-subtle p-2.5"
              >
                <BusinessIconWell
                  icon={typeIcon[device.type] ?? 'devices'}
                  tone="brand"
                  size="sm"
                />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelSm"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {device.name}
                  </VemtapText>
                  <VemtapText variant="micro" tone="tertiary" numberOfLines={2}>
                    {device.meta}
                  </VemtapText>
                </View>
                <BusinessStatusPill
                  label={copy.status[device.status]}
                  tone={statusTone[device.status]}
                />
                {canEdit ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.removeCta} ${device.name}`}
                    onPress={() => onRemoveDevice?.(device.id)}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container"
                  >
                    <Icon name="delete" size={15} color={colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <VemtapText variant="caption" tone="secondary">
            {copy.empty.body}
          </VemtapText>
        )}
        {canEdit ? (
          <Button
            label={copy.pairCta}
            labelVariant="labelSm"
            variant="secondary"
            onPress={() => setAdding(true)}
          />
        ) : null}
      </BusinessPanel>

      <BottomSheet visible={adding} onClose={() => setAdding(false)} title={copy.pairCta}>
        <View className="gap-3">
          <BusinessChipScroller>
            {TYPES.map(option => (
              <BusinessCountChip
                key={option}
                label={copy.types[option]}
                selected={type === option}
                onPress={() => setType(option)}
              />
            ))}
          </BusinessChipScroller>
          <Input label={copy.deviceNameLabel} value={name} onChangeText={setName} />
          <Input label={copy.deviceModelLabel} value={model} onChangeText={setModel} />
          <BusinessChipScroller>
            {CONNECTIONS.map(option => (
              <BusinessCountChip
                key={option}
                label={copy.connections[option]}
                selected={connection === option}
                onPress={() => setConnection(option)}
              />
            ))}
          </BusinessChipScroller>
          <Input
            label={copy.deviceAddressLabel}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
          />
          <Button
            label={copy.addDeviceCta}
            disabled={!name.trim()}
            onPress={() => {
              onAddDevice?.({
                type,
                name: name.trim(),
                model: model.trim() || undefined,
                connection,
                address: address.trim() || undefined,
              });
              setAdding(false);
              setName('');
              setModel('');
              setAddress('');
            }}
          />
        </View>
      </BottomSheet>
    </>
  );
}
