import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { BusinessMessagesHomeScreen } from '@features/business/screens/BusinessMessagesHomeScreen';
import { OrderDetailScreen } from '@features/business/screens/BusinessOrderDetailScreen';
import { businessMessagePortraits } from '@features/business/data/businessMessagesImages';
import { businessHubMedia } from '@features/business/data/businessHubImages';
import { strings } from '@constants/strings';

/**
 * Guards the two failure modes that make remote art vanish:
 *  - a truncated / mistyped Stitch URL (the request 404s), and
 *  - a missing `cssInterop(Image)` registration (the className is dropped and
 *    the image renders unsized).
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
  it('every messages portrait is a complete Stitch url', () => {
    const copy = strings.businessMessages;
    copy.threads.forEach(thread => {
      const portrait = businessMessagePortraits[thread.id];
      expect(portrait).toBeDefined();
      expect(portrait.uri).toMatch(
        /^https:\/\/lh3\.googleusercontent\.com\/aida-public\/[A-Za-z0-9_\-]{60,}$/,
      );
      expect(portrait.alt.length).toBeGreaterThan(10);
    });
  });

  it('the business hub cover and logo are complete Stitch urls', () => {
    [businessHubMedia.cover, businessHubMedia.logo].forEach(image => {
      expect(image.uri).toMatch(
        /^https:\/\/lh3\.googleusercontent\.com\/aida-public\/[A-Za-z0-9_\-]{60,}$/,
      );
    });
  });

  it('renders one resolved portrait per messages thread', async () => {
    const view = await render(<BusinessMessagesHomeScreen />);
    const copy = strings.businessMessages;
    expectUsableImages('messages', view.toJSON(), copy.threads.length);
    copy.threads.forEach(thread => {
      expect(screen.getByLabelText(businessMessagePortraits[thread.id].alt)).toBeTruthy();
    });
  });

  it('renders a resolved image for the order detail customer and items', async () => {
    const view = await render(<OrderDetailScreen onBack={() => undefined} />);
    const copy = strings.businessOrderDetail;
    expectUsableImages('order detail', view.toJSON(), copy.items.length + 1);
    expect(screen.getByLabelText(`${copy.customerName} portrait`)).toBeTruthy();
    copy.items.forEach(item => {
      expect(screen.getByLabelText(item.imageAlt)).toBeTruthy();
    });
  });
});
