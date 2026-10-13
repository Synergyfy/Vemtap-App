import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { cn } from '@utils/cn';
import { Icon, type IconName } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';

/**
 * The shared identity disc: a portrait when one exists, the person's or
 * business's initials when it does not.
 *
 * Initials come from the **first and last** word of the name, so
 * `Zainab Ahmed` reads "ZA" and `The Azure Bistro` reads "TB" — the same rule
 * everywhere, which is why it lives here instead of in each screen. A user with
 * no name at all falls back to the person glyph rather than an empty circle.
 *
 * Tone is derived from the name so the same account always gets the same colour
 * and two avatars in one list stay distinguishable without any image assets;
 * pass `tone` to pin it explicitly (brand surfaces usually want that).
 */
export type AvatarTone = 'brand' | 'success' | 'tertiary' | 'neutral' | 'inverse';

const avatarTones: Record<AvatarTone, string> = {
  brand: 'bg-primary text-primary-foreground',
  success: 'bg-badge-discount-bg text-badge-discount-text',
  tertiary: 'bg-tertiary-fixed text-tertiary',
  neutral: 'bg-surface-container-high text-text-primary',
  inverse: 'bg-inverse-surface text-inverse-on-surface',
};

/** Stable tone for a name, so the same person is always the same colour. */
const autoTones: AvatarTone[] = ['brand', 'tertiary', 'success', 'neutral'];

export function toneForName(name: string | undefined | null): AvatarTone {
  const key = (name ?? '').trim();
  if (!key) return 'neutral';
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 100000;
  }
  return autoTones[hash % autoTones.length];
}

/** First letter of the first and last word, upper-cased. */
export function initialsFromName(name?: string | null): string {
  // Punctuation-only fragments ("...", "•") are skipped so a decorative name
  // cannot paint a stray glyph as someone's initials.
  const words = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(word => /\p{L}/u.test(word));
  if (words.length === 0) return '';
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return `${first}${last}`.toUpperCase();
}

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const avatarSizes: Record<AvatarSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export interface AvatarProps {
  /** Portrait or logo URL. A load failure falls through to the initials. */
  uri?: string | null;
  /** Person or business name — the initials and the auto tone come from it. */
  name?: string | null;
  /** Explicit initials, when the caller already computed them. */
  initials?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  /** Optional role badge glyph pinned to the bottom-right. */
  badgeIcon?: IconName;
  className?: string;
  accessibilityLabel?: string;
}

export function Avatar({
  uri,
  name,
  initials,
  size = 'md',
  tone,
  badgeIcon,
  className,
  accessibilityLabel,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedInitials = (initials ?? initialsFromName(name)).trim();
  const label =
    accessibilityLabel ??
    (name?.trim() ? `${name.trim()} profile picture` : resolvedInitials || 'Profile');
  const showImage = Boolean(uri) && !imageFailed;

  return (
    <View className={cn('relative shrink-0', avatarSizes[size], className)}>
      <View
        accessibilityRole="image"
        accessibilityLabel={label}
        className={cn(
          'flex-1 items-center justify-center overflow-hidden rounded-full',
          !showImage && (avatarTones[tone ?? toneForName(name)] ?? avatarTones.neutral),
        )}
      >
        {showImage ? (
          <Image
            source={{ uri: uri as string }}
            onError={() => setImageFailed(true)}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : resolvedInitials ? (
          <VemtapText
            variant={size === 'lg' || size === 'xl' ? 'headingSm' : 'labelMd'}
            className="font-sans-semibold"
          >
            {resolvedInitials}
          </VemtapText>
        ) : (
          <Icon name="person" size={size === 'xs' ? 12 : 18} color="#FFFFFF" />
        )}
      </View>
      {badgeIcon ? (
        <View className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Icon name={badgeIcon} size={13} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}
