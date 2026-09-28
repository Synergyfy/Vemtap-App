import {
  compactTypeScale,
  denseTypeScale,
  typeMetrics,
  typeScale,
  typeSizeClassPattern,
  typeScales,
  textVariants,
} from '@theme/typography';

const FONT_SIZE_TOKENS = [
  'micro',
  'caption',
  'label-sm',
  'label-md',
  'body-md',
  'button-md',
  'body-lg',
  'heading-sm',
  'heading-md',
  'heading-lg',
  'heading-xl',
  'display-mobile',
  'display',
] as const;

test('type scale covers every documented text size in ascending order', () => {
  expect(Object.keys(typeScale)).toEqual([...FONT_SIZE_TOKENS]);

  const sizes = FONT_SIZE_TOKENS.map(token => typeScale[token].size);
  const ascending = [...sizes].sort((a, b) => a - b);
  expect(sizes).toEqual(ascending);
});

test('every VemtapText variant maps to a real scale token', () => {
  Object.values(textVariants).forEach(token => {
    expect(FONT_SIZE_TOKENS).toContain(token);
  });
});

test('typeMetrics returns the same numbers the scale declares', () => {
  expect(typeMetrics('micro')).toEqual({ fontSize: 11, lineHeight: 13 });
  expect(typeMetrics('body-md')).toEqual({ fontSize: 15, lineHeight: 20 });
  expect(typeMetrics('heading-xl')).toEqual({ fontSize: 27, lineHeight: 33 });
});

test('smallest step stays legible and line heights fit their size', () => {
  expect(typeScale.micro.size).toBeGreaterThanOrEqual(11);

  Object.values(typeScale).forEach(metric => {
    expect(metric.lineHeight).toBeGreaterThanOrEqual(metric.size);
    expect(metric.lineHeight).toBeLessThanOrEqual(metric.size * 1.35);
  });
});

test('compact density is smaller everywhere and stays legible', () => {
  const tokens = Object.keys(typeScale) as Array<keyof typeof typeScale>;

  tokens.forEach(token => {
    const standard = typeScale[token];
    const compact = compactTypeScale[token];

    expect(compact.lineHeight).toBeLessThan(standard.lineHeight);
    expect(compact.size).toBeLessThanOrEqual(standard.size);
    expect(compact.lineHeight).toBeGreaterThanOrEqual(compact.size);
    expect(compact.size).toBeGreaterThanOrEqual(11);
  });
});

test('typeMetrics resolves the density it is given', () => {
  expect(typeMetrics('body-md', 'default')).toEqual({ fontSize: 15, lineHeight: 20 });
  expect(typeMetrics('body-md', 'compact')).toEqual({ fontSize: 15, lineHeight: 19 });
  expect(typeMetrics('heading-xl', 'compact').fontSize).toBeLessThan(
    typeMetrics('heading-xl', 'default').fontSize,
  );
  expect(Object.keys(typeScales.compact)).toEqual(Object.keys(typeScales.default));
});

test('size class pattern only matches scale utilities, never colour classes', () => {
  ['text-heading-md', 'text-body-md', 'text-display', 'text-display-mobile'].forEach(
    token => {
      expect(typeSizeClassPattern.test(token)).toBe(true);
    },
  );

  [
    'text-text',
    'text-primary',
    'text-text-secondary',
    'text-center',
    'text-displayx',
  ].forEach(token => {
    expect(typeSizeClassPattern.test(token)).toBe(false);
  });
});

test('dense density tightens further but never grows past compact', () => {
  const tokens = Object.keys(typeScale) as Array<keyof typeof typeScale>;

  tokens.forEach(token => {
    const compact = compactTypeScale[token];
    const dense = denseTypeScale[token];

    expect(dense.lineHeight).toBeLessThanOrEqual(compact.lineHeight);
    expect(dense.size).toBeLessThanOrEqual(compact.size);
    expect(dense.size).toBeGreaterThanOrEqual(11);
    expect(dense.lineHeight).toBeGreaterThanOrEqual(dense.size);
  });

  expect(typeMetrics('heading-xl', 'dense').fontSize).toBeLessThan(
    typeMetrics('heading-xl', 'compact').fontSize,
  );
});
