import swal from 'sweetalert';
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

type SL = { id: number; name: string };

type AddToListModalProps = {
  show: boolean;
  onHide: () => void;
  owner: string;
  produceId: number;
  itemName: string;
  maxQty: number;
  unit?: string | null;
  shoppingLists?: SL[];
  onMoved?: () => void;
};

export default function AddProduceToShoppingListModal({
  show,
  onHide,
  owner,
  produceId,
  itemName,
  maxQty,
  unit,
  shoppingLists,
  onMoved,
}: AddToListModalProps) {
  const [lists, setLists] = useState<SL[]>(shoppingLists ?? []);
  const [loadingLists, setLoadingLists] = useState(false);
  const [shoppingListId, setShoppingListId] = useState<number | ''>('');
  const [moveQty, setMoveQty] = useState<number>(Math.max(1, Number(maxQty) || 1));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shoppingLists && shoppingLists.length) setLists(shoppingLists);
  }, [shoppingLists]);

  useEffect(() => {
    if (!show) return;

    setMoveQty(Math.max(1, Number(maxQty) || 1));

    if (shoppingLists && shoppingLists.length) {
      setShoppingListId(shoppingLists[0].id);
      return;
    }

    (async () => {
      try {
        setLoadingLists(true);
        const res = await fetch(`/api/shopping-list?owner=${encodeURIComponent(owner)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as SL[];
        setLists(data);
        setShoppingListId(data[0]?.id ?? '');
      } catch {
        setLists([]);
        setShoppingListId('');
      } finally {
        setLoadingLists(false);
      }
    })();
  }, [show, owner, maxQty, shoppingLists]);

  const qtyError = useMemo(() => {
    if (!Number.isFinite(moveQty) || moveQty < 1) return 'Quantity must be at least 1.';
    if (moveQty > maxQty) return `Cannot add more than ${maxQty}.`;
    return null;
  }, [moveQty, maxQty]);

  const handleAdd = async () => {
    if (!shoppingListId) return;

    if (qtyError) {
      await swal('Invalid quantity', qtyError, 'error');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/pantry/move-to-shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produceId,
          shoppingListId: Number(shoppingListId),
          owner,
          name: itemName,
          quantity: Number(moveQty),
          unit: unit ?? '',
        }),
      });

      if (!res.ok) throw new Error(await res.text().catch(() => ''));

      await swal('Added', `${itemName} moved to your shopping list`, 'success', {
        timer: 2000,
      });

      onHide();
      onMoved?.();
    } catch (e: any) {
      await swal('Error', e?.message || 'Failed to move item to shopping list', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <Modal show onHide={onHide} centered animation={false}>
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
          disabled={loadingLists || lists.length === 0}
        >
          {lists.length === 0 ? (
            <option value="">
              {loadingLists ? 'Loading lists…' : 'No lists found'}
            </option>
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
          max={maxQty}
          step={1}
          value={moveQty}
          onChange={(e) => setMoveQty(Number(e.target.value))}
        />

        <div className="text-muted mt-1" style={{ fontSize: 12 }}>
          Max:
          {maxQty}
          {unit ? ` ${unit}` : ''}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleAdd} disabled={!shoppingListId || saving || !!qtyError}>
          {saving ? 'Adding…' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

AddProduceToShoppingListModal.defaultProps = {
  shoppingLists: undefined,
  unit: null,
};

AddProduceToShoppingListModal.defaultProps = {
  shoppingLists: undefined,
  unit: null,
  onMoved: undefined,
};
