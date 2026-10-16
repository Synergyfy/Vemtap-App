import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { posSettingsSchema } from '@api/posApi';
import { PosGeneralSettingsScreen } from '@features/business/screens/PosGeneralSettingsScreen';
import { TaxesSurchargesScreen } from '@features/business/screens/TaxesSurchargesScreen';
import { StaffPermissionsPasscodesScreen } from '@features/business/screens/StaffPermissionsPasscodesScreen';
import { PaymentHardwareSetupScreen } from '@features/business/screens/PaymentHardwareSetupScreen';

afterEach(cleanup);

const press = (element: Parameters<typeof fireEvent.press>[0]) =>
  act(async () => {
    fireEvent.press(element);
  });
const type = (element: Parameters<typeof fireEvent.changeText>[0], text: string) =>
  act(async () => {
    fireEvent.changeText(element, text);
  });

const settings = posSettingsSchema.parse({
  taxEnabled: true,
  taxRate: 7.5,
  serviceChargeEnabled: false,
  permissions: { refundRequiresPin: true, discountMaxPercent: 10 },
  tenderRails: {
    transfer: { enabled: true, bankName: 'Wema', accountNumber: '0123456789' },
  },
});

describe('pos general settings', () => {
  it('shows each area with its value and opens it', async () => {
    const copy = strings.posGeneralSettings;
    const onOpenSetting = jest.fn();
    const view = await render(
      <PosGeneralSettingsScreen
        onOpenSetting={onOpenSetting}
        view={{
          venue: 'Test Kitchen',
          branch: 'Branch One',
          online: true,
          values: {
            receipt: '80mm',
            hardware: '2 devices',
            payments: '3 methods',
            taxes: 'VAT 7.5%',
            'public-pos': 'On',
            offline: 'Synced',
            kitchen: 'Open',
            tills: '1 till • 1 open',
            security: 'PIN guard • 1 PIN',
          },
          telemetry: [{ id: 'tables', label: copy.telemetry.tables, value: '12' }],
        }}
      />,
    );
    expect(view.getByText('VAT 7.5%')).toBeTruthy();
    await press(view.getByLabelText(copy.links.taxes.title));
    expect(onOpenSetting).toHaveBeenCalledWith('taxes');
  });
});

describe('taxes & surcharges', () => {
  const copy = strings.taxesSurcharges;

  it('saves only the fields that changed', async () => {
    const onApply = jest.fn();
    const view = await render(
      <TaxesSurchargesScreen settings={settings} onApply={onApply} />,
    );
    await type(view.getByLabelText(copy.serviceRateLabel), '5');
    await press(view.getByLabelText(copy.inclusiveTitle));
    await press(view.getByText(copy.applyCta));
    expect(onApply).toHaveBeenCalledWith({
      serviceChargeRate: 5,
      pricesIncludeTax: true,
    });
  });

  it('does nothing until something changes', async () => {
    const onApply = jest.fn();
    const view = await render(
      <TaxesSurchargesScreen settings={settings} onApply={onApply} />,
    );
    await press(view.getByText(copy.applyCta));
    expect(onApply).not.toHaveBeenCalled();
  });
});

describe('staff permissions & passcodes', () => {
  const copy = strings.staffPermissionsPasscodes;

  it('saves the discount cap and sets a supervisor PIN', async () => {
    const onSave = jest.fn();
    const onSetPin = jest.fn();
    const view = await render(
      <StaffPermissionsPasscodesScreen
        settings={settings}
        onSave={onSave}
        onSetPin={onSetPin}
        team={[
          {
            userId: 'u1',
            name: 'Sarah Ade',
            initials: 'SA',
            role: 'Manager',
            hasPin: false,
            isSupervisor: false,
            locked: false,
          },
        ]}
        overrides={{ total: 0, recent: [] }}
      />,
    );
    expect(view.getByText(copy.noPinBadge)).toBeTruthy();
    await type(view.getByLabelText(copy.discountPercentLabel), '15');
    await press(view.getByText(copy.saveCta));
    expect(onSave).toHaveBeenCalledWith({ permissions: { discountMaxPercent: 15 } });

    await press(view.getByLabelText('Sarah Ade'));
    await type(await view.findByLabelText(copy.pinLabel), '4821');
    await press(view.getByText(copy.setPinCta));
    expect(onSetPin).toHaveBeenCalledWith('u1', '4821', false);
  });
});

describe('payment & hardware setup', () => {
  const copy = strings.paymentHardwareSetup;

  it('shows transfer details and adds a device', async () => {
    const onAddDevice = jest.fn();
    const view = await render(
      <PaymentHardwareSetupScreen
        settings={settings}
        devices={[]}
        onAddDevice={onAddDevice}
      />,
    );
    expect(view.getByDisplayValue('0123456789')).toBeTruthy();
    await press(view.getByText(copy.pairCta));
    await type(await view.findByLabelText(copy.deviceNameLabel), 'Kitchen printer');
    await press(view.getByText(copy.addDeviceCta));
    expect(onAddDevice).toHaveBeenCalledWith({
      type: 'printer',
      name: 'Kitchen printer',
      model: undefined,
      connection: 'ip',
      address: undefined,
    });
  });
});
