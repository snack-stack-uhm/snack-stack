'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../styles/buttons.css';

interface SettingsModalProps {
  show: boolean;
  onHide: () => void;
  currentSettings: { lowStock: number; expDays: number };
  onSave: () => void;
}

export default function RecommendedSettingsModal({
  show,
  onHide,
  currentSettings,
  onSave,
}: SettingsModalProps) {
  const [lowStock, setLowStock] = useState(currentSettings.lowStock);

  const [expValue, setExpValue] = useState<number>(currentSettings.expDays);
  const [expUnit, setExpUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  useEffect(() => {
    const days = currentSettings.expDays;

    if (days % 365 === 0) {
      setExpValue(days / 365);
      setExpUnit('years');
    } else if (days % 30 === 0) {
      setExpValue(days / 30);
      setExpUnit('months');
    } else if (days % 7 === 0) {
      setExpValue(days / 7);
      setExpUnit('weeks');
    } else {
      setExpValue(days);
      setExpUnit('days');
    }
  }, [currentSettings]);

  const convertToDays = useCallback(() => {
    switch (expUnit) {
      case 'weeks':
        return expValue * 7;
      case 'months':
        return expValue * 30;
      case 'years':
        return expValue * 365;
      default:
        return expValue;
    }
  }, [expUnit, expValue]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const totalDays = convertToDays();

      localStorage.setItem('recommended_lowStock', String(lowStock));
      localStorage.setItem('recommended_expDays', String(totalDays));

      onSave();
      onHide();
    },
    [convertToDays, lowStock, onHide, onSave],
  );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Recommendation Settings</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Low Stock Trigger (≤)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={lowStock}
              onChange={(e) => setLowStock(Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Expiring Soon Threshold</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number"
                min="1"
                value={expValue}
                onChange={(e) => setExpValue(Number(e.target.value))}
              />

              <Form.Select
                value={expUnit}
                onChange={(e) => setExpUnit(e.target.value as 'days' | 'weeks' | 'months' | 'years')}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </Form.Select>
            </div>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button className="btn-cancel" onClick={onHide}>Cancel</Button>
          <Button type="submit" className="btn-submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
