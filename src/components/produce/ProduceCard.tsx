/* eslint-disable react/jsx-one-expression-per-line */

'use client';

import { useState } from 'react';
import { Card, ListGroup, Image, Button } from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import type { ProduceRelations } from '@/types/ProduceRelations';
import EditProduceModal from './EditProduceModal';
import DeleteProduceModal from './DeleteProduceModal';
import AddProduceToShoppingListModal from './AddProduceToShoppingListModal';

type Props = { produce: ProduceRelations };

const formatDate = (d?: Date | string | null) => {
  if (!d) return 'Not Available';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ProduceCard({ produce }: Props) {
  const imageSrc = produce.image || '/no-image.png';
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  return (
    <>
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex flex-column">
          <div className="text-center mb-3">
            <Image
              src={imageSrc}
              alt={produce.name}
              fluid
              rounded
              style={{ maxHeight: '180px', objectFit: 'cover' }}
            />
          </div>

          <Card.Title>{produce.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {produce.type || 'Type Not Available'}
          </Card.Subtitle>

          <ListGroup variant="flush" className="mb-3">
            <ListGroup.Item>
              Location: {produce.storage?.name || 'Not Available'} at{' '}
              {produce.location?.name || 'Not Available'}
            </ListGroup.Item>

            <ListGroup.Item>
              Quantity: {typeof produce.quantity === 'number' ? produce.quantity : 'Not Available'}
              {produce.unit ? ` ${produce.unit}` : ''}
            </ListGroup.Item>

            <ListGroup.Item>
              Expiration: {formatDate(produce.expiration)}
            </ListGroup.Item>
          </ListGroup>

          <div className="d-flex gap-2 mt-auto">
            <Button
              variant="outline-primary"
              className="btn-edit"
              onClick={() => setShowEditModal(true)}
            >
              <PencilSquare />
            </Button>

            <Button
              variant="outline-danger"
              className="btn-delete"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash />
            </Button>

            <Button
              variant="outline-success"
              className="btn-submit"
              onClick={() => setShowAddToListModal(true)}
            >
              Add
            </Button>
          </div>
        </Card.Body>
      </Card>

      <EditProduceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        produce={produce}
      />

      <DeleteProduceModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        produce={produce}
      />

      <AddProduceToShoppingListModal
        show={showAddToListModal}
        onHide={() => setShowAddToListModal(false)}
        owner={produce.owner}
        produceId={produce.id}
        itemName={produce.name}
        maxQty={Number(produce.quantity) || 1}
        unit={produce.unit}
      />

    </>
  );
}
