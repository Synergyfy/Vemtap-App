import { fetchAllCategories } from '@features/business/hooks/useCategoryTaxonomy';

const mockList = jest.fn();
const mockSignal = new AbortController().signal;

jest.mock('@api/categoriesApi', () => ({
  categoriesApi: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

const page = (items: { id: string }[], pageNumber: number, totalPages: number) => ({
  items,
  meta: { total: totalPages * 10, page: pageNumber, limit: 100, totalPages },
});

beforeEach(() => {
  mockList.mockReset();
});

describe('fetchAllCategories', () => {
  it('returns a single page without requesting more', async () => {
    mockList.mockResolvedValue(page([{ id: 'a' }, { id: 'b' }], 1, 1));

    const result = await fetchAllCategories(mockSignal);

    expect(result.map(item => item.id)).toEqual(['a', 'b']);
    expect(mockList).toHaveBeenCalledTimes(1);
  });

  /**
   * The seeded taxonomy is 24 categories over 3 pages at the API default limit
   * of 10, so stopping at page one would offer a truncated category list — and a
   * truncated list silently excludes legitimate categories.
   */
  it('follows pagination when there are more pages', async () => {
    mockList
      .mockResolvedValueOnce(page([{ id: 'a' }], 1, 3))
      .mockResolvedValueOnce(page([{ id: 'b' }], 2, 3))
      .mockResolvedValueOnce(page([{ id: 'c' }], 3, 3));

    const result = await fetchAllCategories(mockSignal);

    expect(result.map(item => item.id)).toEqual(['a', 'b', 'c']);
    expect(mockList).toHaveBeenCalledTimes(3);
  });

  it('requests pages in parallel rather than one at a time', async () => {
    mockList
      .mockResolvedValueOnce(page([{ id: 'a' }], 1, 3))
      .mockResolvedValueOnce(page([{ id: 'b' }], 2, 3))
      .mockResolvedValueOnce(page([{ id: 'c' }], 3, 3));

    await fetchAllCategories(mockSignal);

    // Pages 2 and 3 are requested before the first of them settles, so both are
    // in flight at once.
    expect(mockList.mock.invocationCallOrder[1]).toBeLessThan(
      mockList.mock.invocationCallOrder[2],
    );
  });

  it('asks for the largest page the API allows', async () => {
    mockList.mockResolvedValue(page([{ id: 'a' }], 1, 1));

    await fetchAllCategories(mockSignal);

    expect(mockList).toHaveBeenCalledWith(
      { page: 1, limit: 100 },
      { signal: mockSignal },
    );
  });
});
