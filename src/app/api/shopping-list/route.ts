import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, quantity, unit, owner } = await req.json();

    if (!name || !owner) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create default shopping list
    const shoppingList = await prisma.shoppingList.upsert({
      where: {
        name_owner: {
          name: 'Auto Restock',
          owner,
        },
      },
      update: {},
      create: {
        name: 'Auto Restock',
        owner,
      },
    });

    // Prevent duplicates
    const existing = await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId: shoppingList.id,
        name,
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Item already exists' }, { status: 200 });
    }

    const parsedQuantity = Number(quantity);
    if (quantity !== undefined && quantity !== null && Number.isFinite(parsedQuantity) && parsedQuantity < 0) {
      return NextResponse.json({ error: 'Quantity cannot be negative' }, { status: 400 });
    }

    // Add item
    const item = await prisma.shoppingListItem.create({
      data: {
        shoppingListId: shoppingList.id,
        name,
        quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
        unit: unit || '',
        price: null,
      },
    });

    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
