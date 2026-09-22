/**
 * @format
 */

import { registerRootComponent } from 'expo';
import App from './App';
import { initSentry } from './src/utils/sentry';

initSentry();

registerRootComponent(App);
