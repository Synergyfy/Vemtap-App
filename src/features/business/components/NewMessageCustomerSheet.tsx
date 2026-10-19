import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

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
 *
 * Laid out as an inset grouped list inside the sheet's 24pt gutters, so
 * nothing runs to the screen edges, and the list scrolls on its own under a
 * fixed search field. Rows answer on press-down. Their pressed and busy
 * looks live in `style`, never in `className`: a className that changes on
 * press makes css-interop remount the row and drop the tap.
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
  const busy = startingUserId !== null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={copy.title}>
      <View className="shrink gap-4 px-6 pb-2">
        <VemtapText variant="bodyMd" tone="secondary" className="-mt-1">
          {copy.subtitle}
        </VemtapText>
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

        {customers.length > 0 ? (
          <View className="shrink gap-2">
            <VemtapText variant="labelSm" tone="secondary" className="px-1">
              {copy.sectionLabel}
            </VemtapText>
            <ScrollView
              className="shrink grow-0"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.group}
            >
              {customers.map((customer, position) => {
                const name = customer.name || copy.unnamed;
                const detail = customer.email ?? customer.phone ?? '';
                const starting = startingUserId === customer.userId;
                return (
                  <Pressable
                    key={customer.userId}
                    accessibilityRole="button"
                    accessibilityLabel={copy.messageCustomer(name)}
                    accessibilityState={{ disabled: busy, busy: starting }}
                    disabled={busy}
                    onPress={() => onPick({ userId: customer.userId, name })}
                    style={({ pressed }) => [
                      styles.row,
                      pressed ? styles.rowPressed : null,
                      busy && !starting ? styles.rowMuted : null,
                    ]}
                  >
                    <Avatar uri={customer.avatarUrl ?? undefined} name={name} size="sm" />
                    <View
                      style={[styles.rowBody, position > 0 ? styles.rowDivider : null]}
                    >
                      <View className="min-w-0 flex-1">
                        <VemtapText
                          variant="labelMd"
                          className="font-sans-semibold"
                          numberOfLines={1}
                        >
                          {name}
                        </VemtapText>
                        {detail ? (
                          <VemtapText
                            variant="caption"
                            tone="secondary"
                            numberOfLines={1}
                          >
                            {detail}
                          </VemtapText>
                        ) : null}
                      </View>
                      <View style={styles.action}>
                        {starting ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Icon name="message" size={18} color={colors.primary} />
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 14,
  },
  rowPressed: { backgroundColor: colors.surfaceContainer },
  rowMuted: { opacity: 0.5 },
  rowBody: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 14,
    paddingVertical: 10,
  },
  // Hairline inset to the text, the way grouped lists separate rows.
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  action: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
});
