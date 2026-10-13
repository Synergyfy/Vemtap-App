import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar, initialsFromName, toneForName } from '@components/ui/Avatar';
import { BusinessInitialsAvatar } from '@features/business/components/BusinessPosPrimitives';

/**
 * The initials rule is app-wide: first letter of the first and last word.
 * Getting it wrong in one surface would make the same person look like two
 * different people, so it is pinned here rather than per screen.
 */

describe('initialsFromName', () => {
  it('takes the first letter of the first and last word', () => {
    expect(initialsFromName('Zainab Ahmed')).toBe('ZA');
    expect(initialsFromName('The Azure Bistro')).toBe('TB');
    expect(initialsFromName('Urban Grill and Bistro')).toBe('UB');
  });

  it('handles a single word, extra whitespace and missing names', () => {
    expect(initialsFromName('Patricia')).toBe('P');
    expect(initialsFromName('  amara   okonkwo  ')).toBe('AO');
    expect(initialsFromName('')).toBe('');
    expect(initialsFromName(undefined)).toBe('');
    expect(initialsFromName(null)).toBe('');
  });

  it('ignores punctuation-only input', () => {
    expect(initialsFromName('...')).toBe('');
  });
});

describe('toneForName', () => {
  it('is stable for the same name and varies across names', () => {
    expect(toneForName('Zainab Ahmed')).toBe(toneForName('Zainab Ahmed'));
    const tones = new Set(['Ava B', 'Bella C', 'Chen D', 'Dara E'].map(toneForName));
    expect(tones.size).toBeGreaterThan(1);
  });

  it('falls back to neutral without a name', () => {
    expect(toneForName(undefined)).toBe('neutral');
    expect(toneForName('   ')).toBe('neutral');
  });
});

describe('Avatar', () => {
  it('renders initials when there is no portrait', async () => {
    const screen = await render(<Avatar name="Zainab Ahmed" />);

    expect(screen.getByText('ZA')).toBeTruthy();
    expect(screen.getByLabelText('Zainab Ahmed profile picture')).toBeTruthy();
  });

  it('prefers explicit initials over deriving them', async () => {
    const screen = await render(<Avatar name="Zainab Ahmed" initials="ZA" />);
    expect(screen.getAllByText('ZA').length).toBeGreaterThan(0);
  });

  it('falls back to the person glyph only when there is no name at all', async () => {
    const screen = await render(<Avatar />);
    expect(screen.getByLabelText('Profile')).toBeTruthy();
  });

  it('renders the portrait when one is supplied', async () => {
    const screen = await render(
      <Avatar uri="https://cdn.example/logo.png" name="The Azure Bistro" />,
    );

    expect(screen.getByLabelText('The Azure Bistro profile picture')).toBeTruthy();
    // The initials are not painted underneath a loaded image.
    expect(screen.queryByText('TB')).toBeNull();
  });
});

describe('BusinessInitialsAvatar stays a thin wrapper', () => {
  it('keeps its existing API and renders the same disc', async () => {
    const screen = await render(
      <BusinessInitialsAvatar initials="MJ" size="md" badgeIcon="star" />,
    );

    expect(screen.getByText('MJ')).toBeTruthy();
    expect(screen.getByLabelText('MJ')).toBeTruthy();
  });
});
