import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { PencilSquare, PlusSquare, Trash } from 'react-bootstrap-icons';

import { ProduceRelations } from '@/types/ProduceRelations';
import EditProduceModal from './EditProduceModal';
import DeleteProduceModal from './DeleteProduceModal';
import AddProduceToShoppingListModal from './AddProduceToShoppingListModal';
import '../../styles/buttons.css';

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
      <Button
        className="btn-edit"
        onClick={() => setShowEditModal(true)}
        title="Edit"
      >
        <PencilSquare color="white" size={20} />
      </Button>

      <Button
        variant="danger"
        className="btn-delete"
        onClick={() => setShowDeleteModal(true)}
        title="Delete"
      >
        <Trash color="white" size={20} />
      </Button>

      <Button
        variant="success"
        size="sm"
        className="btn-submit"
        onClick={() => setShowAddToListModal(true)}
        title="Add to Shopping List"
      >
        <PlusSquare color="white" size={22} />
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
          <td className="produce-name-column">{name}</td>
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
        produceId={id}
        itemName={name}
        maxQty={Number(quantity)}
        unit={unit}
      />
    </>
  );
};

ProduceItem.defaultProps = {
  restockThreshold: 1,
  layout: 'table',
};

export default ProduceItem;
