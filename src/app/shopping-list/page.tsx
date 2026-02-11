import { getServerSession } from 'next-auth';
import { Container } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import ShoppingListClient from '@/components/shopping-list/ShoppingListClient';

type SessionUser = { id: string; email: string; randomKey: string };

const ViewShoppingListPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  const owner = session?.user?.email || '';

  const shoppingLists = await prisma.shoppingList.findMany({
    where: { owner },
    include: {
      items: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  // --- Convert Decimal fields to strings and handle nulls ---
  const initialShoppingLists = shoppingLists.map(list => ({
    ...list,
    items: list.items.map(item => ({
      ...item,
      price: item.price !== null ? item.price.toString() : null,
      // Add other Decimal fields here if needed, e.g.,
      // quantity: item.quantity !== null ? item.quantity.toString() : null
    })),
  }));

  return (
    <main>
      <Container id="view-shopping-list" className="py-3">
        <ShoppingListClient initialShoppingLists={initialShoppingLists} />
      </Container>
    </main>
  );
};

export default ViewShoppingListPage;
