import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '@theme/colors';

/**
 * The claim's QR, as the SVG the server generated from the claim code
 * (`GET /me/claims/:id/qr`). Until it arrives the square holds a spinner rather
 * than a decorative pattern that would scan as nothing.
 */
export function ClaimPassQrCode({
  svg,
  size = 192,
  label,
}: {
  svg?: string | null;
  size?: number;
  label: string;
}) {
  if (!svg) {
    return (
      <View
        style={{ width: size, height: size }}
        className="items-center justify-center"
        accessibilityLabel={label}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <SvgXml xml={svg} width={size} height={size} accessibilityLabel={label} />;
}
