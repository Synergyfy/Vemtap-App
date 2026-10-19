import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { BottomSheet } from '@components/shared/BottomSheet';
import { EmptyState, LoadingState } from '@components/shared';
import { Avatar } from '@components/ui/Avatar';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { colors } from '@theme/colors';
import { useDebounce } from '@hooks/useDebounce';
import { FieldInput } from '@features/business/components/BusinessSetupPrimitives';
import { useCustomerDirectory } from '@features/business/hooks/useBusinessCustomers';

cssInterop(Pressable, { className: 'style' });

const copy = strings.businessMessages.newMessageSheet;

export interface NewMessageCustomerSheetProps {
  visible: boolean;
  onClose: () => void;
  branchId?: string;
  /** The customer to start (or reopen) a conversation with. */
  onPick: (customer: { userId: string; name: string }) => void;
  /** The customer whose thread is being opened. */
  startingUserId?: string | null;
}

/**
 * Pick one of the business's own customers to message. Lists the CRM
 * directory (people with an order, booking, claim or visit), searchable; the
 * server only opens new threads with these customers.
 */
export function NewMessageCustomerSheet({
  visible,
  onClose,
  branchId,
  onPick,
  startingUserId = null,
}: NewMessageCustomerSheetProps) {
  const [query, setQuery] = useState('');
  const search = useDebounce(query.trim(), 300);
  const directory = useCustomerDirectory({
    search: search || undefined,
    branchId,
    limit: 30,
  });
  const customers = useMemo(
    () => directory.data?.pages.flatMap(page => page.data) ?? [],
    [directory.data],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <View className="gap-3">
        <FieldInput
          label={copy.searchLabel}
          value={query}
          onChangeText={setQuery}
          placeholder={copy.searchPlaceholder}
          accessibilityLabel={copy.searchLabel}
          leadingIcon="search"
          autoCapitalize="none"
        />
        {directory.isLoading ? <LoadingState /> : null}
        {!directory.isLoading && customers.length === 0 ? (
          <EmptyState
            variant="contained"
            icon="group"
            title={search ? copy.noMatchTitle : copy.emptyTitle}
            description={search ? copy.noMatchBody : copy.emptyBody}
          />
        ) : null}
        <View className="gap-1">
          {customers.map(customer => {
            const name = customer.name || copy.unnamed;
            const detail = customer.email ?? customer.phone ?? '';
            const starting = startingUserId === customer.userId;
            return (
              <Pressable
                key={customer.userId}
                accessibilityRole="button"
                accessibilityLabel={copy.messageCustomer(name)}
                disabled={startingUserId !== null}
                onPress={() => onPick({ userId: customer.userId, name })}
                className="min-h-14 flex-row items-center gap-3 rounded-field px-1 py-2 active:bg-surface-container-low"
              >
                <Avatar uri={customer.avatarUrl ?? undefined} name={name} size="sm" />
                <View className="min-w-0 flex-1">
                  <VemtapText
                    variant="labelMd"
                    className="font-sans-semibold"
                    numberOfLines={1}
                  >
                    {name}
                  </VemtapText>
                  {detail ? (
                    <VemtapText variant="caption" tone="secondary" numberOfLines={1}>
                      {detail}
                    </VemtapText>
                  ) : null}
                </View>
                {starting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Icon name="message" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </BottomSheet>
  );
}
