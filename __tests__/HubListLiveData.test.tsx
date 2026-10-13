import React from 'react';
import { cleanup, render, screen } from '@testing-library/react-native';
import type { BusinessCatalogueItem } from '@api/catalogueApi';
import { CentralCatalogueScreen } from '@features/business/screens/CentralCatalogueScreen';
import { CentralDealsManagementScreen } from '@features/business/screens/CentralDealsManagementScreen';
import { ServicesCategoriesManagementScreen } from '@features/business/screens/ServicesCategoriesManagementScreen';
import {
  catalogueCategoryToRow,
  catalogueItemToCentralRow,
  catalogueItemToServiceRow,
  offerToCentralDealRow,
} from '@features/business/utils/catalogueHubRowMappers';

afterEach(cleanup);

const liveItem: BusinessCatalogueItem = {
  id: 'item-1',
  name: 'Buffalo Wing Bucket',
  price: 8500,
  itemType: 'product',
  status: 'active',
  isSuspended: false,
  sku: 'BW-001',
  mainImage: 'https://cdn.test/wings.png',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Chicken' },
  shortDescription: 'Twelve pieces.',
};

describe('catalogueItemToCentralRow', () => {
  test('maps price, sku, category, status and image', () => {
    const row = catalogueItemToCentralRow(liveItem);
    expect(row).toMatchObject({
      id: 'item-1',
      title: 'Buffalo Wing Bucket',
      sku: 'BW-001',
      category: 'Chicken',
      price: '₦8,500',
      status: 'Standard Menu',
    });
    expect(row.image).toEqual({
      uri: 'https://cdn.test/wings.png',
      alt: 'Buffalo Wing Bucket',
    });
  });

  test('inactive items render the Draft / Paused label', () => {
    const row = catalogueItemToCentralRow({ ...liveItem, status: 'inactive' });
    expect(row.status).toBe('Draft / Paused');
  });

  test('out of stock items render the Low Stock label', () => {
    const row = catalogueItemToCentralRow({ ...liveItem, status: 'out_of_stock' });
    expect(row.status).toBe('Low Stock');
  });

  test('services render the service label', () => {
    const row = catalogueItemToCentralRow({ ...liveItem, itemType: 'service' });
    expect(row.status).toBe('Standard Menu');
  });
});

describe('catalogueItemToServiceRow', () => {
  test('maps a service item to the services row shape', () => {
    const row = catalogueItemToServiceRow({
      ...liveItem,
      itemType: 'service',
      duration: '60 mins',
    });
    expect(row).toMatchObject({
      id: 'item-1',
      name: 'Buffalo Wing Bucket',
      price: '₦8,500',
      duration: '60 mins',
      tag: 'Service',
      status: 'Live',
      eyebrow: 'Chicken',
    });
  });
});

describe('catalogueCategoryToRow', () => {
  test('maps a catalogue category to the row shape', () => {
    const row = catalogueCategoryToRow({
      id: 'cat-1',
      name: 'Chicken',
      businessId: 'biz-1',
    });
    expect(row).toMatchObject({
      id: 'cat-1',
      title: 'Chicken',
      accent: 'brand',
      icon: 'folder',
    });
  });
});

describe('offerToCentralDealRow', () => {
  test('maps a percentage discount offer', () => {
    const row = offerToCentralDealRow({
      id: 'offer-1',
      name: 'Weekend Wings',
      description: 'Half price buckets',
      status: 'active',
      branchId: 'branch-1',
      pricingType: 'percentage_discount',
      discountValue: 20,
      quantity: 100,
      claimedCount: 25,
      maxClaims: 100,
      branchName: 'Wuse Branch',
      startDate: '2026-07-01T00:00:00.000Z',
    });
    expect(row).toMatchObject({
      id: 'offer-1',
      title: 'Weekend Wings',
      discount: '20% OFF',
      branches: 'Wuse Branch',
      claims: 100,
      redeemed: 25,
      percent: 25,
    });
    expect(row.schedule).toContain('7/1/2026');
  });

  test('maps a fixed discount amount offer', () => {
    const row = offerToCentralDealRow({
      id: 'offer-2',
      name: 'Flat ₦1,000 Off',
      status: 'active',
      branchId: 'branch-1',
      pricingType: 'fixed_discount_amount',
      discountValue: 1000,
    });
    expect(row.discount).toBe('₦1,000 OFF');
  });

  test('uses the fixed price for fixed_discount_price offers', () => {
    const row = offerToCentralDealRow({
      id: 'offer-3',
      name: 'Combo',
      status: 'active',
      branchId: 'branch-1',
      pricingType: 'fixed_discount_price',
      fixedPrice: 5000,
    });
    expect(row.discount).toBe('₦5,000');
  });
});

describe('hub screens render live data with copy fallback', () => {
  test('central catalogue renders live items when provided', async () => {
    await render(
      <CentralCatalogueScreen
        layout="directory"
        items={[catalogueItemToCentralRow(liveItem)]}
      />,
    );

    expect(screen.getByText('Buffalo Wing Bucket')).toBeTruthy();
    expect(screen.getByText('₦8,500')).toBeTruthy();
  });

  test('central catalogue falls back to prototype copy without items', async () => {
    await render(<CentralCatalogueScreen layout="directory" />);

    expect(screen.getByText(/Woodfire Aged Ribeye Steak/i)).toBeTruthy();
    expect(screen.queryByText('Buffalo Wing Bucket')).toBeNull();
  });

  test('central deals renders live deals when provided', async () => {
    await render(
      <CentralDealsManagementScreen
        layout="hero"
        deals={[
          offerToCentralDealRow({
            id: 'offer-1',
            name: 'Weekend Wings',
            status: 'active',
            branchId: 'branch-1',
            pricingType: 'percentage_discount',
            discountValue: 20,
          }),
        ]}
      />,
    );

    expect(screen.getByText('Weekend Wings')).toBeTruthy();
    expect(screen.getByText('20% OFF')).toBeTruthy();
  });

  test('services screen renders live services when provided', async () => {
    await render(
      <ServicesCategoriesManagementScreen
        services={[
          catalogueItemToServiceRow({
            ...liveItem,
            itemType: 'service',
            duration: '60 mins',
          }),
        ]}
      />,
    );

    expect(screen.getByText('Buffalo Wing Bucket')).toBeTruthy();
  });

  test('services screen renders live categories when provided', async () => {
    await render(
      <ServicesCategoriesManagementScreen
        categories={[catalogueCategoryToRow({ id: 'cat-1', name: 'Grill Corner' })]}
      />,
    );

    expect(screen.getByText('Grill Corner')).toBeTruthy();
  });
});
