'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

// Minimal shape so TS knows about session.user.email
type SessionLike = {
  user?: { email?: string | null; role?: string | null } | null;
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

function hasAdminRole(role: string | null | undefined): boolean {
  return typeof role === 'string' && role.toUpperCase() === 'ADMIN';
}

function normalizeIngredientItems(
  rawItems?: IngredientItemInput[],
): IngredientItemInput[] | undefined {
  if (rawItems === undefined) return undefined;

  return rawItems.flatMap((item, index) => {
    if (!item || typeof item.name !== 'string') return [];

    const name = item.name.trim();
    if (!name) return [];

    const unit = typeof item.unit === 'string' && item.unit.trim().length > 0
      ? item.unit.trim()
      : null;

    const quantity = typeof item.quantity === 'number' && Number.isFinite(item.quantity)
      ? item.quantity
      : null;

    const order = typeof item.order === 'number' && Number.isFinite(item.order)
      ? item.order
      : index;

    return [{ name, quantity, unit, order }];
  });
}

function mapIngredientItemsForCreate(items: IngredientItemInput[]) {
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity ?? null,
    unit: item.unit ?? null,
    order: item.order ?? 0,
  }));
}

function createIngredientsData(items: IngredientItemInput[] | undefined) {
  if (!items || items.length === 0) return undefined;

  return {
    create: mapIngredientItemsForCreate(items),
  };
}

function updateIngredientsData(
  items: IngredientItemInput[] | undefined,
): Prisma.RecipeUpdateInput['ingredientItems'] | undefined {
  if (items === undefined) return undefined;

  return {
    deleteMany: {},
    ...(items.length > 0 ? { create: mapIngredientItemsForCreate(items) } : {}),
  };
}

function throwRecipeWriteError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError
    && error.code === 'P2002'
  ) {
    throw new Error('You already have a recipe with that title. Please use a different title.');
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Unexpected error while saving recipe');
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

  // Undefined ingredientItems means "leave ingredients unchanged" for updates.
  // Empty array means "clear all ingredients".
  const ingredientItems = normalizeIngredientItems(input.ingredientItems);

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
    const created = await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredientItems: createIngredientsData(ingredientItems),
      },
    });
    return created;
  } catch (error) {
    return throwRecipeWriteError(error);
  }
}

/** Update an existing recipe (owner or admin role only). */
export async function updateRecipe(id: number, input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  const isAdmin = hasAdminRole(session?.user?.role);
  if (!email) throw new Error('Unauthorized');

  if (!Number.isFinite(id)) throw new Error('Invalid recipe id');

  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { owner: true },
  });

  if (!existing) throw new Error('Recipe not found');

  const isOwner = existing.owner === email;

  if (!isAdmin && !isOwner) {
    throw new Error('Not authorized to edit this recipe');
  }

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    /* ownerEmail */ undefined,
  );

  try {
    const ingredientItemsUpdate = updateIngredientsData(ingredientItems);

    const updated = await prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        ...(ingredientItemsUpdate
          ? { ingredientItems: ingredientItemsUpdate }
          : {}),
      },
    });

    return updated;
  } catch (error) {
    return throwRecipeWriteError(error);
  }
}
