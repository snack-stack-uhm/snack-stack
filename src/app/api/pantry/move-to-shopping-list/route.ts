import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const produceId = Number(body.produceId);
    const shoppingListId = Number(body.shoppingListId);
    const quantityToMove = Number(body.quantity);
    const owner = String(body.owner ?? '');
    const name = String(body.name ?? '');
    const unit = body.unit ? String(body.unit) : null;

    if (!Number.isFinite(produceId) || produceId <= 0) {
      return NextResponse.json({ error: 'Invalid produceId' }, { status: 400 });
    }

    if (!Number.isFinite(shoppingListId) || shoppingListId <= 0) {
      return NextResponse.json({ error: 'Invalid shoppingListId' }, { status: 400 });
    }

    if (!Number.isFinite(quantityToMove) || quantityToMove < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const pantryItem = await tx.produce.findUnique({
        where: { id: produceId },
      });

      if (!pantryItem) {
        throw new Error('Pantry item not found');
      }

      if (pantryItem.owner !== owner) {
        throw new Error('Owner mismatch');
      }

      const pantryQty = Number(pantryItem.quantity);

      if (!Number.isFinite(pantryQty) || pantryQty < quantityToMove) {
        throw new Error('Not enough quantity in pantry');
      }

      const existingShoppingListItem = await tx.shoppingListItem.findFirst({
        where: {
          shoppingListId,
          name,
          unit: unit ?? null,
        },
      });

      let shoppingListItem;

      if (existingShoppingListItem) {
        shoppingListItem = await tx.shoppingListItem.update({
          where: { id: existingShoppingListItem.id },
          data: {
            quantity: Number(existingShoppingListItem.quantity) + quantityToMove,
          },
        });
      } else {
        shoppingListItem = await tx.shoppingListItem.create({
          data: {
            shoppingListId,
            name,
            quantity: quantityToMove,
            unit,
          },
        });
      }

      const remainingQty = pantryQty - quantityToMove;

      let pantryAction: 'updated' | 'deleted';

      if (remainingQty <= 0) {
        await tx.produce.delete({
          where: { id: produceId },
        });
        pantryAction = 'deleted';
      } else {
        await tx.produce.update({
          where: { id: produceId },
          data: {
            quantity: remainingQty,
          },
        });
        pantryAction = 'updated';
      }

      return {
        success: true,
        shoppingListItem,
        pantryAction,
        remainingQty,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error moving pantry item to shopping list:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to move pantry item' },
      { status: 500 },
    );
  }
}
