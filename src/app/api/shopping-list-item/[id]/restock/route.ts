import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const itemId = Number(id);

    const { restockTrigger, customThreshold } = await request.json();

    // Build the update object dynamically
    const updateData: Record<string, unknown> = {};
    if (restockTrigger !== undefined) updateData.restockTrigger = restockTrigger;
    if (customThreshold !== undefined) updateData.customThreshold = Number(customThreshold);

    // Update the ShoppingListItem instead of Produce
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Error updating shopping list item restock info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
