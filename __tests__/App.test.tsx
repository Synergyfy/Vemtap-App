/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // Unmount so boot timers/interval cleanup runs and Jest can exit.
  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
}, 30000);
