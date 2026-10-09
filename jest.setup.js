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

  const mockAnimated = component => {
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
      createAnimatedComponent: c => mockAnimated(c),
    },
    View: mockAnimated(View),
    Text: mockAnimated(RNText),
    Image: mockAnimated(RNImage),
    ScrollView: mockAnimated(View),
    FlatList: mockAnimated(View),
    createAnimatedComponent: c => mockAnimated(c),
    useAnimatedStyle: jest.fn(() => ({})),
    useSharedValue: jest.fn(v => ({ value: v })),
    useAnimatedProps: jest.fn(() => ({})),
    useDerivedValue: jest.fn(fn => ({ value: typeof fn === 'function' ? fn() : fn })),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useWorkletCallback: jest.fn(fn => fn),
    withTiming: jest.fn(v => v),
    withSpring: jest.fn(v => v),
    withDecay: jest.fn(v => v),
    withDelay: jest.fn(v => v),
    withRepeat: jest.fn(v => v),
    withSequence: jest.fn((...v) => v[v.length - 1]),
    cancelAnimation: jest.fn(),
    Easing,
    runOnJS: jest.fn(fn => fn),
    runOnUI: jest.fn(fn => fn),
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

  const Mock = ({ children, ...props }) => React.createElement(View, props, children);
  Mock.displayName = 'ScreenMock';

  return {
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
    screensEnabled: jest.fn(() => false),
    Screen: Mock,
    ScreenContainer: Mock,
    ScreenContext: { Provider: Mock, Consumer: Mock },
    ScreenStack: Mock,
    ScreenStackItem: Mock,
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
    compatibilityFlags: {},
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

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/**
 * In-memory stand-in for the Keychain/Keystore.
 *
 * It must actually round-trip values: `jest.setup` used to make `getItemAsync`
 * always resolve to null, which meant `setTokenPair` wrote nowhere and the API
 * client's auth interceptor could never attach a token. Every authenticated
 * live test then 401'd, and the failure looked like a server-side problem
 * rather than the stub.
 *
 * The map lives inside the factory, so jest gives each test file a fresh one.
 * Files that never write still read null, exactly as before.
 */
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async key => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async key => {
      store.delete(key);
    }),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 0,
  })),
  requestPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 0,
  })),
  getExpoPushTokenAsync: jest.fn(async () => ({
    data: 'test-expo-push-token',
    type: 'default',
  })),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  addNotificationReceivedListener: jest.fn(() => () => {}),
  addNotificationResponseReceivedListener: jest.fn(() => () => {}),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setTag: jest.fn(),
  setUser: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View, Image } = require('react-native');

  const create = name => {
    const Comp = ({ children, ...props }) => React.createElement(View, props, children);
    Comp.displayName = name;
    return Comp;
  };

  const SvgUri = ({ uri, ...props }) =>
    React.createElement(Image, { source: { uri }, ...props });
  SvgUri.displayName = 'SvgUriMock';

  return {
    __esModule: true,
    default: create('SvgMock'),
    Svg: create('SvgMock'),
    SvgUri,
    Path: create('PathMock'),
    Circle: create('CircleMock'),
    Rect: create('RectMock'),
    Defs: create('DefsMock'),
    LinearGradient: create('LinearGradientMock'),
    Stop: create('StopMock'),
    G: create('GMock'),
    Text: create('TextMock'),
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  const LinearGradient = ({ children, ...props }) =>
    React.createElement(View, props, children);
  LinearGradient.displayName = 'LinearGradientMock';

  return { LinearGradient };
});

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: true,
    assets: [],
  })),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  })),
  getForegroundPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: {
      latitude: 9.0765,
      longitude: 7.5186,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: 0,
  })),
  Accuracy: {
    Lowest: 1,
    Low: 10,
    Balanced: 3,
    High: 6,
    Highest: 6,
    BestForNavigation: 1,
  },
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
      fitToElements: jest.fn(),
      getCamera: jest.fn(),
    }));
    return React.createElement(View, { ...props, ref });
  });
  MapView.displayName = 'MapViewMock';

  const Marker = ({ children, ...props }) => React.createElement(View, props, children);
  Marker.displayName = 'MarkerMock';

  return {
    __esModule: true,
    default: MapView,
    Marker,
    Polygon: Marker,
    Polyline: Marker,
    Circle: Marker,
    PROVIDER_DEFAULT: 'default',
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('@expo-google-fonts/inter', () => {
  return {
    useFonts: () => [true, null],
    Inter_400Regular: 1,
    Inter_500Medium: 1,
    Inter_600SemiBold: 1,
    Inter_700Bold: 1,
    Inter_800ExtraBold: 1,
  };
});

/**
 * Screens may call TanStack Query hooks directly; React Query throws without a
 * provider ("No QueryClient set"). Wrap every render in a fresh client so
 * suites do not each need their own wrapper. A test that passes its own
 * `wrapper` is nested closer to the component under test, so its client still
 * wins when it provides one.
 */
jest.mock('@testing-library/react-native', () => {
  const actual = jest.requireActual('@testing-library/react-native');
  const React = require('react');
  const QueryClient = require('@tanstack/react-query').QueryClient;
  const QueryClientProvider = require('@tanstack/react-query').QueryClientProvider;

  const mockModule = {
    ...actual,
    render: (ui, options = {}) => {
      const { wrapper, ...rest } = options;
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const tree = wrapper ? React.createElement(wrapper, null, ui) : ui;
      return actual.render(
        React.createElement(QueryClientProvider, { client }, tree),
        rest,
      );
    },
  };

  // `screen` is reassigned by every render. A literal `get screen()` (or the
  // spread of `actual`) would be flattened by the object-spread helper into a
  // pre-render snapshot, so every query would throw "render not called".
  Object.defineProperty(mockModule, 'screen', {
    enumerable: true,
    configurable: true,
    get: () => actual.screen,
  });

  return mockModule;
});

/**
 * The messaging realtime layer must never open a real websocket in tests.
 * Screens and routes can still import the socket module; every call is a no-op.
 */
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    removeAllListeners: jest.fn(),
    connected: false,
    auth: undefined,
  })),
}));

/**
 * Unit tests must never reach the network. Screens query the API on mount, and
 * the HTTP client is axios over XMLHttpRequest, so a real request to the dev
 * host is both slow and retried with exponential backoff. This XHR stub answers
 * every request with a 404 envelope: calls settle on the next microtask, and the
 * query client's retry rule treats 4xx as final, so screens land on their
 * designed fallback copy. Live contract tests opt back in via LIVE_API_TESTS=1.
 */
if (process.env.LIVE_API_TESTS !== '1') {
  const notFoundBody = JSON.stringify({
    statusCode: 404,
    message: 'Not Found',
    error: 'NOT_FOUND',
  });

  class MockXmlHttpRequest {
    constructor() {
      this.readyState = 0;
      this.status = 0;
      this.statusText = '';
      this.responseText = '';
      this.response = '';
      this.responseType = '';
      this.upload = { addEventListener() {}, removeEventListener() {} };
      this.onloadend = null;
      this.onreadystatechange = null;
      this.onerror = null;
      this.ontimeout = null;
      this.onabort = null;
      this.aborted = false;
    }

    open() {
      this.readyState = 1;
    }

    setRequestHeader() {}

    getAllResponseHeaders() {
      return '';
    }

    getResponseHeader() {
      return null;
    }

    addEventListener() {}

    removeEventListener() {}

    abort() {
      this.aborted = true;
    }

    send() {
      this.readyState = 4;
      this.status = 404;
      this.statusText = 'Not Found';
      this.responseText = notFoundBody;
      this.response =
        this.responseType === 'json' ? JSON.parse(notFoundBody) : notFoundBody;
      queueMicrotask(() => {
        this.onloadend?.();
        this.onreadystatechange?.();
      });
    }
  }

  global.XMLHttpRequest = MockXmlHttpRequest;
}
