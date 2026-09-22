import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VemtapText } from '@components/ui/Text';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/shared/EmptyState';
import { ErrorState } from '@components/shared/ErrorState';
import { Loader } from '@components/ui/Loader';
import { OfflineBanner } from '@components/shared/OfflineBanner';
import { usePaginatedUsers } from '@features/home/hooks/usePaginatedUsers';
import { useIsOnline } from '@hooks/useNetworkStatus';
import type { RootStackParamList } from '@navigation/types';
import { strings } from '@constants/strings';

cssInterop(View, { className: 'style' });

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const isOnline = useIsOnline();
  const {
    users,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  } = usePaginatedUsers({ perPage: 20 });

  const handleOpenProfile = useCallback(() => {
    navigation.navigate('AppStack', { screen: 'Profile' });
  }, [navigation]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      loadMore();
    }
  }, [hasNextPage, loadMore]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {!isOnline ? <OfflineBanner /> : null}
        <Loader label={strings.common.loading} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {!isOnline ? <OfflineBanner /> : null}
        <ErrorState
          description={(error as Error)?.message}
          onRetry={() => {
          refetch().catch(() => undefined);
        }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {!isOnline ? <OfflineBanner /> : null}
      <View className="px-screen pt-4 pb-6">
        <VemtapText variant="headingLg">Discover</VemtapText>
        <VemtapText tone="secondary" className="mt-1">
          Deals and businesses around you.
        </VemtapText>
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id}
        contentContainerClassName="px-screen pb-8 gap-3"
        renderItem={({ item }) => (
          <Card>
            <VemtapText variant="headingSm">{item.displayName ?? item.email}</VemtapText>
            <VemtapText tone="secondary" className="mt-1">
              {item.email}
            </VemtapText>
          </Card>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={handleEndReached}
        windowSize={7}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch().catch(() => undefined);
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No results"
            description="Try again in a moment."
            actionLabel={strings.common.retry}
            onAction={() => {
              refetch().catch(() => undefined);
            }}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? <Loader className="py-4" /> : undefined
        }
      />

      <View className="px-screen pb-4">
        <Button label="Open profile" variant="outline" onPress={handleOpenProfile} />
      </View>
    </SafeAreaView>
  );
}
