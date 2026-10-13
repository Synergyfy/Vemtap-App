import React from 'react';
import { Image, View } from 'react-native';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';

const merchantThumbnail = {
  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqx_chQxFA1JDezBmai9JKaK2_VSbVcWG08duHTy9WqIStdgSnRn6pcaz-5rHrhL1pgP9lY438PWJMvFXMaclxaL6e0Sy3PsldCXnXOqaU6fTRhjAM2JLQSuSfCZKOfBp9_RpV3csZb5vvbOyeLETSLCGFJ61C0C18Y37Yr4Z_IM012MMWw6T0K1JWaP53ulQqOLC6WWW4qGhB3beje45UjVg29rMTim6FMJ3yRGbjKEQ68j11aGrORg',
};

export interface ConversationBubbleProps {
  message: string;
  time: string;
  sender: 'customer' | 'merchant';
  /**
   * Whether this message was written by whoever is looking at the screen. It
   * decides the side and the colour: your own message sits right in primary, the
   * other party's sits left on a surface card.
   *
   * It cannot be derived from `sender`, because "who wrote it" and "who am I"
   * flip between the two chat screens — the customer screen's own messages are
   * the customer's, the business screen's are the merchant's. Defaults to the
   * customer view so that screen keeps working without passing it.
   */
  isOwn?: boolean;
  /** Hosted image sent with the message; rendered above the caption. */
  mediaUrl?: string;
  children?: React.ReactNode;
}

export function ConversationBubble({
  message,
  time,
  sender,
  isOwn,
  mediaUrl,
  children,
}: ConversationBubbleProps) {
  const own = isOwn ?? sender === 'customer';
  // Identity decides the avatar, not perspective: only a message that really
  // came from a merchant shows the merchant's face, so the business screen never
  // puts a shop's avatar next to a customer's message.
  const showAvatar = !own && sender === 'merchant';

  return (
    <View
      className={own ? 'w-[88%] items-end self-end' : 'w-[88%] items-start self-start'}
    >
      <View className="w-full flex-row items-end">
        {showAvatar ? (
          <View className="mr-2 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container">
            <Image source={merchantThumbnail} className="h-full w-full" />
          </View>
        ) : null}
        <View className={`min-w-0 flex-1 ${own ? 'items-end' : 'items-start'}`}>
          {mediaUrl ? (
            <Image
              accessibilityLabel="Attached photo"
              source={{ uri: mediaUrl }}
              resizeMode="cover"
              className="mb-1 h-48 w-full rounded-2xl bg-surface-container"
            />
          ) : null}
          {message ? (
            <VemtapText
              variant="bodyMd"
              tone={own ? 'inverse' : 'default'}
              className={`max-w-full rounded-2xl p-3 shadow-sm ${
                mediaUrl
                  ? own
                    ? 'rounded-tr-sm bg-primary'
                    : 'rounded-tl-sm bg-surface text-text'
                  : own
                    ? 'rounded-2xl rounded-tr-sm bg-primary'
                    : 'rounded-2xl rounded-tl-sm bg-surface text-text'
              }`}
            >
              {message}
            </VemtapText>
          ) : null}
          {children ? <View className="mt-1 w-full">{children}</View> : null}
        </View>
      </View>
      <View
        className={`mt-1 flex-row items-center gap-1 ${own ? 'pr-1' : showAvatar ? 'pl-10' : 'pl-1'}`}
      >
        <VemtapText variant="caption" tone="tertiary">
          {time}
        </VemtapText>
        {own ? <Icon name="doneAll" size={15} color={colors.primary} /> : null}
      </View>
    </View>
  );
}
