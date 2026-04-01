import Fuse from 'fuse.js';

export function createPantryMatcher(pantryItems: string[]) {
  const normalizedPantry = pantryItems.map((p) => p.toLowerCase().trim());

  const fuse = new Fuse(normalizedPantry, {
    threshold: 0.3, // 0.0 is perfect match, 1.0 is match anything
    includeScore: true,
  });

  return (ingredientName: string) => {
    const rawIng = ingredientName.toLowerCase().trim();

    // Exact match
    if (normalizedPantry.includes(rawIng)) {
      return true;
    }

    // String includes
    for (const p of normalizedPantry) {
      if (rawIng.includes(p) || p.includes(rawIng)) {
        return true;
      }
    }

    // Fuzzy match
    const fuseResult = fuse.search(rawIng);
    if (fuseResult.length > 0 && fuseResult[0].score !== undefined && fuseResult[0].score <= 0.3) {
      return true;
    }

    return false;
  };
}
