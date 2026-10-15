import React, { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@components/ui/Icon';
import { VemtapText } from '@components/ui/Text';
import { colors } from '@theme/colors';
import { useKeyboardInset } from '@hooks/useKeyboardInset';
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

/** Share of the window the sheet may occupy while nothing is blocking it. */
const RESTING_MAX_HEIGHT_RATIO = 0.88;

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
  const { keyboardInset, dismissKeyboard } = useKeyboardInset(visible);
  const { height: windowHeight } = useWindowDimensions();
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetOffset = useRef(new Animated.Value(28)).current;
  /**
   * The running entry/exit animation.
   *
   * `Animated.timing().start()` schedules a timer that nothing cancels, so a
   * sheet that goes away mid-entry left a callback to fire against a view that
   * was already gone. That reached for a native handle that no longer existed
   * and threw; because the stray timer outlives the component, it failed
   * whatever test or screen happened to be running next. Stopping the animation
   * is the difference — and it has to happen both on unmount *and* when
   * `visible` goes false, because hiding a sheet tears down the Modal's
   * children while this component stays mounted.
   */
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  // Closing unmounts this listener before the hide event can arrive, so a sheet
  // reopened straight after would otherwise come up still holding the previous
  // lift.
  useEffect(() => {
    if (!visible) {
      dismissKeyboard();
    }
  }, [dismissKeyboard, visible]);

  useEffect(() => {
    if (!visible) {
      // The children are about to be torn down; an entry still running would
      // keep scheduling frames against them.
      animation.current?.stop();
      animation.current = null;
    }
  }, [visible]);

  useEffect(
    () => () => {
      animation.current?.stop();
      animation.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    scrimOpacity.setValue(0);
    sheetOpacity.setValue(0);
    sheetOffset.setValue(28);

    animation.current = Animated.parallel([
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
    ]);
    animation.current.start(() => {
      animation.current = null;
    });
  }, [sheetOffset, sheetOpacity, scrimOpacity, visible]);

  const requestClose = () => {
    animation.current = Animated.parallel([
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
    ]);
    animation.current.start(() => {
      animation.current = null;
      onClose();
    });
  };

  // Keyboard avoidance by measured lift, not `KeyboardAvoidingView` — that
  // component relies on an event/layout race that drops the first keyboard
  // frame on an already-focused screen, and cannot lift anything where the
  // window never resizes (iOS). `useKeyboardInset` reports 0 in exactly those
  // resized-Android cases, where the OS has already made the room, so the two
  // platforms do not double-lift.
  //
  // The height cap moves with it: lifting a full-height sheet by the keyboard
  // would push its header off the top of the window, so with the keyboard up
  // the sheet may only occupy what is left above it.
  const lifted = keyboardInset > 0;
  const maxHeight = lifted
    ? Math.max(windowHeight - keyboardInset, 240)
    : windowHeight * RESTING_MAX_HEIGHT_RATIO;
  // With the keyboard up the home indicator is behind it, so the resting bottom
  // inset would only add height for no reason.
  const sheetPaddingBottom = lifted ? 16 : Math.max(insets.bottom, 16);

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
              // Entry offset and keyboard lift compose as two translateY terms.
              transform: [{ translateY: sheetOffset }, { translateY: -keyboardInset }],
              maxHeight,
              paddingBottom: sheetPaddingBottom,
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
