import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const produceId = Number(id);

    const { restockTrigger, customThreshold } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (restockTrigger !== undefined) updateData.restockTrigger = restockTrigger;
    if (customThreshold !== undefined) updateData.customThreshold = Number(customThreshold);

    const updatedProduce = await prisma.produce.update({
      where: { id: produceId },
      data: updateData,
    });

    return NextResponse.json(updatedProduce, { status: 200 });
  } catch (error) {
    console.error('Error updating produce restock info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
