'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import swal from 'sweetalert';
import { upsertProduceSet } from '@/lib/dbActions';
import { CATEGORY_OPTIONS, getUnitOptionsForCategory, formatCategoryLabel } from '@/lib/unitMappings';
import '../../styles/buttons.css';

type ShoppingListItem = {
  id: number;
  name: string;
  quantity: number;
  unit?: string | null;
  type?: string | null;
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

  const [selectedType, setSelectedType] = useState(item?.type ?? '');
  const [unitChoice, setUnitChoice] = useState('');
  const [customUnit, setCustomUnit] = useState('');

  const unitOptions = useMemo(
    () => getUnitOptionsForCategory(selectedType),
    [selectedType],
  );

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

      setSelectedType(item?.type ?? '');

      const initialUnit = item?.unit ?? '';
      if (initialUnit && getUnitOptionsForCategory(item?.type ?? '').includes(initialUnit)) {
        setUnitChoice(initialUnit);
        setCustomUnit('');
      } else if (initialUnit) {
        setUnitChoice('Other');
        setCustomUnit(initialUnit);
      } else {
        setUnitChoice('');
        setCustomUnit('');
      }
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

    const resolvedUnit = unitChoice === 'Other' ? customUnit.trim() : unitChoice;

    if (!selectedType) {
      await swal({ title: 'Missing category', text: 'Please select a category.', icon: 'error' });
      return;
    }

    if (!resolvedUnit) {
      await swal({ title: 'Missing unit', text: 'Please select a unit.', icon: 'error' });
      return;
    }

    try {
      setSaving(true);

      await upsertProduceSet({
        name: item.name,
        type: selectedType,
        location: selectedLocation,
        storage: 'Pantry',
        quantity: qty,
        unit: resolvedUnit,
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

        <Form.Label className="mb-1 mt-3">Category</Form.Label>
        <Form.Select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setUnitChoice('');
            setCustomUnit('');
          }}
        >
          <option value="" disabled>
            Select category...
          </option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {formatCategoryLabel(cat)}
            </option>
          ))}
        </Form.Select>

        <Form.Label className="mb-1 mt-3">Unit</Form.Label>
        <Form.Select
          value={unitChoice}
          onChange={(e) => {
            const { value } = e.target;
            setUnitChoice(value);
            if (value !== 'Other') {
              setCustomUnit('');
            }
          }}
          disabled={!selectedType}
        >
          <option value="" disabled>
            Select unit...
          </option>
          {unitOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Form.Select>

        {unitChoice === 'Other' && (
        <Form.Control
          className="mt-2"
          type="text"
          placeholder="Enter custom unit"
          value={customUnit}
          onChange={(e) => setCustomUnit(e.target.value)}
        />
        )}

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
        <Button className="btn-cancel" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button
          className="btn-submit"
          onClick={handleAdd}
          disabled={
            !item
            || !selectedLocation
            || !owner
            || !selectedType
            || !unitChoice
            || saving
          }
        >
          {saving ? 'Adding...' : 'Add'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
