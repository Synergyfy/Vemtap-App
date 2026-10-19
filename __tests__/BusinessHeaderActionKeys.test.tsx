import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { BusinessScreenLayout } from '@features/business/components/BusinessPrimitives';

/**
 * Header actions were keyed by label, and several screens gave the bell and
 * the profile button the same label, so React warned about duplicate keys
 * ("Encountered two children with the same key, `More`").
 */
test('header actions with the same label render without a duplicate-key warning', async () => {
  const errors: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(' '));
  };
  try {
    await render(
      <BusinessScreenLayout
        header={{
          title: 'More',
          actions: [
            { icon: 'bellRing', label: 'More', onPress: jest.fn() },
            { icon: 'accountCircle', label: 'More', onPress: jest.fn() },
          ],
        }}
      >
        <Text>Body</Text>
      </BusinessScreenLayout>,
    );
  } finally {
    console.error = original;
  }
  expect(errors.filter(line => line.includes('same key'))).toEqual([]);
});
