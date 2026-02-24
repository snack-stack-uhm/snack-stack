import swal from 'sweetalert';
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

import { ProduceRelations } from '@/types/ProduceRelations';
import EditProduceModal from './EditProduceModal';
import DeleteProduceModal from './DeleteProduceModal';
import '../../styles/buttons.css';

type SL = { id: number; name: string };

type AddToListModalProps = {
  show: boolean;
  onHide: () => void;
  owner: string;
  itemName: string;
  maxQty: number;
  unit?: string | null;
  // If you already have shopping lists in the pantry page, pass them to avoid fetching.
  shoppingLists?: SL[];
};

function AddProduceToShoppingListModal({
  show,
  onHide,
  owner,
  itemName,
  maxQty,
  unit,
  shoppingLists,
}: AddToListModalProps) {
  const [lists, setLists] = useState<SL[]>(shoppingLists ?? []);
  const [loadingLists, setLoadingLists] = useState(false);

  const [shoppingListId, setShoppingListId] = useState<number | ''>('');
  const [moveQty, setMoveQty] = useState<number>(Math.max(1, Number(maxQty) || 1));
  const [saving, setSaving] = useState(false);

  // Keep local list state in sync if parent supplies it later
  useEffect(() => {
    if (shoppingLists && shoppingLists.length) setLists(shoppingLists);
  }, [shoppingLists]);

  // Initialize each time the modal opens
  useEffect(() => {
    if (!show) return;

    setMoveQty(Math.max(1, Number(maxQty) || 1));

    // If parent already provided lists, just preselect
    if (shoppingLists && shoppingLists.length) {
      setShoppingListId(shoppingLists[0].id);
      return;
    }

    // Otherwise fetch lists (requires an API that returns [{id,name}] for an owner)
    (async () => {
      try {
        setLoadingLists(true);
        const res = await fetch(`/api/shopping-list?owner=${encodeURIComponent(owner)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as SL[];
        setLists(data);
        setShoppingListId(data[0]?.id ?? '');
      } catch (e) {
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

      // Send both shoppingListId + owner; your API can ignore owner if redundant.
      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shoppingListId: Number(shoppingListId),
          owner,
          name: itemName,
          quantity: Number(moveQty),
          unit: unit ?? '',
        }),
      });

      if (!res.ok) throw new Error(await res.text().catch(() => ''));

      await swal('Added', `${itemName} added to your shopping list`, 'success', { timer: 2000 });
      onHide();
    } catch (e: any) {
      await swal('Error', e?.message || 'Failed to add item to shopping list', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Unmount when closed so tests/selectors using `.exists` will go false
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

const ProduceItem = ({
  id,
  name,
  quantity,
  unit,
  type,
  location,
  storage,
  expiration,
  owner,
  image,
  restockThreshold = 1,
  layout = 'table',
}: ProduceRelations & { restockThreshold?: number; layout?: 'table' | 'mobile' }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showAddToListModal, setShowAddToListModal] = useState(false);

  const safeRestock = restockThreshold ?? 1;
  const locationName = (typeof location === 'object' ? location?.name : location) || 'N/A';
  const storageName = (typeof storage === 'object' ? storage?.name : storage) || 'N/A';
  const quantityText = `${quantity}${unit ? ` ${unit}` : ''}`;
  const restockText = `${safeRestock}${unit ? ` ${unit}` : ''}`;
  const expirationText = expiration ? new Date(expiration).toLocaleDateString('en-US') : 'N/A';
  const typeLabel = type || 'N/A';

  const actions = (
    <>
      <Button className="btn-edit" onClick={() => setShowEditModal(true)} title="Edit">
        <PencilSquare color="white" size={18} />
      </Button>

      <Button
        variant="danger"
        className="btn-delete"
        onClick={() => setShowDeleteModal(true)}
        title="Delete"
      >
        <Trash color="white" size={18} />
      </Button>

      <Button
        variant="success"
        size="sm"
        className="btn-submit"
        onClick={() => setShowAddToListModal(true)}
        title="Add to Shopping List"
      >
        Add
      </Button>
    </>
  );

  return (
    <>
      {layout === 'mobile' ? (
        <div className="produce-mobile-item">
          <div className="produce-mobile-header">
            <div className="produce-mobile-name">{name}</div>
            <div className="produce-mobile-actions">{actions}</div>
          </div>
          <div className="produce-mobile-meta">
            <span>{`Category: ${typeLabel}`}</span>
            <span>{`Location: ${locationName}`}</span>
            <span>{`Storage: ${storageName}`}</span>
            <span>{`Quantity: ${quantityText}`}</span>
            <span>{`Restock at: ${restockText}`}</span>
            <span>{`Expiration: ${expirationText}`}</span>
          </div>
        </div>
      ) : (
        <tr>
          <td>{name}</td>

          <td>{typeLabel}</td>

          <td>{locationName}</td>

          <td>{storageName}</td>

          <td>{quantityText}</td>

          <td>{restockText}</td>

          <td>{expirationText}</td>

          <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {actions}
          </td>
        </tr>
      )}

      <EditProduceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        produce={{
          id,
          name,
          quantity,
          unit,
          type,
          location,
          storage,
          expiration,
          owner,
          image,
          restockThreshold: safeRestock,
        }}
      />

      <DeleteProduceModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        produce={{
          id,
          name,
          quantity,
          unit,
          type,
          location,
          storage,
          expiration,
          owner,
          image,
          restockThreshold: safeRestock,
        }}
      />

      <AddProduceToShoppingListModal
        show={showAddToListModal}
        onHide={() => setShowAddToListModal(false)}
        owner={owner}
        itemName={name}
        maxQty={Number(quantity)}
        unit={unit}
        // shoppingLists={...} // optional: pass if your pantry page already has them
      />
    </>
  );
};

ProduceItem.defaultProps = {
  restockThreshold: 1,
  layout: 'table',
};

export default ProduceItem;
