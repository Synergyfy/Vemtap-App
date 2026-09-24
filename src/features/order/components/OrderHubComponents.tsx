import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { Button } from '@components/ui/Button';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

export interface OrderHubCardProps {
  image: ImageSourcePropType;
  merchant: string;
  meta: string;
  status: string;
  statusTone?: 'success' | 'brand' | 'warning';
  children: React.ReactNode;
  actions: Array<{ label: string; onPress: () => void; primary?: boolean }>;
  onPress?: () => void;
  accent?: boolean;
}

export function OrderHubCard({
  image,
  merchant,
  meta,
  status,
  statusTone = 'success',
  children,
  actions,
  onPress,
  accent = false,
}: OrderHubCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={merchant}
      onPress={onPress}
      disabled={!onPress}
      className={`w-full overflow-hidden rounded-xl bg-surface p-4 shadow-sm ${accent ? 'relative' : ''}`}
    >
      {accent ? (
        <View className="absolute left-0 top-0 h-full w-1.5 bg-tertiary" />
      ) : null}
      <View className="flex-row items-start gap-3">
        <Image
          source={image}
          className="h-12 w-12 shrink-0 rounded-xl bg-surface-container"
        />
        <View className="min-w-0 flex-1">
          <VemtapText variant="headingSm" numberOfLines={1}>
            {merchant}
          </VemtapText>
          <VemtapText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            className="mt-0.5"
          >
            {meta}
          </VemtapText>
        </View>
        <View
          className={`shrink-0 rounded-full px-2.5 py-1 ${
            statusTone === 'brand'
              ? 'bg-surface-tint'
              : statusTone === 'warning'
                ? 'bg-tertiary-fixed'
                : 'bg-success-container'
          }`}
        >
          <VemtapText
            variant="labelSm"
            tone={
              statusTone === 'brand'
                ? 'brand'
                : statusTone === 'warning'
                  ? 'default'
                  : 'success'
            }
            className="font-sans-semibold"
          >
            {status}
          </VemtapText>
        </View>
      </View>
      <View className="mt-3">{children}</View>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {actions.map(action => (
          <Button
            key={action.label}
            label={action.label}
            variant={action.primary ? 'primary' : 'secondary'}
            size="sm"
            fullWidth={false}
            onPress={action.onPress}
            className="min-w-[100px] flex-1"
          />
        ))}
      </View>
    </Pressable>
  );
}

export interface OrderStatusTimelineRowProps {
  title: string;
  body: string;
  meta: string;
  state: 'complete' | 'active' | 'pending';
  icon: IconName;
  last?: boolean;
}

export function OrderStatusTimelineRow({
  title,
  body,
  meta,
  state,
  icon,
  last = false,
}: OrderStatusTimelineRowProps) {
  const active = state === 'active';
  const complete = state === 'complete';

  return (
    <View className="flex-row items-start gap-3">
      <View className="items-center">
        <View
          className={`h-7 w-7 items-center justify-center rounded-full ${
            complete
              ? 'bg-primary'
              : active
                ? 'bg-primary ring-4 ring-secondary-fixed'
                : 'bg-surface-container-highest'
          }`}
        >
          <Icon
            name={icon}
            size={15}
            color={complete || active ? colors.surface : colors.textTertiary}
          />
        </View>
        {!last ? (
          <View
            className={`h-10 w-0.5 ${complete ? 'bg-primary' : 'bg-surface-container-highest'}`}
          />
        ) : null}
      </View>
      <View className="min-w-0 flex-1 pt-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <VemtapText
            variant="labelMd"
            tone={active ? 'brand' : complete ? 'default' : 'tertiary'}
            className={`min-w-0 flex-1 ${complete || active ? 'font-sans-semibold' : ''}`}
          >
            {title}
          </VemtapText>
          <VemtapText
            variant={active ? 'labelSm' : 'caption'}
            tone={active ? 'brand' : 'tertiary'}
            className={active ? 'shrink-0 font-sans-semibold' : 'shrink-0'}
          >
            {meta}
          </VemtapText>
        </View>
        <VemtapText
          variant="caption"
          tone={complete ? 'secondary' : 'tertiary'}
          className="mt-0.5"
        >
          {body}
        </VemtapText>
      </View>
    </View>
  );
}
