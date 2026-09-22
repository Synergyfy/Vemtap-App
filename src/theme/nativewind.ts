import { cssInterop } from 'nativewind';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Single place to wire className/contentContainerClassName for RN + SafeArea
 * components. Import this once from App.tsx before any screen renders —
 * SafeAreaView/ScrollView/FlatList are NOT auto-interopped by NativeWind.
 */
cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
cssInterop(FlatList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
