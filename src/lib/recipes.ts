'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

// Minimal shape so TS knows about session.user.email
type SessionLike = {
  user?: { email?: string | null } | null;
} | null;

export type IngredientItemInput = {
  name: string;
  quantity?: number | null;
  unit?: string | null;
  order?: number | null;
};

/** Type for creating/updating recipes. */
export type RecipeInput = {
  title: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  dietary?: string[];
  // Only structured ingredients now
  ingredientItems?: IngredientItemInput[];
  instructions?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  sourceUrl?: string;
};

/**
 * Normalize ingredientItems:
 * - trim names/units
 * - coerce quantity to number|null
 * - drop empty names
 */
function normalizeIngredientItems(
  input: RecipeInput,
): IngredientItemInput[] {
  const rawItems = input.ingredientItems ?? [];

  return rawItems
    .map((item, index) => {
      const name = item.name.trim();
      const unit = item.unit?.trim() || null;

      let quantity: number | null = null;
      if (typeof item.quantity === 'number' && !Number.isNaN(item.quantity)) {
        quantity = item.quantity;
      }

      return {
        name,
        quantity,
        unit,
        order: item.order ?? index,
      };
    })
    .filter((item) => item.name.length > 0);
}

/** Normalize/clean recipe scalar data (no ingredients here). */
function normalizeRecipeInput(
  input: RecipeInput,
  ownerEmail?: string | null,
) {
  const recipeData = {
    title: input.title.trim(),
    cuisine: input.cuisine.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    dietary: (input.dietary ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    instructions: input.instructions?.trim() || null,
    servings: input.servings ?? null,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    sourceUrl: input.sourceUrl?.trim() || null,
    ...(ownerEmail ? { owner: ownerEmail } : {}),
  };

  if (!recipeData.title) throw new Error('Title required');
  if (!recipeData.cuisine) throw new Error('Cuisine required');

  // return both the scalar data and normalized items
  const ingredientItems = normalizeIngredientItems(input);

  return { recipeData, ingredientItems };
}

/** Fetch all recipes (latest first). */
export async function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ingredientItems: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

/** Fetch a single recipe by numeric ID. */
export async function getRecipeById(id: number) {
  if (!Number.isFinite(id)) return null;
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredientItems: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

/** Create a new recipe (any logged-in user can create). */
export async function createRecipe(input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    email,
  );

  try {
    return await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredientItems:
          ingredientItems.length > 0
            ? {
              create: ingredientItems.map((item) => ({
                name: item.name,
                quantity: item.quantity ?? null,
                unit: item.unit ?? null,
                order: item.order ?? 0,
              })),
            }
            : undefined,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new Error('You already have a recipe with that title. Please use a different title.');
    }
    throw e;
  }
}

/** Update an existing recipe (owner or admin@foo.com only). */
export async function updateRecipe(id: number, input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  if (!Number.isFinite(id)) throw new Error('Invalid recipe id');

  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { owner: true },
  });

  if (!existing) throw new Error('Recipe not found');

  const ownerField = existing.owner as string | string[] | null;

  let owners: string[] = [];
  if (Array.isArray(ownerField)) {
    owners = ownerField;
  } else if (typeof ownerField === 'string') {
    owners = [ownerField];
  }

  const isAdmin = email === 'admin@foo.com';
  const isOwner = owners.includes(email);

  if (!isAdmin && !isOwner) {
    throw new Error('Not authorized to edit this recipe');
  }

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    /* ownerEmail */ undefined,
  );

  // If ingredientItems is empty, we leave existing ingredient rows as-is.
  // If ingredientItems has items, we replace them completely.
  try {
    if (ingredientItems.length === 0) {
      return await prisma.recipe.update({
        where: { id },
        data: recipeData,
      });
    }

    return await prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ingredientItems: {
          deleteMany: {}, // delete all existing rows for this recipe
          create: ingredientItems.map((item) => ({
            name: item.name,
            quantity: item.quantity ?? null,
            unit: item.unit ?? null,
            order: item.order ?? 0,
          })),
        },
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new Error('You already have a recipe with that title. Please use a different title.');
    }
    throw e;
  }
}
