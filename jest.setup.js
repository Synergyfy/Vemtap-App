/* eslint-env jest */

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Mock = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }),
  );
  Mock.displayName = 'GestureHandlerMock';

  return {
    Swipeable: Mock,
    DrawerLayout: Mock,
    State: {},
    ScrollView: Mock,
    Slider: Mock,
    Switch: Mock,
    TextInput: Mock,
    ToolbarAndroid: Mock,
    ViewPagerAndroid: Mock,
    DrawerLayoutAndroid: Mock,
    WebView: Mock,
    NativeViewGestureHandler: Mock,
    TapGestureHandler: Mock,
    FlingGestureHandler: Mock,
    ForceTouchGestureHandler: Mock,
    LongPressGestureHandler: Mock,
    PanGestureHandler: Mock,
    PinchGestureHandler: Mock,
    RotationGestureHandler: Mock,
    RawButton: Mock,
    BaseButton: Mock,
    RectButton: Mock,
    BorderlessButton: Mock,
    gestureHandlerRootHOC: jest.fn(() => Mock),
    GestureHandlerRootView: Mock,
    Directions: {},
    Gesture: {
      Tap: jest.fn(() => ({ onEnd: jest.fn().mockReturnThis() })),
      Pan: jest.fn(() => ({
        onBegin: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      })),
      LongPress: jest.fn(() => ({ onStart: jest.fn().mockReturnThis() })),
      Exclusive: jest.fn(),
      Simultaneous: jest.fn(),
      Race: jest.fn(),
      RequireExternal: jest.fn(),
    },
    GestureDetector: Mock,
    FlatList: Mock,
    Image: Mock,
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text: RNText, Image: RNImage } = require('react-native');

  const mockAnimated = (component) => {
    const Comp = React.forwardRef((props, ref) =>
      React.createElement(component, { ...props, ref }),
    );
    Comp.displayName = 'AnimatedMock';
    return Comp;
  };

  const Easing = {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      View: mockAnimated(View),
      Text: mockAnimated(RNText),
      Image: mockAnimated(RNImage),
      ScrollView: mockAnimated(View),
      FlatList: mockAnimated(View),
      createAnimatedComponent: (c) => mockAnimated(c),
    },
    View: mockAnimated(View),
    Text: mockAnimated(RNText),
    Image: mockAnimated(RNImage),
    ScrollView: mockAnimated(View),
    FlatList: mockAnimated(View),
    createAnimatedComponent: (c) => mockAnimated(c),
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn((v) => ({ value: v })),
    useAnimatedProps: jest.fn(() => ({})),
    useDerivedValue: jest.fn((fn) => ({ value: typeof fn === 'function' ? fn() : fn })),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useWorkletCallback: jest.fn((fn) => fn),
    withTiming: jest.fn((v) => v),
    withSpring: jest.fn((v) => v),
    withDecay: jest.fn((v) => v),
    withDelay: jest.fn((v) => v),
    withRepeat: jest.fn((v) => v),
    withSequence: jest.fn((...v) => v[v.length - 1]),
    cancelAnimation: jest.fn(),
    Easing,
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    interpolate: jest.fn(),
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    FadeIn: {},
    FadeOut: {},
    FadeInDown: {},
    FadeOutUp: {},
    SlideInDown: {},
    SlideOutDown: {},
    Layout: {},
    interpolateColor: jest.fn(),
    measure: jest.fn(() => ({ width: 0, height: 0, x: 0, y: 0 })),
  };
});

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Mock = ({ children, ...props }) =>
    React.createElement(View, props, children);
  Mock.displayName = 'ScreenMock';

  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    screensEnabled: jest.fn(() => false),
    Screen: Mock,
    ScreenContainer: Mock,
    ScreenContext: { Provider: Mock, Consumer: Mock },
    ScreenStack: Mock,
    ScreenStackHeaderConfig: Mock,
    ScreenStackHeaderSubview: Mock,
    ScreenStackHeaderBackButtonImage: Mock,
    ScreenStackHeaderLeftView: Mock,
    ScreenStackHeaderRightView: Mock,
    ScreenStackHeaderCenterView: Mock,
    ScreenStackHeaderSearchBarView: Mock,
    SearchBar: Mock,
    NativeScreen: Mock,
    NativeScreenContainer: Mock,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  const insets = {
    top: 47,
    bottom: 34,
    left: 0,
    right: 0,
    frame: { x: 0, y: 0, width: 390, height: 844 },
  };

  const SafeAreaProvider = ({ children }) => React.createElement(View, {}, children);
  const SafeAreaView = ({ children, ...props }) =>
    React.createElement(View, props, children);

  return {
    SafeAreaProvider,
    SafeAreaView,
    initialWindowMetrics: insets,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaFrameContext: React.createContext({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('react-native-bootsplash', () => ({
  generate: jest.fn(async () => undefined),
  hide: jest.fn(async () => undefined),
  isVisible: jest.fn(async () => false),
  useBootSplash: () => ({ isLoading: false, error: null }),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');

  const FastImage = React.forwardRef((props, ref) =>
    React.createElement(Image, { ...props, ref }),
  );
  FastImage.Priority = { low: 'low', normal: 'normal', high: 'high' };
  FastImage.ResizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  FastImage.CACHE_CONTROL = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };

  return { __esModule: true, default: FastImage, ...FastImage };
});

jest.mock('react-native-config', () => ({
  APP_ENV: 'test',
  API_BASE_URL: 'https://api.test.vemtap.com',
  API_VERSION: 'v1',
  API_TIMEOUT_MS: '1000',
  SENTRY_DSN: '',
  SENTRY_ENABLED: 'false',
  MIN_SUPPORTED_APP_VERSION: '1.0.0',
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(async () => true),
  getGenericPassword: jest.fn(async () => ({
    username: 'accessToken',
    password: 'token',
  })),
  resetGenericPassword: jest.fn(async () => true),
  ACCESS_CONTROL: {},
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  },
  AUTHENTICATION_TYPE: {},
  BIOMETRY_TYPE: {},
  SECURITY_LEVEL: {
    SECURE_SOFTWARE: 'SECURE_SOFTWARE',
    SECURE_HARDWARE: 'SECURE_HARDWARE',
    ANY: 'ANY',
  },
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  class MMKVMock {
    constructor({ id = 'default' } = {}) {
      this.id = id;
    }

    getString(key) {
      return store.get(key);
    }

    set(key, value) {
      store.set(key, String(value));
    }

    delete(key) {
      store.delete(key);
    }

    getAllKeys() {
      return [...store.keys()];
    }
  }
  return {
    __esModule: true,
    MMKV: MMKVMock,
    createMMKV: (options) => new MMKVMock(options),
  };
});

jest.mock('@react-native-firebase/app', () => ({
  apps: [],
  app: jest.fn(() => ({ name: '[DEFAULT]' })),
  initializeApp: jest.fn(),
}));

jest.mock('@react-native-firebase/analytics', () => jest.fn(() => ({
  logEvent: jest.fn(async () => undefined),
  setUserId: jest.fn(async () => undefined),
  setCustomKey: jest.fn(async () => undefined),
})));

jest.mock('@react-native-firebase/messaging', () => jest.fn(() => ({
  requestPermission: jest.fn(async () => 1),
  getToken: jest.fn(async () => 'test-fcm-token'),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(async () => null),
  setBackgroundMessageHandler: jest.fn(),
})));

jest.mock('@react-native-firebase/remote-config', () =>
  jest.fn(() => ({
    setDefaults: jest.fn(async () => undefined),
    fetch: jest.fn(async () => undefined),
    activate: jest.fn(async () => true),
    getValue: jest.fn(() => ({ asString: () => '', asBoolean: () => false, asNumber: () => 0 })),
  })),
);

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setTag: jest.fn(),
  setUser: jest.fn(),
}));

jest.mock('jail-monkey', () => ({
  isJailBroken: jest.fn(() => false),
  isDebuggedMode: jest.fn(async () => false),
  hookDetected: jest.fn(() => false),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));
