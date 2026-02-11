import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAndAddToShoppingList } from '@/lib/restock';

// eslint-disable-next-line consistent-return
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;
    const { quantity, owner } = req.body;

    if (!id || quantity === undefined || !owner) return res.status(400).json({ error: 'Missing data' });

    const parsedQuantity = Number.parseFloat(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const updatedProduce = await prisma.produce.update({
      where: { id: Number(id) },
      data: { quantity: parsedQuantity },
    });

    // 🔹 Trigger auto restock
    await checkAndAddToShoppingList(Number(id), owner);

    res.status(200).json(updatedProduce);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
