'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import swal from 'sweetalert';
import { upsertProduceSet } from '@/lib/dbActions';

type ShoppingListItem = {
  id: number;
  name: string;
  quantity: number;
  unit?: string | null;
  price?: number | null;
};

interface Props {
  show: boolean;
  onHide: () => void;
  item: ShoppingListItem | null;
  owner: string;
  onMoved: (itemId: number, movedQty: number) => void;
}

export default function AddShoppingListItemToPantryModal({
  show,
  onHide,
  item,
  owner,
  onMoved,
}: Props) {
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [moveQty, setMoveQty] = useState(1);
  const [, setQtyError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;

    setMoveQty(item?.quantity ?? 1);

    (async () => {
      if (!owner) return;

      const url = `/api/produce/0/locations?owner=${encodeURIComponent(owner)}`;
      const res = await fetch(url);

      if (!res.ok) {
        setLocations([]);
        setSelectedLocation('');
        return;
      }

      const data = (await res.json()) as string[];
      setLocations(data);
      setSelectedLocation((prev) => prev || data[0] || '');
    })();
  }, [show, owner, item?.id, item?.quantity]);

  const validateQty = (raw: number) => {
    if (!Number.isFinite(raw) || raw < 1) return 'Quantity must be at least 1.';
    if (item && raw > item.quantity) return `Cannot move more than ${item.quantity}.`;
    return null;
  };

  const handleAdd = async () => {
    if (!item || !selectedLocation || !owner) return;

    const rawQty = Number(moveQty);
    const err = validateQty(rawQty);

    if (err) {
      setQtyError(err);
      await swal({ title: 'Invalid quantity', text: err, icon: 'error' });
      return;
    }

    const qty = rawQty;

    try {
      setSaving(true);

      await upsertProduceSet({
        name: item.name,
        type: 'Other',
        location: selectedLocation,
        storage: 'Pantry',
        quantity: qty,
        unit: item.unit ?? 'pcs',
        expiration: null,
        owner,
        image: null,
        restockThreshold: 0,
      });

      onMoved?.(item.id, qty);

      await swal({
        title: 'Success',
        text: 'Added to pantry',
        icon: 'success',
      });

      onHide();
    } catch (e) {
      await swal({ title: 'Error', text: 'Failed to add item', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add to Pantry</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-2">
          Item:
          <strong>{item?.name ?? ''}</strong>
        </div>

        <Form.Label className="mb-1">Location</Form.Label>
        <Form.Select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          disabled={locations.length === 0}
        >
          <option value="" disabled>
            {locations.length === 0 ? 'No locations found' : 'Select location...'}
          </option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </Form.Select>

        <Form.Label className="mb-1 mt-3">Quantity to move</Form.Label>
        <Form.Control
          type="number"
          min={1}
          max={item?.quantity ?? 1}
          step={1}
          value={moveQty}
          onChange={(e) => setMoveQty(Number(e.target.value))}
        />
        <div className="text-muted mt-1" style={{ fontSize: 12 }}>
          Max:
          {item?.quantity ?? 0}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleAdd} disabled={!item || !selectedLocation || !owner || saving}>
          {saving ? 'Adding...' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
