import type { ProduceRelations } from '@/types/ProduceRelations';

export type EditProduceFormValues = {
  id: number;
  name: string;
  type: string;
  location: string;
  storage: string;
  quantity: number;
  unit: string;
  expiration: string | null;
  owner: string;
  image: string;
  restockThreshold: number | null;
};

export function toSingleOptionArray(value?: string | null): string[] {
  return value ? [value] : [];
}

export function mergeUniqueOptions(existing: string[], incoming: string[]): string[] {
  return Array.from(new Set([...existing, ...incoming]));
}

export function mapProduceToFormValues(produce: ProduceRelations): EditProduceFormValues {
  return {
    id: produce.id,
    name: produce.name,
    type: produce.type,
    quantity: produce.quantity,
    unit: produce.unit,
    owner: produce.owner,
    image: produce.image ?? '',
    restockThreshold: produce.restockThreshold ?? null,
    expiration: produce.expiration
      ? produce.expiration.toISOString().split('T')[0]
      : null,
    location: produce.location?.name || '',
    storage: produce.storage?.name || '',
  };
}
