import React from 'react';
import { View } from 'react-native';
import { cssInterop } from 'nativewind';
import { LiveNearbyListCard } from '@components/home/LiveNearbyListCard';
import { BusinessRow } from '@components/home/BusinessRow';
import { VemtapText } from '@components/ui/Text';
import { EmptyState } from '@components/shared/EmptyState';
import { LoadingState } from '@components/shared/LoadingState';
import { strings } from '@constants/strings';
import { useSearchResults, type UseSearch } from '@features/search/hooks/usePublicSearch';

cssInterop(View, { className: 'style' });

export interface SearchResultsProps {
  search: UseSearch;
  onOpenDeal?: (dealId: string) => void;
}

/**
 * The results panel that replaces Home's sections (and the Deals feed's) while
 * a query is typed.
 *
 * This is a **state of an existing screen, not a new one**: the Stitch spec has
 * no search-results page for Home — its mock screens only ever show the search
 * bar with populated sections — so inventing a results screen would be a screen
 * the design never specified. The panel reuses the cards, empty states and
 * loading states those screens already own.
 *
 * Groups are rendered only when they have results, so a search for a shop name
 * does not open with a heading over nothing. Business rows are not pressable:
 * the payload carries no `uniqueCode`, which is the only value the merchant
 * profile endpoint accepts (see `usePublicSearch`).
 *
 * This component owns the request. It is only mounted while a query is active,
 * so a screen merely showing a search bar never issues one — and never needs a
 * query client of its own.
 */
export function SearchResults({ search, onOpenDeal }: SearchResultsProps) {
  const results = useSearchResults(search.debounced, search.debouncePending);

  if (results.searching) {
    return <LoadingState label={strings.search.searching} />;
  }

  if (results.isError) {
    return (
      <EmptyState
        variant="contained"
        icon="cloudOff"
        title={strings.common.error}
        actionLabel={strings.common.retry}
        onAction={results.retry}
      />
    );
  }

  const isEmpty = results.deals.length === 0 && results.businesses.length === 0;
  if (isEmpty) {
    return (
      <EmptyState
        variant="contained"
        icon="search"
        title={strings.search.emptyTitle}
        description={strings.search.emptyBody}
      />
    );
  }

  return (
    <View className="flex-col gap-5">
      {results.deals.length > 0 ? (
        <View className="flex-col gap-3.5">
          <GroupHeading>{strings.deals.caption}</GroupHeading>
          <View className="flex-col gap-3.5">
            {results.deals.map(deal => (
              <LiveNearbyListCard key={deal.id} deal={deal} onOpenDetail={onOpenDeal} />
            ))}
          </View>
        </View>
      ) : null}

      {results.businesses.length > 0 ? (
        <View className="flex-col gap-3">
          <GroupHeading>{strings.search.businesses}</GroupHeading>
          <View className="flex-col gap-3">
            {results.businesses.map(business => (
              <BusinessRow key={business.id} business={business} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Same eyebrow treatment the Discover feed uses for a group title. */
function GroupHeading({ children }: { children: string }) {
  return (
    <VemtapText
      accessibilityRole="header"
      className="font-sans-semibold text-label-sm uppercase tracking-wider text-text-secondary"
    >
      {children}
    </VemtapText>
  );
}
