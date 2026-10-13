import React, { useState } from 'react';
import { fireEvent, render, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiscoverScreen } from '@features/discover/screens/DiscoverScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { strings } from '@constants/strings';
import { savedHubFixtures } from './helpers/mockCustomerHub';

jest.mock('@features/accountHub/hooks/useSavedHub', () =>
  jest.requireActual('./helpers/mockCustomerHub').mockSavedHubModule(),
);

jest.mock('@features/discover/hooks/useDiscoverBusinesses', () =>
  jest.requireActual('./helpers/mockDiscoverBusinesses').mockDiscoverBusinessesModule(),
);

const { clearLabel } = strings.search;

const SearchBarHost = ({ showFilter = true }: { showFilter?: boolean }) => {
  const [value, setValue] = useState('');
  return (
    <HomeSearchBar
      value={value}
      onChangeText={setValue}
      filterLabel={showFilter ? strings.home.filter : undefined}
      onFilterPress={showFilter ? jest.fn() : undefined}
      showFilter={showFilter}
    />
  );
};

const HubFieldHost = ({ withFilter = true }: { withFilter?: boolean }) => {
  const [value, setValue] = useState('');
  return (
    <HubSearchField
      value={value}
      onChangeText={setValue}
      placeholder={strings.savedHub.searchPlaceholder}
      filterLabel={withFilter ? strings.home.filter : undefined}
      onFilter={withFilter ? jest.fn() : undefined}
    />
  );
};

describe('HomeSearchBar clear button', () => {
  it('is absent while the field is empty', async () => {
    const screen = await render(<SearchBarHost />);
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();
  });

  it('appears with a value and empties the field when pressed', async () => {
    const screen = await render(<SearchBarHost />);
    const input = screen.getByLabelText(strings.home.searchPlaceholder);

    await act(async () => {
      await fireEvent.changeText(input, 'lunch');
    });
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    await waitFor(() => expect(screen.queryByLabelText(clearLabel)).toBeNull());
    expect(screen.getByLabelText(strings.home.searchPlaceholder).props.value).toBe('');
  });

  it('keeps the filter control alongside it, before and after clearing', async () => {
    const screen = await render(<SearchBarHost />);
    await act(async () => {
      await fireEvent.changeText(
        screen.getByLabelText(strings.home.searchPlaceholder),
        'lunch',
      );
    });

    expect(screen.getByLabelText(clearLabel)).toBeTruthy();
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();
  });

  it('is the only right-hand control when the bar has no filter', async () => {
    const screen = await render(<SearchBarHost showFilter={false} />);
    expect(screen.queryByLabelText(strings.home.filter)).toBeNull();

    await act(async () => {
      await fireEvent.changeText(
        screen.getByLabelText(strings.home.searchPlaceholder),
        'lunch',
      );
    });
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    await waitFor(() => expect(screen.queryByLabelText(clearLabel)).toBeNull());
  });

  it('stays hidden when the caller passes a value but no way to clear it', async () => {
    const screen = await render(<HomeSearchBar value="lunch" />);
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
  });
});

describe('HubSearchField clear button', () => {
  it('is absent while the field is empty', async () => {
    const screen = await render(<HubFieldHost />);
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();
  });

  it('appears with a value and empties the field when pressed', async () => {
    const screen = await render(<HubFieldHost />);
    await act(async () => {
      await fireEvent.changeText(
        screen.getByLabelText(strings.savedHub.searchPlaceholder),
        'glow',
      );
    });
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    await waitFor(() => expect(screen.queryByLabelText(clearLabel)).toBeNull());
    expect(screen.getByLabelText(strings.savedHub.searchPlaceholder).props.value).toBe(
      '',
    );
  });

  it('renders without a filter chip for search-only headers', async () => {
    const screen = await render(<HubFieldHost withFilter={false} />);
    expect(screen.queryByLabelText(strings.home.filter)).toBeNull();

    await act(async () => {
      await fireEvent.changeText(
        screen.getByLabelText(strings.savedHub.searchPlaceholder),
        'glow',
      );
    });
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    await waitFor(() => expect(screen.queryByLabelText(clearLabel)).toBeNull());
  });
});

describe('Discover screen', () => {
  it('clears the query and returns to the unfiltered list', async () => {
    const screen = await render(<DiscoverScreen />);
    const placeholder = strings.discoverFeed.searchPlaceholder;

    await act(async () => {
      await fireEvent.changeText(screen.getByLabelText(placeholder), 'cafe');
    });
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    await waitFor(() => expect(screen.queryByLabelText(clearLabel)).toBeNull());
    expect(screen.getByLabelText(placeholder).props.value).toBe('');
  });
});

describe('Saved hub screen', () => {
  const { useSavedFeed } = jest.requireMock('@features/accountHub/hooks/useSavedHub');

  beforeEach(() => {
    (useSavedFeed as jest.Mock).mockReturnValue({
      data: {
        data: [savedHubFixtures.deal, savedHubFixtures.business],
        total: 2,
        page: 1,
        limit: 50,
      },
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('clears the query and brings the full saved list back', async () => {
    const screen = await renderWithClient(<SavedHubScreen />);
    const placeholder = strings.savedHub.searchPlaceholder;

    await act(async () => {
      await fireEvent.changeText(screen.getByLabelText(placeholder), 'glow');
    });
    expect(screen.queryByText('Sole District Boutique Weekend Drop')).toBeNull();
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    await waitFor(() => expect(screen.queryByLabelText(clearLabel)).toBeNull());
    expect(screen.getByLabelText(placeholder).props.value).toBe('');
    expect(screen.getByText('Sole District Boutique Weekend Drop')).toBeTruthy();
    expect(screen.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();
  });
});

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};
