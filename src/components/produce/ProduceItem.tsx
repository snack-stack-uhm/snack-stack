/* eslint-disable react/jsx-one-expression-per-line */
import swal from 'sweetalert';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { ProduceRelations } from '@/types/ProduceRelations';
import EditProduceModal from './EditProduceModal';
import DeleteProduceModal from './DeleteProduceModal';
import '../../styles/buttons.css';

/* eslint-disable react/require-default-props */
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
}: ProduceRelations & { restockThreshold?: number }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

  const safeRestock = restockThreshold ?? 1;

  const handleAddToShoppingList = async () => {
    if (addingToList) return;
    try {
      setAddingToList(true);

      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          name,
          quantity: Number(quantity),
          unit: unit ?? '',
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Failed');
      }

      swal('Added', `${name} added to your shopping list`, 'success', { timer: 2000 });
    } catch (e) {
      swal('Error', 'Failed to add item to shopping list', 'error');
    } finally {
      setAddingToList(false);
    }
  };

  return (
    <>
      <tr>
        {/* Name */}
        <td>{name}</td>

        {/* Category */}
        <td>{type}</td>

        {/* Location */}
        <td>{(typeof location === 'object' ? location?.name : location) || 'N/A'}</td>

        {/* Storage */}
        <td>{(typeof storage === 'object' ? storage?.name : storage) || 'N/A'}</td>

        {/* Quantity */}
        <td>
          {quantity.toString()}
          {unit ? ` ${unit}` : ''}
        </td>

        {/* Restock Threshold */}
        <td>
          {safeRestock}
          {unit ? ` ${unit}` : ''}
        </td>

        {/* Expiration Date */}
        <td>{expiration ? new Date(expiration).toLocaleDateString('en-US') // YYYY-MM-DD
          : 'N/A'}
        </td>

        {/* Actions column */}
        <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {/* Edit */}
          <Button className="btn-edit" onClick={() => setShowEditModal(true)} title="Edit">
            <PencilSquare color="white" size={18} />
          </Button>

          {/* Delete */}
          <Button variant="danger" className="btn-delete" onClick={() => setShowDeleteModal(true)} title="Delete">
            <Trash color="white" size={18} />
          </Button>

          {/* Add to Shopping List */}
          <Button
            variant="success"
            size="sm"
            className="btn-submit"
            onClick={handleAddToShoppingList}
            disabled={addingToList}
            title="Add to Shopping List"
          >
            {addingToList ? 'Adding…' : 'Add'}
          </Button>
        </td>
      </tr>

      {/* Edit modal */}
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

      {/* Delete modal */}
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
    </>
  );
};

export default ProduceItem;
