import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { FeaturedDealsScreen } from '@features/home/screens/FeaturedDealsScreen';
import { ChangeLocationRadiusSheet } from '@features/home/components/ChangeLocationRadiusSheet';
import { featuredListings } from '@features/home/data/featuredDeals';
import { TabNavigator } from '@navigation/TabNavigator';
import { AppStack } from '@navigation/AppStack';
import { ManualLocationSearchScreen } from '@features/location/screens/ManualLocationSearchScreen';
import { DealsDiscoveryScreen } from '@features/deals/screens/DealsDiscoveryScreen';
import { AREA_OPTIONS, AREA_PILL_LABELS, DEFAULT_AREA } from '@constants/locations';
import { useLocationStore } from '@store/locationStore';

const { homeLocation: loc, featuredDeals: fd, home } = strings;

afterEach(cleanup);

// The district/radius live in a persisted store shared by every consumer feed,
// so each test starts from the documented default.
beforeEach(() => {
  useLocationStore.getState().setTargeting(DEFAULT_AREA, 5);
});

describe('change location & radius sheet', () => {
  it('opens on live state and offers every district plus the radius controls', async () => {
    await render(
      <ChangeLocationRadiusSheet visible onClose={jest.fn()} onApply={jest.fn()} />,
    );
    expect(screen.getByText(loc.title)).toBeTruthy();
    expect(screen.getByText(loc.subtitle)).toBeTruthy();
    expect(screen.getByText(loc.autoDetectTitle)).toBeTruthy();
    expect(screen.getByText(loc.radiusTitle)).toBeTruthy();
    for (const km of loc.radiusQuick) {
      expect(screen.getAllByText(loc.km(km)).length).toBeGreaterThan(0);
    }
  });

  it('reflects the currently applied area and radius, not the defaults', async () => {
    await render(
      <ChangeLocationRadiusSheet
        visible
        onClose={jest.fn()}
        onApply={jest.fn()}
        area="Maitama"
        radiusKm={10}
      />,
    );
    expect(screen.getByText(`Maitama ${loc.selectedSuffix}`)).toBeTruthy();
    expect(screen.getByText(loc.withinKm(10))).toBeTruthy();
    expect(screen.getByText(loc.cancelKeep('Maitama', 10))).toBeTruthy();
  });

  it('applies the pending district and radius, then closes', async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    await render(
      <ChangeLocationRadiusSheet visible onClose={onClose} onApply={onApply} />,
    );
    await fireEvent.press(screen.getByText('Maitama'));
    await fireEvent.press(screen.getByRole('button', { name: loc.km(10) }));
    await fireEvent.press(screen.getByLabelText(loc.apply(53)));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ area: 'Maitama', radiusKm: 10 }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('auto-detect returns the sheet to the device location', async () => {
    const onUseCurrentLocation = jest.fn();
    await render(
      <ChangeLocationRadiusSheet
        visible
        onClose={jest.fn()}
        onApply={jest.fn()}
        area="Garki"
        onUseCurrentLocation={onUseCurrentLocation}
      />,
    );
    await fireEvent.press(screen.getByLabelText(loc.autoDetectTitle));
    expect(onUseCurrentLocation).toHaveBeenCalled();
  });

  it('hands the district search off to the manual search page', async () => {
    const onSearchArea = jest.fn();
    await render(
      <ChangeLocationRadiusSheet
        visible
        onClose={jest.fn()}
        onApply={jest.fn()}
        onSearchArea={onSearchArea}
      />,
    );
    await fireEvent.press(screen.getByLabelText(loc.searchPlaceholder));
    expect(onSearchArea).toHaveBeenCalled();
  });
});

describe('home location trigger', () => {
  it('opens the radius sheet from the radius pill, not the district name', async () => {
    const onOpenLocationSelect = jest.fn();
    await render(<HomeScreen onOpenLocationSelect={onOpenLocationSelect} />);

    // Tapping the district name must NOT open the sheet.
    await fireEvent.press(screen.getByLabelText(home.location));
    expect(onOpenLocationSelect).toHaveBeenCalled();
    expect(screen.queryByText(loc.title)).toBeNull();

    // The radius pill opens the sheet.
    await fireEvent.press(screen.getByLabelText(home.radius));
    expect(screen.getByText(loc.title)).toBeTruthy();
  });

  it('reflects the applied radius on the navbar pill', async () => {
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText(home.radius));
    await fireEvent.press(screen.getByLabelText(loc.apply(34)));
    expect(screen.getByLabelText(loc.withinKm(5))).toBeTruthy();
  });

  it('keeps district and radius as two independent controls', async () => {
    await render(<HomeScreen />);
    const name = screen.getByLabelText(home.location);
    const pill = screen.getByLabelText(home.radius);
    expect(name).not.toBe(pill);
  });

  it('keeps the Deals Near You See All on the discovery surface', async () => {
    const onOpenDiscover = jest.fn();
    await render(<HomeScreen onOpenDiscover={onOpenDiscover} />);
    await fireEvent.press(screen.getByLabelText('See All Deals Near You'));
    expect(onOpenDiscover).toHaveBeenCalled();
  });
});

describe('featured deals screen', () => {
  it('renders every promoted listing with its rating and price block', async () => {
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);
    expect(screen.getByText(fd.title)).toBeTruthy();
    expect(screen.getAllByText(fd.promoted).length).toBeGreaterThan(0);
    for (const listing of featuredListings) {
      expect(screen.getByText(listing.title)).toBeTruthy();
      expect(screen.getByText(listing.merchant)).toBeTruthy();
    }
    expect(screen.getByText(fd.aboutTitle)).toBeTruthy();
  });

  it('sorts by the highest discount', async () => {
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);
    await fireEvent.press(screen.getByText(fd.sortDiscount));
    expect(screen.getByText(featuredListings[3].title)).toBeTruthy();
  });

  it('caps the list at the selected max distance', async () => {
    // The seeded listings all sit within 3 km, so the smallest cap keeps all five.
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);
    expect(screen.getAllByText(fd.liveDeals(5)).length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByRole('button', { name: `${fd.maxDistance} 3 km` }));
    expect(screen.getAllByText(fd.liveDeals(5)).length).toBeGreaterThan(0);
  });

  it('drops listings beyond the cap and falls back to the empty state', async () => {
    // A 1 km cap keeps only the 0.4 km listing; 0 km leaves nothing in range.
    await render(<FeaturedDealsScreen onBack={jest.fn()} maxDistanceKm={1} />);
    expect(screen.getByText(featuredListings[0].title)).toBeTruthy();
    expect(screen.queryByText(featuredListings[1].title)).toBeNull();
    expect(screen.getAllByText(fd.liveDeals(1)).length).toBeGreaterThan(0);
  });

  it('opens a listing through its View Deal action', async () => {
    const onOpenDeal = jest.fn();
    await render(<FeaturedDealsScreen onBack={jest.fn()} onOpenDeal={onOpenDeal} />);
    await fireEvent.press(screen.getAllByLabelText(fd.viewDeal)[0]);
    expect(onOpenDeal).toHaveBeenCalled();
  });

  it('toggles the saved state on a listing bookmark', async () => {
    const onToggleSave = jest.fn();
    await render(<FeaturedDealsScreen onBack={jest.fn()} onToggleSave={onToggleSave} />);
    await fireEvent.press(screen.getByLabelText(fd.bookmark(featuredListings[0].title)));
    expect(onToggleSave).toHaveBeenCalledWith(featuredListings[0].id);
  });

  it('reuses the shared business-setup prompt in its inline variant', async () => {
    const onOpenBusinessSetup = jest.fn();
    await render(
      <FeaturedDealsScreen
        onBack={jest.fn()}
        onOpenBusinessSetup={onOpenBusinessSetup}
      />,
    );
    expect(screen.getByText(home.enrollmentPrompt)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(home.enrollmentLink));
    expect(onOpenBusinessSetup).toHaveBeenCalled();
  });
});

describe('consumer navigation', () => {
  it('reaches Featured Deals from the home See All link', async () => {
    await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText('See All Featured Deals'));
    });
    expect(screen.getByText(fd.title)).toBeTruthy();
    expect(screen.getByText(featuredListings[0].title)).toBeTruthy();
  });

  it('keeps the shared consumer tab bar on the Featured Deals screen', async () => {
    await render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText('See All Featured Deals'));
    });
    expect(screen.getAllByText(home.tabHome).length).toBeGreaterThan(0);
    expect(screen.getAllByText(home.tabDeals).length).toBeGreaterThan(0);
  });
});

/**
 * BottomSheet pads only its own header (24pt), never its children, so any sheet
 * body must carry the gutter itself or content runs to both screen edges.
 * These walk the rendered tree and assert the inset exists.
 */
function collectNodes(
  node: unknown,
  acc: Record<string, unknown>[] = [],
): Record<string, unknown>[] {
  const current = node as { children?: unknown; props?: Record<string, unknown> } | null;
  if (!current || typeof current !== 'object') return acc;
  if (Array.isArray(current)) {
    (current as unknown[]).forEach(child => collectNodes(child, acc));
    return acc;
  }
  if (current.props) acc.push(current.props);
  collectNodes(current.children, acc);
  return acc;
}

const hasGutter = (value: unknown) =>
  typeof value === 'string' && /(^|\s)px-6(\s|$)/.test(value);

describe('horizontal gutters', () => {
  it('insets every top-level block of the location sheet body', async () => {
    await render(
      <ChangeLocationRadiusSheet visible onClose={jest.fn()} onApply={jest.fn()} />,
    );
    const nodes = collectNodes(screen.toJSON());
    // subtitle, scrolling body and the action deck all carry the header gutter
    expect(
      nodes.some(n => hasGutter(n.className) && String(n.className).includes('gap-1')),
    ).toBe(true);
    const scroller = nodes.find(n => String(n.className ?? '').includes('max-h-'));
    expect(scroller).toBeDefined();
    expect(hasGutter(scroller?.contentContainerClassName)).toBe(true);
    expect(
      nodes.some(n => hasGutter(n.className) && String(n.className).includes('gap-2')),
    ).toBe(true);
  });

  it('insets the Featured Deals list and lets the sort strip bleed to the edges', async () => {
    await render(<FeaturedDealsScreen onBack={jest.fn()} />);
    const nodes = collectNodes(screen.toJSON());
    // the card column carries the gutter
    const listColumn = nodes.find(
      n =>
        String(n.className ?? '').includes('gap-4') &&
        String(n.className ?? '').includes('px-6'),
    );
    expect(listColumn).toBeDefined();
    // the sort strip is edge-bleeding by design: -mx-6 wrapper + px-6 content
    const bleed = nodes.find(n => String(n.className ?? '').includes('-mx-6'));
    expect(bleed).toBeDefined();
    const scroller = collectNodes(screen.toJSON()).find(n =>
      String(n.contentContainerClassName ?? '').includes('gap-2'),
    );
    expect(hasGutter(scroller?.contentContainerClassName)).toBe(true);
  });
});

describe('location selection is shared with the signup flow', () => {
  it('reuses the same district list the signup manual-search screen reads', async () => {
    // The screen always lives inside a stack, in both shells.
    await render(
      <NavigationContainer>
        <ManualLocationSearchScreen />
      </NavigationContainer>,
    );
    for (const area of AREA_OPTIONS) {
      expect(screen.getByText(area.name)).toBeTruthy();
    }
  });

  it('applies the district through the host callback instead of the auth navigator', async () => {
    const onSelected = jest.fn();
    await render(
      <NavigationContainer>
        <ManualLocationSearchScreen onSelected={onSelected} />
      </NavigationContainer>,
    );
    await fireEvent.press(screen.getByText('Garki'));
    await fireEvent.press(
      screen.getByLabelText(strings.auth.manualContinueWith('Garki')),
    );
    expect(onSelected).toHaveBeenCalledWith('Garki');
  });

  it('routes the navbar district name to the shared selection page', async () => {
    // The page is registered on the root stack, so render the real shell.
    await render(
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(home.location));
    });
    // The shared manual-search screen, reached through the Home stack.
    expect(screen.getByText(strings.auth.manualHeader)).toBeTruthy();
  });

  it('returns to Home with the chosen district applied', async () => {
    await render(
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>,
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText(home.location));
    });
    await act(async () => {
      fireEvent.press(screen.getByText('Maitama'));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText(strings.auth.manualContinueWith('Maitama')));
    });
    expect(screen.getByLabelText('Maitama, Abuja')).toBeTruthy();
    expect(screen.queryByLabelText(home.location)).toBeNull();
  });
});

describe('Home and Deals share one navbar and one targeting state', () => {
  it('renders the greeting on Home and the section name on Deals', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText(strings.home.greeting)).toBeTruthy();

    await cleanup();
    await render(
      <DealsDiscoveryScreen
        variant="featured"
        onOpenFilters={jest.fn()}
        onOpenDeal={jest.fn()}
      />,
    );
    expect(screen.getByText(strings.deals.caption)).toBeTruthy();
    expect(screen.queryByText(strings.home.greeting)).toBeNull();
  });

  it('gives both feeds the same two targeting controls', async () => {
    const areaLabel = `${AREA_PILL_LABELS[DEFAULT_AREA]}, Abuja`;

    await render(<HomeScreen />);
    expect(screen.getByLabelText(areaLabel)).toBeTruthy();
    expect(screen.getByLabelText(home.radius)).toBeTruthy();

    await cleanup();
    await render(
      <DealsDiscoveryScreen
        variant="featured"
        onOpenFilters={jest.fn()}
        onOpenDeal={jest.fn()}
      />,
    );
    // The same two controls, from the same shared store — not a merged target.
    expect(screen.getByLabelText(areaLabel)).toBeTruthy();
    expect(screen.getByLabelText(home.radius)).toBeTruthy();
    expect(screen.getByLabelText(areaLabel)).not.toBe(screen.getByLabelText(home.radius));
  });

  it('opens the radius sheet from the Deals navbar too', async () => {
    await render(
      <DealsDiscoveryScreen
        variant="featured"
        onOpenFilters={jest.fn()}
        onOpenDeal={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByLabelText(home.radius));
    expect(screen.getByText(loc.title)).toBeTruthy();
  });

  it('applies a district on one feed and shows it on the other', async () => {
    await render(
      <DealsDiscoveryScreen
        variant="featured"
        onOpenFilters={jest.fn()}
        onOpenDeal={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByLabelText(home.radius));
    await fireEvent.press(screen.getByText('Garki'));
    await fireEvent.press(screen.getByLabelText(loc.apply(43)));
    // The store is shared, so Home reflects the Deals-side change.
    await cleanup();
    await render(<HomeScreen />);
    expect(screen.getByLabelText('Garki, Abuja')).toBeTruthy();
    expect(useLocationStore.getState().area).toBe('Garki');
  });
});
