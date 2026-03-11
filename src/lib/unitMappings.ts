// Centralized mappings for unit options and category to type relationships

export const UNIT_OPTIONS = {
  weight: ['oz', 'lb', 'kg'],
  volume: ['fl oz', 'L', 'gal'],
  count: ['pcs', 'pack'],
} as const;

export const CATEGORY_TO_TYPE = {
  meat: 'weight',
  produce: 'weight',
  dairy: 'volume',
  beverage: 'volume',
  snack: 'count',
  canned: 'count',
} as const;

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_TO_TYPE) as Array<keyof typeof CATEGORY_TO_TYPE>;

export function getUnitOptionsForCategory(category?: string) {
  if (!category) return ['Other'];

  const typeKey = CATEGORY_TO_TYPE[category.toLowerCase() as keyof typeof CATEGORY_TO_TYPE];
  return typeKey ? [...UNIT_OPTIONS[typeKey], 'Other'] : ['Other'];
}

export function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
