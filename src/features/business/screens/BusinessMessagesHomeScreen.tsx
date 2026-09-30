import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Button } from '@components/ui/Button';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { strings } from '@constants/strings';
import { TypeDensityProvider } from '@theme/TypeDensityProvider';
import { colors } from '@theme/colors';
import {
  BusinessScreenLayout,
  BusinessSelectionChip,
  BusinessStatusPill,
} from '@features/business/components/BusinessPrimitives';
import { HubSearchField } from '@features/accountHub/components/HubPrimitives';
import { businessMessagePortraits } from '@features/business/data/businessMessagesImages';
import { cn } from '@utils/cn';

cssInterop(Pressable, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
// Required for the thread portraits: without it their `className` is dropped
// and each avatar renders unsized instead of as a 48px circle.
cssInterop(Image, { className: 'style' });

const copy = strings.businessMessages;

type ContextTone = (typeof copy.threads)[number]['contextTone'];

const contextStyles: Record<ContextTone, { chip: string; text: string; icon: string }> = {
  discount: {
    chip: 'bg-badge-discount-bg',
    text: 'text-badge-discount-text',
    icon: colors.badgeDiscountText,
  },
  brand: {
    chip: 'bg-surface-tint-blue',
    text: 'text-primary',
    icon: colors.primary,
  },
  neutral: {
    chip: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    icon: colors.onSurfaceVariant,
  },
};

export interface BusinessMessagesHomeScreenProps {
  onOpenBranchSwitcher?: () => void;
  onOpenThread?: (id: string) => void;
  onNewMessage?: () => void;
  onOpenSearch?: () => void;
  onOpenFilters?: () => void;
  onOpenMoreOptions?: () => void;
}

export function BusinessMessagesHomeScreen({
  onOpenBranchSwitcher,
  onOpenThread,
  onNewMessage,
  onOpenSearch,
  onOpenFilters,
  onOpenMoreOptions,
}: BusinessMessagesHomeScreenProps) {
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');

  // Dense hub: many rows read at a glance, so the subtree (navbar included)
  // uses the compact type density rather than per-row size overrides.
  return (
    <TypeDensityProvider density="compact">
      <BusinessScreenLayout
        header={{
          title: copy.title,
          centerTitle: false,
          showAvatar: true,
          titleAccessory: (
            <BusinessStatusPill label={copy.online} tone="success" icon="checkCircle" />
          ),
          actions: [
            { icon: 'search', label: copy.searchLabel, onPress: onOpenSearch },
            { icon: 'more', label: copy.moreLabel, onPress: onOpenMoreOptions },
          ],
        }}
        contentContainerClassName="pb-24"
        footer={
          <View className="flex-row justify-end px-6 pb-3 pt-2">
            <Button
              label={copy.newMessage}
              labelVariant="labelMd"
              fullWidth={false}
              className="rounded-full px-4"
              leftIcon={<Icon name="message" size={20} color={colors.surface} />}
              onPress={onNewMessage}
            />
          </View>
        }
      >
        <HubSearchField
          value={query}
          onChangeText={setQuery}
          placeholder={copy.searchPlaceholder}
          filterLabel={copy.filterLabel}
          onFilter={onOpenFilters}
        />

        <View className="-mx-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-6 py-1"
          >
            {copy.filters.map((chip, index) => (
              <BusinessSelectionChip
                key={chip.label}
                label={`${chip.label} ${chip.count}`}
                selected={index === filter}
                onPress={() => setFilter(index)}
                tone="brand"
                leading={
                  <>
                    {chip.dot ? (
                      <View className="h-2 w-2 rounded-full bg-primary-container" />
                    ) : null}
                    {chip.icon ? (
                      <Icon
                        name={chip.icon}
                        size={16}
                        color={index === filter ? colors.primary : colors.textSecondary}
                      />
                    ) : null}
                  </>
                }
              />
            ))}
          </ScrollView>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.hubBranch}
          onPress={onOpenBranchSwitcher}
          className="flex-row items-center justify-between gap-2 rounded-lg bg-badge-discount-bg px-3 py-2 shadow-sm"
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <View className="h-2 w-2 shrink-0 rounded-full bg-badge-discount-text" />
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.connected}
            </VemtapText>
            <VemtapText
              variant="caption"
              className="min-w-0 flex-1 text-badge-discount-text"
              numberOfLines={1}
            >
              {`• ${copy.connectedMeta}`}
            </VemtapText>
          </View>
          <View className="shrink-0 flex-row items-center gap-1">
            <VemtapText
              variant="caption"
              className="font-sans-semibold text-badge-discount-text"
            >
              {copy.hubBranch}
            </VemtapText>
            <Icon name="expandMore" size={14} color={colors.badgeDiscountText} />
          </View>
        </Pressable>

        <View className="gap-1">
          {copy.threads.map(thread => (
            <Pressable
              key={thread.id}
              accessibilityRole="button"
              accessibilityLabel={thread.name}
              onPress={() => onOpenThread?.(thread.id)}
              className="flex-row items-start gap-3 rounded-card bg-surface p-3 shadow-sm active:scale-[0.99]"
            >
              <View className="shrink-0">
                <Image
                  source={{ uri: businessMessagePortraits[thread.id].uri }}
                  accessibilityLabel={businessMessagePortraits[thread.id].alt}
                  className="h-12 w-12 rounded-full bg-surface-container"
                  resizeMode="cover"
                />
                {thread.online ? (
                  <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-badge-discount-text" />
                ) : null}
              </View>

              <View className="min-w-0 flex-1 gap-1.5">
                <View className="flex-row items-center justify-between gap-2">
                  <VemtapText
                    variant="labelMd"
                    className="min-w-0 flex-1 font-sans-semibold"
                    numberOfLines={1}
                  >
                    {thread.name}
                  </VemtapText>
                  <VemtapText
                    variant="caption"
                    tone={thread.unread > 0 ? 'brand' : 'tertiary'}
                    className="shrink-0 font-sans-semibold"
                  >
                    {thread.time}
                  </VemtapText>
                </View>

                <View
                  className={cn(
                    'flex-row items-center gap-1 self-start rounded-full px-2 py-0.5',
                    contextStyles[thread.contextTone].chip,
                  )}
                >
                  <Icon
                    name={thread.contextIcon}
                    size={12}
                    color={contextStyles[thread.contextTone].icon}
                  />
                  <VemtapText
                    variant="micro"
                    className={cn(
                      'font-sans-medium',
                      contextStyles[thread.contextTone].text,
                    )}
                    numberOfLines={1}
                  >
                    {thread.context}
                  </VemtapText>
                </View>

                <View className="flex-row items-center justify-between gap-2">
                  {thread.outbound ? (
                    <Icon name="doneAll" size={15} color={colors.primary} />
                  ) : null}
                  <VemtapText
                    variant="bodyMd"
                    tone={thread.unread > 0 ? 'default' : 'secondary'}
                    className={cn(
                      'min-w-0 flex-1',
                      thread.unread > 0 && 'font-sans-medium',
                    )}
                    numberOfLines={1}
                  >
                    {thread.preview}
                  </VemtapText>
                  {thread.unread > 0 ? (
                    <View className="h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                      <VemtapText
                        variant="micro"
                        className="font-sans-bold text-primary-foreground"
                      >
                        {String(thread.unread)}
                      </VemtapText>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </BusinessScreenLayout>
    </TypeDensityProvider>
  );
}
