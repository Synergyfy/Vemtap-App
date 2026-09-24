import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@theme/colors';

export function ClaimPassQrCode({ size = 192 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityLabel="Deal redemption QR code"
    >
      <Path
        fill={colors.surfaceDark}
        d="M5 5h30v30H5V5zm6 6v18h18V11H11zM15 15h10v10H15v-10zM65 5h30v30H65V5zm6 6v18h18V11H71zM75 15h10v10H75v-10zM5 65h30v30H5V65zm6 6v18h18V71H11zM15 75h10v10H15v-10z"
      />
      <Path
        fill={colors.surfaceDark}
        d="M42 6h6v6h-6zm12 0h6v6h-6zm-12 12h18v6H42zm0 12h6v6h-6zm12 0h6v6h-6zM6 42h6v6H6zm12 0h6v12h-6zm12 0h6v6h-6zm12 0h12v6H42zm18 0h6v18h-6zm12 0h6v6h-6zm12 0h6v12h-6zm-42 12h6v6h-6zm12 0h12v6H54zm-30 6h6v6h-6zm12 0h6v12h-6zm24 0h12v6H66zm24 0h6v6h-6zm-48 6h6v6h-6zm36 0h6v18h-6zm-48 6h6v12H30zm12 0h6v6h-6zm24 0h6v6h-6zm-24 12h12v6H42zm24 0h6v6h-6zm12 0h12v6H78zm-36 6h6v6h-6zm24 0h18v6H66zm-18 6h12v6H48z"
      />
      <Path fill={colors.primary} d="M36 36h28v28H36z" />
      <Path fill={colors.surface} d="m43 43 7 14 7-14h-4l-3 8-3-8z" />
    </Svg>
  );
}
