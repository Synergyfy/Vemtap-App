import React from 'react';
import { render } from '@testing-library/react-native';
import { HeroImageGallery } from '@components/shared/HeroImageGallery';

describe('product hero gallery', () => {
  it('swipes when there are several photos', async () => {
    const view = await render(
      <HeroImageGallery
        images={[{ uri: 'https://cdn.test/a.jpg' }, { uri: 'https://cdn.test/b.jpg' }]}
        accessibilityLabel="Jollof bowl"
        testID="product-hero-gallery"
      />,
    );
    expect(view.getByTestId('product-hero-gallery').props.pagingEnabled).toBe(true);
    expect(view.getByLabelText('Jollof bowl, 1 of 2')).toBeTruthy();
  });

  it('stays a plain photo with one image', async () => {
    const view = await render(
      <HeroImageGallery
        images={[{ uri: 'https://cdn.test/a.jpg' }]}
        accessibilityLabel="Jollof bowl"
        testID="product-hero-gallery"
      />,
    );
    expect(view.queryByTestId('product-hero-gallery')).toBeNull();
    expect(view.getByLabelText('Jollof bowl')).toBeTruthy();
  });
});
