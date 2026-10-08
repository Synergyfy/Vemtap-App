import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Text } from 'react-native';
import {
  categoryIcon,
  useFilterCategories,
} from '@features/deals/hooks/useFilterCategories';

/**
 * The filter page's category chips come from the real taxonomy rather than the
 * design's eight fictional labels. These tests pin what that fetch has to do to
 * be usable: the seed contains test entries and untrimmed names, and neither
 * would survive contact with a consumer filter page.
 */

const mockList = jest.fn();

jest.mock('@api/categoriesApi', () => ({
  categoriesApi: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

const TAXONOMY = {
  items: [
    { id: '1', name: 'Food & Hospitality', description: null, subcategories: [] },
    { id: '2', name: 'Beauty & Personal Care', description: null, subcategories: [] },
    {
      id: '3',
      name: 'Technology & Digital Services',
      description: null,
      subcategories: [],
    },
    // Untrimmed, so it would silently fail the match against an offer's name.
    { id: '4', name: 'Agriculture ', description: null, subcategories: [] },
    // Seed junk that must not reach a consumer filter page.
    { id: '5', name: 'Frank', description: null, subcategories: [] },
    { id: '6', name: 'Zejab', description: null, subcategories: [] },
    { id: '7', name: 'test', description: null, subcategories: [] },
    { id: '8', name: 'txxhhh', description: null, subcategories: [] },
    // A near-duplicate of id 3 that the seed also carries.
    { id: '9', name: 'Technology', description: null, subcategories: [] },
    { id: '10', name: 'Automotive', description: null, subcategories: [] },
  ],
  meta: { total: 10, page: 1, limit: 100, totalPages: 1 },
};

function Probe() {
  const { options, isLoading, isError } = useFilterCategories();
  return (
    <>
      <Text testID="loading">{String(isLoading)}</Text>
      <Text testID="error">{String(isError)}</Text>
      <Text testID="count">{String(options.length)}</Text>
      <Text testID="names">{options.map(option => option.name).join(' | ')}</Text>
      <Text testID="raw">{JSON.stringify(options.map(option => option.name))}</Text>
      <Text testID="icons">{options.map(option => option.icon).join(',')}</Text>
    </>
  );
}

async function renderProbe() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const screen = await render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
  client.clear();
  return screen;
}

beforeEach(() => {
  mockList.mockReset();
  mockList.mockResolvedValue(TAXONOMY);
});

describe('useFilterCategories', () => {
  it('asks for the whole taxonomy in one page', async () => {
    await renderProbe();

    expect(mockList).toHaveBeenCalledWith({ limit: 100 });
  });

  it('drops the seed junk and keeps the real categories', async () => {
    const screen = await renderProbe();

    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe('6'));
    expect(screen.getByTestId('names').props.children).toBe(
      'Food & Hospitality | Beauty & Personal Care | Technology & Digital Services | Agriculture | Technology | Automotive',
    );
  });

  it('trims names so they match an offer categoryName exactly', async () => {
    const screen = await renderProbe();

    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe('6'));
    expect(screen.getByTestId('names').props.children).toContain('Agriculture');
    // The joined list cannot prove this — "Agriculture " is a substring of
    // "Agriculture | Technology" — so the raw names are asserted instead.
    expect(screen.getByTestId('raw').props.children).not.toContain('"Agriculture "');
  });

  it('resolves an icon for every category, falling back to a neutral glyph', async () => {
    const screen = await renderProbe();

    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe('6'));
    expect(screen.getByTestId('icons').props.children).toBe(
      'restaurant,spa,devices,loyalty,devices,automotive',
    );
  });

  it('reports the loading state before the taxonomy arrives', async () => {
    // eslint-disable-next-line no-promise-executor-return
    mockList.mockReturnValue(new Promise(() => undefined));
    const screen = await renderProbe();

    expect(screen.getByTestId('loading').props.children).toBe('true');
    expect(screen.getByTestId('error').props.children).toBe('false');
  });
});

describe('categoryIcon', () => {
  test('maps a category name onto an existing icon', () => {
    expect(categoryIcon('Food & Hospitality')).toBe('restaurant');
    expect(categoryIcon('Beauty & Personal Care')).toBe('spa');
    expect(categoryIcon('Automotive')).toBe('automotive');
  });

  test('falls back to the neutral glyph when nothing matches', () => {
    expect(categoryIcon('Religious & Non-Profit Organizations')).toBe('category');
  });
});
