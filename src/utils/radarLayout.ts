import type { ViewStyle } from 'react-native';

/**
 * Position a circle so its center matches the parent’s center.
 * React Native does NOT center bare absolute children the way CSS flex does —
 * without explicit left/top the circle sits at the top-left and rings misalign
 * (especially visible on Android). Use this for every concentric radar ring.
 *
 * @param size diameter in dp
 */
export function concentricCircle(size: number): ViewStyle {
  return {
    position: 'absolute',
    width: size,
    height: size,
    left: '50%',
    top: '50%',
    marginLeft: -size / 2,
    marginTop: -size / 2,
    borderRadius: size / 2,
  };
}

/** Same centering for non-square absolute boxes (e.g. SVG sweep layer). */
export function concentricBox(width: number, height: number): ViewStyle {
  return {
    position: 'absolute',
    width,
    height,
    left: '50%',
    top: '50%',
    marginLeft: -width / 2,
    marginTop: -height / 2,
  };
}
