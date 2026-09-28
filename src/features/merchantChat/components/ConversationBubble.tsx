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
  children?: React.ReactNode;
}

export function ConversationBubble({
  message,
  time,
  sender,
  children,
}: ConversationBubbleProps) {
  const customer = sender === 'customer';

  return (
    <View
      className={
        customer ? 'w-[88%] items-end self-end' : 'w-[88%] items-start self-start'
      }
    >
      <View className="w-full flex-row items-end">
        {!customer ? (
          <View className="mr-2 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-container">
            <Image source={merchantThumbnail} className="h-full w-full" />
          </View>
        ) : null}
        <View className={`min-w-0 flex-1 ${customer ? 'items-end' : 'items-start'}`}>
          <VemtapText
            variant="bodyMd"
            tone={customer ? 'inverse' : 'default'}
            className={`max-w-full rounded-2xl p-3 shadow-sm ${
              customer ? 'rounded-tr-sm bg-primary' : 'rounded-tl-sm bg-surface text-text'
            }`}
          >
            {message}
          </VemtapText>
          {children ? <View className="mt-1 w-full">{children}</View> : null}
        </View>
      </View>
      <View className={`mt-1 flex-row items-center gap-1 ${customer ? 'pr-1' : 'pl-10'}`}>
        <VemtapText variant="caption" tone="tertiary">
          {time}
        </VemtapText>
        {customer ? <Icon name="doneAll" size={15} color={colors.primary} /> : null}
      </View>
    </View>
  );
}
