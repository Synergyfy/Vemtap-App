import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import {
  CentralCatalogueScreen,
  type CentralCatalogueItemRow,
} from '@features/business/screens/CentralCatalogueScreen';

afterEach(cleanup);

const copy = strings.centralCatalogue;

const row = (
  id: string,
  title: string,
  kind: 'product' | 'service',
  status = 'Standard Menu',
): CentralCatalogueItemRow => ({
  id,
  kind,
  title,
  sku: '',
  category: '',
  price: '₦1,000',
  status,
  location: '',
});

const items = [
  row('p1', 'Jollof Bowl', 'product'),
  row('p2', 'Draft Burger', 'product', 'Draft / Paused'),
];

const services = [
  {
    id: 's1',
    name: 'Deep Tissue Massage',
    eyebrow: 'Wellness',
    tag: 'Service',
    price: '₦15,000',
    duration: '60 mins',
    status: 'Live',
    note: '',
  },
];

async function pressTab(view: Awaited<ReturnType<typeof render>>, label: string) {
  const tab = view
    .getAllByRole('tab')
    .find(node => String(node.props.accessibilityLabel ?? '').startsWith(label));
  await act(async () => {
    fireEvent.press(tab ?? view.getByText(label));
  });
}

describe('Central catalogue tabs', () => {
  it('splits live items into Products and Services', async () => {
    const view = await render(
      <CentralCatalogueScreen items={items} services={services} categories={[]} />,
    );
    expect(view.queryByText('Jollof Bowl')).toBeTruthy();
    expect(view.queryByText('Deep Tissue Massage')).toBeNull();

    await pressTab(view, 'Services');
    expect(view.queryByText('Deep Tissue Massage')).toBeTruthy();
    expect(view.queryByText('Jollof Bowl')).toBeNull();
  });

  it('lists categories on the Categories tab', async () => {
    const view = await render(
      <CentralCatalogueScreen
        items={items}
        categories={[
          {
            id: 'c1',
            title: 'Grills',
            count: '2 items',
            type: 'Catalogue',
            accent: 'brand',
            icon: 'folder',
          },
        ]}
      />,
    );
    await pressTab(view, 'Categories');
    expect(view.queryByText('Grills')).toBeTruthy();
    expect(view.queryByText('Jollof Bowl')).toBeNull();
  });

  it('filters drafts instead of always showing nothing', async () => {
    const view = await render(
      <CentralCatalogueScreen items={items} services={services} categories={[]} />,
    );
    await act(async () => {
      fireEvent.press(view.getByText('Drafts'));
    });
    expect(view.queryByText('Draft Burger')).toBeTruthy();
    expect(view.queryByText('Jollof Bowl')).toBeNull();
  });

  it('offers the live branches in the scope picker and reports the pick', async () => {
    const onChangeScope = jest.fn();
    const view = await render(
      <CentralCatalogueScreen
        items={items}
        categories={[]}
        scope="all"
        onChangeScope={onChangeScope}
        scopeOptions={[
          { label: copy.allLocationsCount(1), value: 'all' },
          { label: 'Garki Branch', value: 'branch-1' },
        ]}
      />,
    );
    await act(async () => {
      fireEvent.press(view.getByLabelText(copy.allLocationsCount(1)));
    });
    await act(async () => {
      fireEvent.press(view.getByLabelText('Garki Branch'));
    });
    expect(onChangeScope).toHaveBeenCalledWith('branch-1');
  });
});

describe('Central catalogue Services tab', () => {
  it('renders live services in the service card, not products', async () => {
    const view = await render(
      <CentralCatalogueScreen
        items={[row('p1', 'Jollof Bowl', 'product')]}
        services={[
          {
            id: 's1',
            name: 'Deep Tissue Massage',
            eyebrow: 'Wellness',
            tag: 'Service',
            price: '₦15,000',
            duration: '60 mins',
            status: 'Draft',
            note: 'Bring a towel',
          },
        ]}
        categories={[]}
      />,
    );
    await pressTab(view, 'Services');
    expect(view.queryByText('Deep Tissue Massage')).toBeTruthy();
    expect(view.queryByText('60 mins')).toBeTruthy();
    expect(view.queryByText('Bring a towel')).toBeTruthy();
    expect(view.queryByText('Jollof Bowl')).toBeNull();

    await act(async () => {
      fireEvent.press(view.getByText('Active & Published'));
    });
    expect(view.queryByText('Deep Tissue Massage')).toBeNull();
  });
});

describe('Central catalogue publish switch', () => {
  const switchFor = (view: Awaited<ReturnType<typeof render>>, title: string) =>
    view.getByLabelText(copy.publishToggleLabel(title));

  it('starts from the saved status and reports the new one', async () => {
    const onToggleStock = jest.fn(() => Promise.resolve());
    const view = await render(
      <CentralCatalogueScreen
        items={items}
        categories={[]}
        onToggleStock={onToggleStock}
      />,
    );
    expect(switchFor(view, 'Jollof Bowl').props.value).toBe(true);
    expect(switchFor(view, 'Draft Burger').props.value).toBe(false);

    await act(async () => {
      fireEvent(switchFor(view, 'Draft Burger'), 'valueChange', true);
    });
    expect(onToggleStock).toHaveBeenCalledWith('p2', true);
    expect(switchFor(view, 'Draft Burger').props.value).toBe(true);
  });

  it('flips back when the save fails', async () => {
    const onToggleStock = jest.fn(() => Promise.reject(new Error('offline')));
    const view = await render(
      <CentralCatalogueScreen
        items={items}
        categories={[]}
        onToggleStock={onToggleStock}
      />,
    );
    await act(async () => {
      fireEvent(switchFor(view, 'Jollof Bowl'), 'valueChange', false);
    });
    expect(switchFor(view, 'Jollof Bowl').props.value).toBe(true);
  });
});
