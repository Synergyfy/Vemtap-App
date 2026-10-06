import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { DiscoverScreen } from '@features/discover/screens/DiscoverScreen';
import { SavedHubScreen } from '@features/accountHub/screens/SavedHubScreen';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { HomeSearchBar } from '@components/home/HomeSearchBar';
import { strings } from '@constants/strings';

/**
 * The clear ("cancel") button is owned by the two shared search primitives, so
 * every controlled search field inherits it rather than four screens each
 * growing their own copy: Home, Deals and Discover go through `HomeSearchBar`,
 * Saved (and Help Centre, My Deals, Business Messages) through `HubSearchField`.
 *
 * Two rules hold everywhere: the button only exists while the field holds a
 * value, and pressing it empties the field through the screen's own
 * `onChangeText` — no blur, no keyboard dismissal.
 */

const { clearLabel } = strings.search;

function SearchBarHost({ showFilter = true }: { showFilter?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <HomeSearchBar
      value={value}
      onChangeText={setValue}
      showFilter={showFilter}
      filterLabel={strings.home.filter}
      onFilterPress={jest.fn()}
    />
  );
}

function HubFieldHost({ withFilter = true }: { withFilter?: boolean }) {
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
}

describe('HomeSearchBar clear button', () => {
  it('is absent while the field is empty', async () => {
    const screen = await render(<SearchBarHost />);
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
    // The filter control is untouched by the empty state.
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();
  });

  it('appears with a value and empties the field when pressed', async () => {
    const screen = await render(<SearchBarHost />);
    const input = screen.getByLabelText(strings.home.searchPlaceholder);

    await fireEvent.changeText(input, 'lunch');
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.getByLabelText(strings.home.searchPlaceholder).props.value).toBe('');
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
  });

  it('keeps the filter control alongside it, before and after clearing', async () => {
    const screen = await render(<SearchBarHost />);
    await fireEvent.changeText(
      screen.getByLabelText(strings.home.searchPlaceholder),
      'lunch',
    );

    expect(screen.getByLabelText(clearLabel)).toBeTruthy();
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    // Clearing never costs the user the filter button.
    expect(screen.getByLabelText(strings.home.filter)).toBeTruthy();
  });

  it('is the only right-hand control when the bar has no filter', async () => {
    const screen = await render(<SearchBarHost showFilter={false} />);
    expect(screen.queryByLabelText(strings.home.filter)).toBeNull();

    await fireEvent.changeText(
      screen.getByLabelText(strings.home.searchPlaceholder),
      'lunch',
    );
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
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
    await fireEvent.changeText(
      screen.getByLabelText(strings.savedHub.searchPlaceholder),
      'glow',
    );
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.getByLabelText(strings.savedHub.searchPlaceholder).props.value).toBe(
      '',
    );
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
  });

  it('renders without a filter chip for search-only headers', async () => {
    const screen = await render(<HubFieldHost withFilter={false} />);
    expect(screen.queryByLabelText(strings.home.filter)).toBeNull();

    await fireEvent.changeText(
      screen.getByLabelText(strings.savedHub.searchPlaceholder),
      'glow',
    );
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
  });
});

describe('Discover screen', () => {
  it('clears the query and returns to the unfiltered list', async () => {
    const screen = await render(<DiscoverScreen />);
    const placeholder = strings.discoverFeed.searchPlaceholder;

    await fireEvent.changeText(screen.getByLabelText(placeholder), 'cafe');
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.getByLabelText(placeholder).props.value).toBe('');
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
  });
});

describe('Saved hub screen', () => {
  it('clears the query and brings the full saved list back', async () => {
    const screen = await render(<SavedHubScreen />);
    const placeholder = strings.savedHub.searchPlaceholder;

    await fireEvent.changeText(screen.getByLabelText(placeholder), 'glow');
    expect(screen.queryByText('Sole District Boutique')).toBeNull();
    expect(screen.getByLabelText(clearLabel)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(clearLabel));
    expect(screen.getByLabelText(placeholder).props.value).toBe('');
    expect(screen.queryByLabelText(clearLabel)).toBeNull();
    expect(screen.getByText('Sole District Boutique')).toBeTruthy();
    expect(screen.getByText('Glow & Serenity Spa & Salon')).toBeTruthy();
  });
});
