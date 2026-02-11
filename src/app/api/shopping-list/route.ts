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

    // Add item
    const item = await prisma.shoppingListItem.create({
      data: {
        shoppingListId: shoppingList.id,
        name,
        quantity: Number(quantity) || 1,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');

    if (!owner) {
      return NextResponse.json({ error: 'owner is required' }, { status: 400 });
    }

    const lists = await prisma.shoppingList.findMany({
      where: { owner },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' }, // if you have createdAt
    });

    return NextResponse.json(lists, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
