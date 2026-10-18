import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { catalogueApi } from '@api/catalogueApi';
import { strings } from '@constants/strings';
import { AddProductBasicsMediaScreen } from '@features/business/screens/AddProductBasicsMediaScreen';
import { AddProductLocationPricingScreen } from '@features/business/screens/AddProductLocationPricingScreen';
import { AddProductBranchAvailabilityScreen } from '@features/business/screens/AddProductBranchAvailabilityScreen';

jest.mock('@api/catalogueApi', () => ({
  catalogueApi: {
    listBusinessBranches: jest.fn(),
  },
}));

const listBusinessBranches = catalogueApi.listBusinessBranches as jest.Mock;

const branches = [
  { id: 'branch-1', name: 'Wuse Branch', address: 'Wuse Zone 5' },
  { id: 'branch-2', name: 'Maitama Branch', address: 'Maitama Street' },
];

function withQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>;
}

afterEach(cleanup);

beforeEach(() => {
  listBusinessBranches.mockReset();
});

describe('product basics screen', () => {
  test('emits typed form values on continue', async () => {
    const onContinue = jest.fn();
    await render(<AddProductBasicsMediaScreen onContinue={onContinue} />);

    const title = screen.getByPlaceholderText(strings.addProductBasics.titlePlaceholder);
    await fireEvent.changeText(title, 'Spicy Grilled Turkey');
    await fireEvent.press(screen.getByText(strings.addProductBasics.continue));

    expect(onContinue).toHaveBeenCalledTimes(1);
    const value = onContinue.mock.calls[0][0];
    expect(value.title).toBe('Spicy Grilled Turkey');
    expect(value.description).toBe('');
    expect(Array.isArray(value.attributes)).toBe(true);
    expect(Array.isArray(value.gallery)).toBe(true);
  });

  test('save draft emits the same value shape', async () => {
    const onSaveDraft = jest.fn();
    await render(<AddProductBasicsMediaScreen onSaveDraft={onSaveDraft} />);

    await fireEvent.press(screen.getByText(strings.addProductBasics.saveDraft));

    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    // A new product starts blank, never with sample text.
    expect(onSaveDraft.mock.calls[0][0]).toMatchObject({ title: '', producer: '' });
  });
});

describe('product location & pricing screen', () => {
  test('loads live branches and seeds selection', async () => {
    listBusinessBranches.mockResolvedValue(branches);
    const onSave = jest.fn();
    await render(
      withQuery(<AddProductLocationPricingScreen onBack={jest.fn()} onSave={onSave} />),
    );

    await waitFor(() => {
      expect(screen.getByText('Wuse Branch')).toBeTruthy();
    });
    expect(screen.getByText('Maitama Branch')).toBeTruthy();

    await fireEvent.press(screen.getByText('Save Product & Availability'));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].selectedBranchIds).toEqual(['branch-1', 'branch-2']);
  });

  test('toggle unselects a seeded branch', async () => {
    listBusinessBranches.mockResolvedValue(branches);
    const onSave = jest.fn();
    await render(
      withQuery(<AddProductLocationPricingScreen onBack={jest.fn()} onSave={onSave} />),
    );
    await waitFor(() => {
      expect(screen.getByText('Wuse Branch')).toBeTruthy();
    });

    await fireEvent.press(screen.getByLabelText('Wuse Branch'));
    await fireEvent.press(screen.getByText('Save Product & Availability'));
    expect(onSave.mock.calls[0][0].selectedBranchIds).toEqual(['branch-2']);
  });
});

describe('product branch availability screen', () => {
  test('review & publish emits live branch ids', async () => {
    listBusinessBranches.mockResolvedValue(branches);
    const onContinue = jest.fn();
    await render(
      withQuery(
        <AddProductBranchAvailabilityScreen onBack={jest.fn()} onContinue={onContinue} />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText('Wuse Branch')).toBeTruthy();
    });

    await fireEvent.press(screen.getByText('Review & Publish'));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue.mock.calls[0][0].selectedBranchIds).toEqual([
      'branch-1',
      'branch-2',
    ]);
  });
});
