/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */

'use client';

import { useState, useEffect } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import { BagCheckFill } from 'react-bootstrap-icons';
import AddToShoppingListModal from './AddToShoppingListModal';
import EditShoppingListItemModal from './EditShoppingListItemModal';
import AddShoppingListItemToPantryModal from './AddShoppingListItemToPantryModal';

interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit?: string | null;
  price?: number | null;
  restockTrigger?: string | null;
  customThreshold?: number | null;
}

interface ShoppingList {
  id: number;
  name: string;
  items?: ShoppingListItem[];
}

interface ViewShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList?: ShoppingList; // optional for safety
  owner: string;
}

const ViewShoppingListModal = ({ show, onHide, shoppingList, owner }: ViewShoppingListModalProps) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [pantryItem, setPantryItem] = useState<ShoppingListItem | null>(null);
  const [showAddToPantryModal, setShowAddToPantryModal] = useState(false);

  // Update items when the shopping list changes
  useEffect(() => {
    if (shoppingList?.items) {
      setItems(shoppingList.items);
      const saved = localStorage.getItem(`checkboxes-${shoppingList.id}`);
      if (saved) setCheckedState(JSON.parse(saved));
    }
  }, [shoppingList]);

  const handleRestockChange = async (itemId: number, restockTrigger: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, restockTrigger } : item)),
    );

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restockTrigger }),
    });
  };

  const handleThresholdChange = async (itemId: number, customThreshold: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, customThreshold } : item)),
    );

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customThreshold }),
    });
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      setDeletingItemId(itemId);
      await fetch(`/api/shopping-list-item/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingItemId(null);
    }
  };

  const updateItemQuantity = async (itemId: number, newQty: number) => {
    await fetch(`/api/shopping-list-item/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
  };

  const openAddToPantry = (item: ShoppingListItem) => {
    setPantryItem(item);
    setShowAddToPantryModal(true);
  };

  const toggleCheckbox = (itemId: number) => {
    setCheckedState(prev => {
      const updated = { ...prev, [itemId]: !prev[itemId] };

      if (shoppingList) {
        localStorage.setItem(`checkboxes-${shoppingList.id}`, JSON.stringify(updated));
      }

      return updated;
    });
  };

  if (!shoppingList) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header className="justify-content-center">
          <Modal.Title>{shoppingList?.name ?? 'Shopping List'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {items.length > 0 ? (
            <Row>
              <Col>
                <Table striped bordered hover size="sm" responsive className="text-center">
                  <thead>
                    <tr>
                      <th>
                        <BagCheckFill color="black" size={18} />
                      </th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Restock When</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!checkedState[item.id]}
                            onChange={() => toggleCheckbox(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit || '-'}</td>
                        <td>{item.price ? `$${Number(item.price).toFixed(2)}` : 'N/A'}</td>
                        <td>
                          <select
                            value={item.restockTrigger || 'empty'}
                            onChange={(e) => handleRestockChange(item.id, e.target.value)}
                            className="form-select form-select-sm"
                          >
                            <option value="empty">When empty</option>
                            <option value="half">When half gone</option>
                            <option value="custom">Custom % left</option>
                          </select>

                          {item.restockTrigger === 'custom' && (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.customThreshold || ''}
                              onChange={(e) => {
                                // ensure min 0 (no negatives)
                                const value = Math.max(0, parseFloat(e.target.value));
                                handleThresholdChange(item.id, value);
                              }}
                              className="form-control form-control-sm mt-1"
                              placeholder="% left"
                            />
                          )}
                        </td>
                        <td className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="edit"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="edit"
                            size="sm"
                            onClick={() => openAddToPantry(item)}
                          >
                            Pantry+
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingItemId === item.id}
                          >
                            {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col className="text-center">
                <p className="text-muted mb-0">No items in this shopping list.</p>
              </Col>
            </Row>
          )}

          <Row className="pt-4">
            <Col className="text-center">
              <Button
                variant="success"
                style={{ backgroundColor: 'var(--vibrant-orange)' }}
                className="btn-submit"
                onClick={() => {
                  onHide();
                  setShowAddModal(true);
                }}
              >
                + Add Item
              </Button>
            </Col>
            <Col className="text-center">
              <Button onClick={onHide} variant="secondary" className="btn-submit">
                Close
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <AddToShoppingListModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        shoppingLists={[shoppingList]}
        sidePanel={false}
        prefillName=""
      />
      <AddShoppingListItemToPantryModal
        show={showAddToPantryModal}
        onHide={() => setShowAddToPantryModal(false)}
        item={pantryItem}
        owner={owner}
        onMoved={async (itemId, movedQty) => {
          const current = items.find((it) => it.id === itemId);
          if (!current) return;

          const newQty = current.quantity - movedQty;

          setItems((prev) =>
            prev
              .map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it))
              .filter((it) => it.quantity > 0),
          );

          if (newQty <= 0) {
            await handleDeleteItem(itemId);
          } else {
            await updateItemQuantity(itemId, newQty);
          }
        }}
      />

      {editingItem && (
      <EditShoppingListItemModal
        show={!!editingItem}
        onHide={() => setEditingItem(null)}
        item={editingItem}
      />
      )}
    </>
  );
};

ViewShoppingListModal.defaultProps = {
  shoppingList: {
    id: 0,
    name: '',
    items: [],
  },
};

export default ViewShoppingListModal;
