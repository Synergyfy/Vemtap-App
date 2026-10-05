import { categoryListSchema, categorySchema } from '@api/categoriesApi';
import captured from './fixtures/categories.json';

test('parses the live {items, meta} envelope', () => {
  const parsed = categoryListSchema.safeParse(captured);

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.meta.total).toBe(24);
  expect(parsed.data.items[0].id).toBeTruthy();
});

test('subcategories are embedded and carry their own ids', () => {
  const parsed = categoryListSchema.safeParse(captured);
  expect(parsed.success).toBe(true);
  if (!parsed.success) return;

  const sub = parsed.data.items[0].subcategories[0];
  expect(sub.name).toBeTruthy();
  expect(sub.id).toBeTruthy();
  expect(sub.categoryId).toBe(parsed.data.items[0].id);
});

test('subcategories default to an empty array when absent', () => {
  const parsed = categorySchema.safeParse({ id: 'c1', name: 'Anything' });

  expect(parsed.success).toBe(true);
  if (!parsed.success) return;
  expect(parsed.data.subcategories).toEqual([]);
});

test('rejects the other list envelopes this codebase uses', () => {
  expect(categoryListSchema.safeParse({ data: [], total: 0 }).success).toBe(false);
  expect(categoryListSchema.safeParse({ businesses: [] }).success).toBe(false);
  expect(categoryListSchema.safeParse({ items: [] }).success).toBe(false);
});
