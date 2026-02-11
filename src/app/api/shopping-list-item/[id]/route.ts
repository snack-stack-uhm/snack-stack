import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const itemId = Number(id);

    await prisma.shoppingListItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting shopping list item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext,
) {
  try {
    const { id } = await ctx.params;
    const itemId = Number(id);

    const body = await request.json();

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        name: body.name,
        quantity: body.quantity,
        unit: body.unit || null,
        price: body.price ?? null,
        restockTrigger: body.restockTrigger ?? null,
        customThreshold: body.customThreshold ?? null,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const itemId = Number(id);
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = (await request.json()) as Partial<{
      name: string;
      quantity: number;
      unit: string | null;
      price: number | null;
      restockTrigger: string | null;
      customThreshold: number | null;
    }>;

    // Build a "data" object with only provided keys
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.quantity !== undefined) {
      const q = Number(body.quantity);
      if (!Number.isFinite(q) || q < 0) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
      data.quantity = q;
    }
    if (body.unit !== undefined) data.unit = body.unit ? body.unit : null; // '' -> null
    if (body.price !== undefined) data.price = body.price ?? null;
    if (body.restockTrigger !== undefined) data.restockTrigger = body.restockTrigger ?? null;
    if (body.customThreshold !== undefined) data.customThreshold = body.customThreshold ?? null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data,
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    console.error('Error patching item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
