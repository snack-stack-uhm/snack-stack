'use client';

import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import '../../styles/buttons.css';
import {
  CATEGORY_OPTIONS,
  getUnitOptionsForCategory,
  formatCategoryLabel,
} from '@/lib/unitMappings';

type EditModalProps = {
  show: boolean;
  onHide: () => void;
  item: {
    id: number;
    name: string;
    quantity: number;
    unit?: string | null;
    type?: string | null;
    price?: number | null;
    restockTrigger?: string | null;
    customThreshold?: number | null;
  };
};

type FormState = {
  name: string;
  quantity: number;
  unit: string;
  type: string;
  price: number | '';
  restockTrigger: string;
  customThreshold: number | '';
};

function buildFormState(item: EditModalProps['item']): FormState {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit ?? '',
    type: item.type ?? '',
    price: item.price ?? '',
    restockTrigger: item.restockTrigger ?? 'empty',
    customThreshold: item.customThreshold ?? '',
  };
}

export default function EditShoppingListItemModal({
  show,
  onHide,
  item,
}: EditModalProps) {
  const [form, setForm] = useState<FormState>(() => buildFormState(item));
  const [unitChoice, setUnitChoice] = useState('');

  const unitOptions = useMemo(
    () => getUnitOptionsForCategory(form.type),
    [form.type],
  );

  useEffect(() => {
    const nextForm = buildFormState(item);
    setForm(nextForm);

    if (nextForm.unit && getUnitOptionsForCategory(nextForm.type).includes(nextForm.unit)) {
      setUnitChoice(nextForm.unit);
    } else if (nextForm.unit) {
      setUnitChoice('Other');
    } else {
      setUnitChoice('');
    }
  }, [item, show]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    await fetch(`/api/shopping-list-item/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        quantity: Number(form.quantity),
        unit: unitChoice === 'Other' ? form.unit : unitChoice || form.unit || null,
        type: form.type || null,
        price: form.price === '' ? null : Number(form.price),
        restockTrigger: form.restockTrigger,
        customThreshold:
          form.restockTrigger === 'custom' && form.customThreshold !== ''
            ? Number(form.customThreshold)
            : null,
      }),
    });

    onHide();
    window.location.reload();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mt-3">
            <Col>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                name="quantity"
                type="number"
                min="0"
                step="0.5"
                value={form.quantity}
                onChange={handleChange}
              />
            </Col>

            <Col>
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="type"
                value={form.type}
                onChange={(e) => {
                  const { value } = e.target;
                  setForm((prev) => ({
                    ...prev,
                    type: value,
                    unit: '',
                  }));
                  setUnitChoice('');
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
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>Unit</Form.Label>
            <Form.Select
              value={unitChoice}
              onChange={(e) => {
                const { value } = e.target;
                setUnitChoice(value);
                setForm((prev) => ({
                  ...prev,
                  unit: value === 'Other' ? '' : value,
                }));
              }}
              disabled={!form.type}
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
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="Enter custom unit"
              />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Restock When</Form.Label>
            <Form.Select
              name="restockTrigger"
              value={form.restockTrigger}
              onChange={handleChange}
            >
              <option value="empty">When empty</option>
              <option value="half">When half gone</option>
              <option value="custom">Custom % left</option>
            </Form.Select>

            {form.restockTrigger === 'custom' && (
              <Form.Control
                className="mt-2"
                name="customThreshold"
                type="number"
                placeholder="% left"
                value={form.customThreshold}
                onChange={handleChange}
              />
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button type="button" className="btn-cancel" onClick={onHide}>
          Cancel
        </Button>
        <Button
          type="button"
          className="btn-submit"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
