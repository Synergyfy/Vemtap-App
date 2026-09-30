import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { AREA_PILL_LABELS, DEFAULT_AREA } from '@constants/locations';
import { useLocationStore } from '@store/locationStore';
import { CategoryChips } from '@components/home/CategoryChips';
import { DiscoverScreen } from '@features/discover/screens/DiscoverScreen';
import { AppStack } from '@navigation/AppStack';

const { homeLocation: loc, home } = strings;

/** The chip scroller's content-container class, read off the rendered tree. */
function chipScrollerClass(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = chipScrollerClass(child);
      if (found) return found;
    }
    return '';
  }
  const current = node as {
    props?: { contentContainerClassName?: string };
    children?: unknown;
  };
  const value = current.props?.contentContainerClassName;
  if (typeof value === 'string' && value.includes('items-center')) return value;
  return chipScrollerClass(current.children);
}

afterEach(cleanup);

beforeEach(() => {
  useLocationStore.getState().setTargeting(DEFAULT_AREA, 5);
});

function renderDiscover(
  props: Partial<React.ComponentProps<typeof DiscoverScreen>> = {},
) {
  return render(
    <DiscoverScreen
      onOpenBusiness={jest.fn()}
      onOpenFilters={jest.fn()}
      onToggleMap={jest.fn()}
      onOpenNotifications={jest.fn()}
      onOpenAccount={jest.fn()}
      onOpenEnrollment={jest.fn()}
      {...props}
    />,
  );
}

describe('category chip gutter', () => {
  it('insets the chip row by default so chips never touch the screen edge', async () => {
    await render(<CategoryChips categories={['All', 'Food', 'Beauty']} />);
    expect(chipScrollerClass(screen.toJSON())).toContain('px-6');
  });

  it('lets a parent that already pads opt out of the second gutter', async () => {
    await render(<CategoryChips categories={['All', 'Food']} horizontalGutter={false} />);
    expect(chipScrollerClass(screen.toJSON())).not.toContain('px-6');
  });

  it('keeps the gutter on every Discover-adjacent chip row', async () => {
    // The Discover screen renders the row inside an unpadded container, which is
    // exactly why the component owns the gutter.
    await renderDiscover();
    expect(chipScrollerClass(screen.toJSON())).toContain('px-6');
  });
});

describe('discover targeting controls', () => {
  it('shows the shared district and radius from the store', async () => {
    await renderDiscover();
    expect(
      screen.getByLabelText(`${AREA_PILL_LABELS[DEFAULT_AREA]}, Abuja`),
    ).toBeTruthy();
    expect(screen.getByLabelText(home.radius)).toBeTruthy();
  });

  it('routes the district name to the shared selection page', async () => {
    const onOpenLocationSelect = jest.fn();
    await renderDiscover({ onOpenLocationSelect });
    await fireEvent.press(
      screen.getByLabelText(`${AREA_PILL_LABELS[DEFAULT_AREA]}, Abuja`),
    );
    expect(onOpenLocationSelect).toHaveBeenCalled();
    // The radius sheet must not open from the district name.
    expect(screen.queryByText(loc.title)).toBeNull();
  });

  it('opens the radius sheet from the radius control', async () => {
    await renderDiscover();
    await fireEvent.press(screen.getByLabelText(home.radius));
    expect(screen.getByText(loc.title)).toBeTruthy();
  });

  it('applies a radius change that other feeds then reflect', async () => {
    await renderDiscover();
    await fireEvent.press(screen.getByLabelText(home.radius));
    await fireEvent.press(screen.getByRole('button', { name: loc.km(15) }));
    await fireEvent.press(screen.getByLabelText(loc.apply(34 + (15 - 5) * 2)));
    expect(useLocationStore.getState().radiusKm).toBe(15);
    expect(screen.getByLabelText(loc.withinKm(15))).toBeTruthy();
  });

  it('exposes the two controls as separate targets', async () => {
    await renderDiscover();
    const name = screen.getByLabelText(`${AREA_PILL_LABELS[DEFAULT_AREA]}, Abuja`);
    const radius = screen.getByLabelText(home.radius);
    expect(name).not.toBe(radius);
  });

  it('reaches the shared selection page through the real shell', async () => {
    await render(
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(/Discover, tab/i));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(`${AREA_PILL_LABELS[DEFAULT_AREA]}, Abuja`));
    });
    expect(screen.getByText(strings.auth.manualHeader)).toBeTruthy();
  });
});
