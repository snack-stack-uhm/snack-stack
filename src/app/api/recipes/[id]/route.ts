import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  _request: Request,
  ctx: RouteContext,
) {
  try {
    const session = await getServerSession();
    const email = session?.user?.email ?? null;
    const role = (session?.user as { role?: string | null } | undefined)?.role;
    const isAdmin = typeof role === 'string' && role.toUpperCase() === 'ADMIN';

    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const { id } = await ctx.params;
    const recipeId = Number(id);

    if (Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe id' },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { owner: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 },
      );
    }

    const isOwner = recipe.owner === email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 },
      );
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 },
    );
  }
}
