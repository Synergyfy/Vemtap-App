/**
 * Regression test for the css-interop upgrade-warning crash (nativewind #1711 /
 * #1712, #1466): printUpgradeWarning used to JSON.stringify the component props
 * with a recursive Object.entries walk. React Navigation v7 context objects
 * expose getters that throw by design ("Couldn't find a navigation context."),
 * so any late class upgrade (conditionally toggled shadow or opacity classes)
 * on a component in a navigation tree white-screened the app.
 * patches/react-native-css-interop+0.2.7 makes the serializer failure-proof;
 * this suite pins that behavior.
 */
import { View } from 'react-native';

type UpgradeStateShape = {
  pressable: number;
  animated: number;
  variables: number;
  containers: number;
  canUpgradeWarn: boolean;
  originalProps: Record<string, unknown>;
};

// The dist module is CJS without types; only these two exports are used.
// The disable has to sit directly above the `require` on the next line: the
// statement wraps, so a comment above `const cssInteropRender` covers the
// binding and suppresses nothing.
const cssInteropRender =
  // eslint-disable-next-line global-require
  require('react-native-css-interop/dist/runtime/native/render-component.js') as {
    renderComponent: (
      baseComponent: unknown,
      state: UpgradeStateShape,
      props: Record<string, unknown>,
      possiblyAnimatedProps: Record<string, unknown>,
      variables: unknown,
      containers: unknown,
    ) => unknown;
    UpgradeState: {
      NONE: number;
      SHOULD_UPGRADE: number;
      UPGRADED: number;
      WARNED: number;
    };
  };

function pressableUpgradeState(
  originalProps: Record<string, unknown>,
): UpgradeStateShape {
  return {
    pressable: cssInteropRender.UpgradeState.SHOULD_UPGRADE,
    animated: cssInteropRender.UpgradeState.NONE,
    variables: cssInteropRender.UpgradeState.NONE,
    containers: cssInteropRender.UpgradeState.NONE,
    canUpgradeWarn: true,
    originalProps,
  };
}

describe('patched css-interop upgrade warning', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('survives props whose getters throw, like React Navigation context objects', () => {
    const navigationContextLike = {
      get getState(): never {
        throw new Error(
          "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?",
        );
      },
    };

    let rendered: unknown;
    expect(() => {
      rendered = cssInteropRender.renderComponent(
        View,
        pressableUpgradeState({ navigation: navigationContextLike }),
        {},
        {},
        undefined,
        undefined,
      );
    }).not.toThrow();
    expect(rendered).toBeDefined();

    const warning = String(logSpy.mock.calls[0]?.[0] ?? '');
    expect(warning).toContain('CssInterop upgrade warning');
    expect(warning).toContain('[Unserializable]');
  });

  it('falls back to a plain warning when even Object.keys throws', () => {
    const hostileProps = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error('ownKeys trap');
        },
        getOwnPropertyDescriptor() {
          throw new Error('ownKeys trap');
        },
      },
    );

    expect(() => {
      cssInteropRender.renderComponent(
        View,
        pressableUpgradeState(hostileProps),
        {},
        {},
        undefined,
        undefined,
      );
    }).not.toThrow();

    const warning = String(logSpy.mock.calls[0]?.[0] ?? '');
    expect(warning).toContain('CssInterop upgrade warning');
    expect(warning).toContain('could not be serialized');
  });
});
