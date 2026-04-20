async function fetchStringOptions(url: string): Promise<string[]> {
  const response = await fetch(url);
  if (!response.ok) return [];

  const payload = await response.json();
  if (!Array.isArray(payload)) return [];

  return payload.filter((option): option is string => typeof option === 'string');
}

export async function fetchProduceLocations(produceId: number, owner: string): Promise<string[]> {
  if (!owner) return [];

  return fetchStringOptions(
    `/api/produce/${produceId}/locations?owner=${encodeURIComponent(owner)}`,
  );
}

export async function fetchProduceStorageOptions(
  produceId: number,
  owner: string,
  location: string,
): Promise<string[]> {
  if (!owner || !location) return [];

  return fetchStringOptions(
    `/api/produce/${produceId}/storage?owner=${encodeURIComponent(owner)}&location=${encodeURIComponent(location)}`,
  );
}
