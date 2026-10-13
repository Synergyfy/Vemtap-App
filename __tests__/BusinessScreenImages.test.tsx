import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { strings } from '@constants/strings';

/**
 * Guards the two failure modes that make remote art vanish:
 *  - a truncated / mistyped Stitch URL (the request 404s), and
 *  - a missing `cssInterop(Image)` registration (the className is dropped and
 *    the image renders unsized).
 *
 * Only the catalogue item artwork is remote now. The business cover and logo
 * come from the API, and the customer's portrait falls back to initials, so
 * none of the three is a hardcoded url worth linting.
 */
interface RenderedNode {
  type?: string;
  props?: Record<string, unknown> & { source?: { uri?: string } };
  children?: RenderedNode[] | null;
}

function collectRemoteImages(node: RenderedNode | null | undefined): string[] {
  if (!node) return [];
  const own =
    typeof node.props?.source?.uri === 'string' ? [node.props.source.uri as string] : [];
  const nested = (node.children ?? []).flatMap(child =>
    collectRemoteImages(child as RenderedNode),
  );
  return [...own, ...nested];
}

function expectUsableImages(label: string, tree: unknown, minimum: number) {
  const uris = collectRemoteImages(tree as RenderedNode);
  expect(`${label}: found ${uris.length} remote image(s)`).toContain(
    `found ${minimum} remote image(s)`,
  );
  uris.forEach(uri => {
    // Complete Stitch URLs, never a cut-off prefix (those 404 and render blank).
    expect(uri).toMatch(
      /^https:\/\/lh3\.googleusercontent\.com\/aida-public\/[A-Za-z0-9_\-]{60,}$/,
    );
  });
}

describe('remote imagery', () => {
  it('renders a resolved image for every order detail item', async () => {
    const view = await render(<OrderDetailScreen onBack={() => undefined} />);
    const copy = strings.businessOrderDetail;
    expectUsableImages('order detail', view.toJSON(), copy.items.length);
    copy.items.forEach(item => {
      expect(screen.getByLabelText(item.imageAlt)).toBeTruthy();
    });
  });
});
