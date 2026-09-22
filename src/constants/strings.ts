export const strings = {
  app: {
    name: 'Vemtap',
    tagline: 'One Tap. Lifetime Customer.',
  },
  common: {
    loading: 'Loading…',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    error: 'Something went wrong. Please try again.',
    offline: 'You are offline. Some features may be unavailable.',
    empty: 'Nothing here yet.',
    next: 'Next',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    signOut: 'Sign Out',
  },
  auth: {
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    invalidCredentials: 'Invalid email or password.',
  },
  errors: {
    network: 'Network error. Check your connection.',
    timeout: 'Request timed out. Please try again.',
    unauthorized: 'Your session has expired. Please sign in again.',
    forbidden: 'You do not have permission to do that.',
    notFound: 'Not found.',
    validation: 'Please check the highlighted fields.',
    server: 'Server error. Please try again later.',
  },
} as const;
