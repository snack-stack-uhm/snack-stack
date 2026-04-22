'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import swal from 'sweetalert';
import '../../styles/buttons.css';

type ShoppingList = { id: number; name: string };

type Props = {
  show: boolean;
  onHide: () => void;
  owner: string;
  itemName: string;
  quantity: number;
  unit?: string | null;
};

export default function AddToListModal({
  show,
  onHide,
  owner,
  itemName,
  quantity,
  unit,
}: Props) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [shoppingListId, setShoppingListId] = useState<number | ''>('');
  const [moveQty, setMoveQty] = useState<number>(quantity);
  const [saving, setSaving] = useState(false);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return 'Failed to add item to shopping list';
  };

  useEffect(() => {
    if (!show) return;

    setMoveQty(quantity);

    (async () => {
      // You need an endpoint that returns [{id,name}, ...] for this owner
      const res = await fetch(`/api/shopping-list?owner=${encodeURIComponent(owner)}`);
      if (!res.ok) return;

      const data: unknown = await res.json();
      if (!Array.isArray(data)) {
        setLists([]);
        setShoppingListId('');
        return;
      }

      const shoppingLists: ShoppingList[] = data
        .filter(
          (item): item is ShoppingList => typeof item === 'object'
            && item !== null
            && 'id' in item
            && 'name' in item
            && typeof item.id === 'number'
            && typeof item.name === 'string',
        )
        .map((item) => ({ id: item.id, name: item.name }));

      setLists(shoppingLists);
      setShoppingListId(shoppingLists[0]?.id ?? '');
    })();
  }, [show, owner, quantity]);

  const handleAdd = async () => {
    if (!shoppingListId) return;

    if (!Number.isFinite(moveQty) || moveQty <= 0) {
      swal('Invalid quantity', 'Enter a quantity greater than 0', 'warning');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shoppingListId: Number(shoppingListId),
          name: itemName,
          quantity: Number(moveQty),
          unit: unit ?? '',
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      swal('Added', `${itemName} added to your shopping list`, 'success', { timer: 2000 });
      onHide();
    } catch (error: unknown) {
      swal('Error', getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add to shopping list</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-2">
          Item:
          <strong>
            {itemName}
          </strong>
        </div>

        <Form.Label className="mb-1">List</Form.Label>
        <Form.Select
          value={shoppingListId}
          onChange={(e) => {
            const nextValue = e.target.value;
            setShoppingListId(nextValue === '' ? '' : Number(nextValue));
          }}
          disabled={lists.length === 0}
        >
          {lists.length === 0 ? (
            <option value="">No lists found</option>
          ) : (
            lists.map((sl) => (
              <option key={sl.id} value={sl.id}>
                {sl.name}
              </option>
            ))
          )}
        </Form.Select>

        {lists.length === 0 && (
          <div className="mt-2 small text-muted">
            Create a shopping list first, then come back to add this item.
            <div className="mt-2">
              <Button as="a" href="/shopping-list" size="sm" className="btn-submit">
                Go to shopping lists
              </Button>
            </div>
          </div>
        )}

        <Form.Label className="mb-1 mt-3">Quantity</Form.Label>
        <Form.Control
          type="number"
          min={0.01}
          step="any"
          placeholder="Enter amount (e.g. 0.5)"
          value={moveQty}
          onChange={(e) => setMoveQty(Number(e.currentTarget.value))}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button className="btn-cancel" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button className="btn-submit" onClick={handleAdd} disabled={!shoppingListId || saving}>
          {saving ? 'Adding…' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

AddToListModal.defaultProps = {
  unit: null,
};
