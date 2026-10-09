import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BusinessDiscoveryCard } from '@components/discover/BusinessDiscoveryCard';
import { strings } from '@constants/strings';
import type { BusinessProfileSummary } from '@features/discover/data/discoverData';

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);

const { useBusinessSaveStatus, useToggleBusinessSave } = jest.requireMock(
  '@features/accountHub/hooks/useSavedHub',
) as {
  useBusinessSaveStatus: jest.Mock;
  useToggleBusinessSave: jest.Mock;
};

const business: BusinessProfileSummary = {
  id: 'biz-1',
  name: 'Urban Grill & Bistro',
  category: 'Food & Dining',
  categoryFilter: 'Food & Dining',
  imageUri: 'https://example.test/logo.png',
  imageAlt: 'Urban Grill & Bistro',
  rating: '',
  reviews: 0,
  distance: '',
  location: 'Apo Boulevard, Abuja',
  activeDealLabel: '',
  status: { label: 'Verified Partner', icon: 'verified' },
  branchCode: 'URBANGRLL',
};

// The suite-wide render already provides a QueryClient, so the card can call
// its save hooks directly.
async function renderCard() {
  await render(<BusinessDiscoveryCard business={business} onOpen={jest.fn()} />);
  return screen;
}

const bookmark = (name: string) => strings.discoverFeed.bookmarkBusiness(name);

describe('BusinessDiscoveryCard save', () => {
  it('shows the saved state from the API, not local state', async () => {
    useBusinessSaveStatus.mockReturnValue({
      data: { isSaved: true },
      isLoading: false,
      isError: false,
    });
    const view = await renderCard();
    expect(
      view.getByLabelText(bookmark(business.name)).props.accessibilityState.selected,
    ).toBe(true);
  });

  it('renders unsaved while the status query is still in flight', async () => {
    // Must not flash a saved business as unsaved before the answer arrives.
    useBusinessSaveStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const view = await renderCard();
    expect(
      view.getByLabelText(bookmark(business.name)).props.accessibilityState.selected,
    ).toBe(false);
  });

  it('toggles the save for the live business id', async () => {
    useBusinessSaveStatus.mockReturnValue({
      data: { isSaved: false },
      isLoading: false,
      isError: false,
    });
    const mutate = jest.fn();
    useToggleBusinessSave.mockReturnValue({ mutate, isPending: false });

    const view = await renderCard();
    fireEvent.press(view.getByLabelText(bookmark(business.name)));

    // The business uuid, never the branch code the profile route opens with.
    expect(mutate).toHaveBeenCalledWith('biz-1');
  });
});
