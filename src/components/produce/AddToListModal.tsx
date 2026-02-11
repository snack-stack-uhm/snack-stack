'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import swal from 'sweetalert';

type SL = { id: number; name: string };

type Props = {
  show: boolean;
  onHide: () => void;
  owner: string;
  itemName: string;
  quantity: number;
  unit?: string | null;
};

export default function AddProduceToShoppingListModal({
  show,
  onHide,
  owner,
  itemName,
  quantity,
  unit,
}: Props) {
  const [lists, setLists] = useState<SL[]>([]);
  const [shoppingListId, setShoppingListId] = useState<number | ''>('');
  const [moveQty, setMoveQty] = useState<number>(quantity);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;

    setMoveQty(quantity);

    (async () => {
      // You need an endpoint that returns [{id,name}, ...] for this owner
      const res = await fetch(`/api/shopping-list?owner=${encodeURIComponent(owner)}`);
      if (!res.ok) return;

      const data = (await res.json()) as SL[];
      setLists(data);
      setShoppingListId(data[0]?.id ?? '');
    })();
  }, [show, owner, quantity]);

  const handleAdd = async () => {
    if (!shoppingListId) return;

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
    } catch (e: any) {
      swal('Error', e?.message || 'Failed to add item to shopping list', 'error');
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
          <strong>{itemName}</strong>
        </div>

        <Form.Label className="mb-1">List</Form.Label>
        <Form.Select
          value={shoppingListId}
          onChange={(e) => setShoppingListId(Number(e.target.value))}
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

        <Form.Label className="mb-1 mt-3">Quantity</Form.Label>
        <Form.Control
          type="number"
          min={1}
          value={moveQty}
          onChange={(e) => setMoveQty(Number(e.target.value))}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleAdd} disabled={!shoppingListId || saving}>
          {saving ? 'Adding…' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

AddProduceToShoppingListModal.defaultProps = {
  unit: null,
};
