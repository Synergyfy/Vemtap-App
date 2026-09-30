import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { strings } from '@constants/strings';
import { BusinessHubCentralManagementScreen } from '@features/business/screens/BusinessHubCentralManagementScreen';

const copy = strings.businessHub;

afterEach(cleanup);

interface Node {
  props?: { className?: string; numberOfLines?: number; children?: unknown };
  children?: unknown;
}

function byClass(node: unknown, needle: string, acc: Node[] = []): Node[] {
  if (!node) return acc;
  if (Array.isArray(node)) {
    (node as unknown[]).forEach(child => byClass(child, needle, acc));
    return acc;
  }
  const current = node as Node;
  const className = current.props?.className;
  if (typeof className === 'string' && className.includes(needle)) acc.push(current);
  byClass(current.props?.children ?? current.children, needle, acc);
  return acc;
}

function allClassNames(node: unknown, acc: string[] = []): string[] {
  if (!node) return acc;
  if (Array.isArray(node)) {
    (node as unknown[]).forEach(child => allClassNames(child, acc));
    return acc;
  }
  const current = node as Node;
  const className = current.props?.className;
  if (typeof className === 'string') acc.push(className);
  allClassNames(current.props?.children ?? current.children, acc);
  return acc;
}

describe('business hub branch switcher row', () => {
  it('lets the branch cluster shrink and the trailing action keep its label', async () => {
    await render(<BusinessHubCentralManagementScreen />);
    const tree = screen.toJSON();

    const row = byClass(tree, 'z-20 flex-row')[0];
    expect(row.props?.className).toBe('z-20 flex-row items-center gap-2');

    // Left cluster must be allowed to shrink (min-w-0 + flex-1), otherwise the
    // label pushes the row past the content gutter.
    const left = byClass(tree, 'min-w-0 flex-1')[0];
    expect(left.props?.className).toBe('min-w-0 flex-1 items-start');

    // The trailing "Preview Storefront" action keeps its full label.
    const trailing = byClass(tree, 'shrink-0')[0];
    expect(trailing.props?.className).toContain('shrink-0');
  });

  it('truncates the branch label on one line with no fixed pixel cap', async () => {
    await render(<BusinessHubCentralManagementScreen />);
    const tree = screen.toJSON();
    const label = byClass(tree, 'flex-1 font-sans-semibold')[0];
    expect(label.props?.numberOfLines).toBe(1);
    // A max-w-[Npx] cap is what forced the two-line wrap in the first place.
    expect(allClassNames(tree).some(name => /max-w-\[\d+px\]/.test(name))).toBe(false);
  });

  it('clamps the branch popover to the viewport', async () => {
    await render(<BusinessHubCentralManagementScreen />);
    await fireEvent.press(
      screen.getByLabelText(`${copy.viewingPrefix}: ${copy.branchOptions[0]}`),
    );
    const popover = byClass(screen.toJSON(), 'w-64')[0];
    expect(popover.props?.className).toContain('max-w-[70vw]');
  });

  it('switches branches from the popover', async () => {
    await render(<BusinessHubCentralManagementScreen />);
    const label = `${copy.viewingPrefix}: ${copy.branchOptions[0]}`;
    await fireEvent.press(screen.getByLabelText(label));
    await fireEvent.press(screen.getByLabelText(copy.branchOptions[1]));
    expect(
      screen.getByLabelText(`${copy.viewingPrefix}: ${copy.branchOptions[1]}`),
    ).toBeTruthy();
  });
});
