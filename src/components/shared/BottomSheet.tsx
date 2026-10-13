import React, { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { cn } from '@utils/cn';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  titleVariant?: 'displayMobile' | 'headingXl' | 'headingLg' | 'headingMd' | 'headingSm';
  titleClassName?: string;
  count?: number;
  children: ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  titleVariant = 'headingXl',
  titleClassName,
  count,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetOffset = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    scrimOpacity.setValue(0);
    sheetOpacity.setValue(0);
    sheetOffset.setValue(28);

    Animated.parallel([
      Animated.timing(scrimOpacity, {
        toValue: 1,
        duration: 180,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOffset, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sheetOffset, sheetOpacity, scrimOpacity, visible]);

  const requestClose = () => {
    Animated.parallel([
      Animated.timing(scrimOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOffset, {
        toValue: 28,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={requestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={requestClose}
          style={[styles.scrim, { opacity: scrimOpacity }]}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetOffset }],
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <VemtapText variant={titleVariant} className={cn(titleClassName)}>
                {title}
              </VemtapText>
              {typeof count === 'number' ? (
                <View style={styles.countBadge}>
                  <VemtapText className="font-sans-bold text-label-sm text-primary">
                    {count}
                  </VemtapText>
                </View>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${title.toLowerCase()}`}
              onPress={requestClose}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(41, 48, 64, 0.65)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.surfaceContainerHighest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
});
