'use client';

import { Card, ListGroup, Button, Badge, Form } from 'react-bootstrap';
import { useState } from 'react';
import { Trash } from 'react-bootstrap-icons';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import ViewShoppingListModal from './ViewShoppingListModal';
import DeleteShoppingListModal from './DeleteShoppingListModal';

type ShoppingListCardProps = {
  shoppingList: any;
  owner: string;
};

const formatDate = (d?: Date | string | null) => {
  if (!d) return 'Not Available';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ShoppingListCard({ shoppingList, owner }: ShoppingListCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(shoppingList.name);
  const [tempName, setTempName] = useState(shoppingList.name);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTempName(name);
    setEditing(false);
  };

  const handleSave = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!tempName.trim()) return;

    await fetch(`/api/shopping-list/${shoppingList.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tempName }),
    });

    setName(tempName);
    setEditing(false);
  };

  const totalItems = shoppingList.items?.length || 0;

  const totalCost = shoppingList.items?.reduce((sum: number, item: any) => {
    const price = item.price ? parseFloat(item.price.toString()) : 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  return (
    <>
      <Card
        className="h-100 mb-3 image-shadow shopping-list-card"
        role="button"
        tabIndex={0}
        onClick={() => setShowViewModal(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowViewModal(true);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <Card.Header
          className="d-flex align-items-center"
          style={{ height: '48px', paddingTop: '0px', paddingBottom: '0px' }}
        >
          <Card.Title
            className="d-flex align-items-center"
            style={{ margin: 0, gap: '6px' }}
          >
            {!editing ? (
              <>
                <span>{name}</span>
                <FaPencilAlt
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    position: 'relative',
                    top: '-1px',
                    zIndex: 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                  }}
                />
              </>
            ) : (
              <div
                className="d-flex align-items-center"
                style={{ gap: '6px', zIndex: 2 }}
              >
                <Form.Control
                  size="sm"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  style={{ height: '28px', padding: '2px 6px' }}
                  autoFocus
                />
                <FaCheck
                  style={{
                    cursor: 'pointer',
                    color: 'green',
                    position: 'relative',
                    top: '-1px',
                  }}
                  onClick={handleSave}
                />
                <FaTimes
                  style={{
                    cursor: 'pointer',
                    color: 'red',
                    position: 'relative',
                    top: '-1px',
                  }}
                  onClick={handleCancel}
                />
              </div>
            )}
          </Card.Title>
        </Card.Header>

        <Card.Body className="bg-light">
          <ListGroup variant="flush">
            <ListGroup.Item className="bg-light">
              <strong>Date Created: </strong>
              {formatDate(shoppingList.createdAt)}
            </ListGroup.Item>
            <ListGroup.Item className="bg-light">
              <strong>Total Items: </strong>
              <Badge bg="primary">{totalItems}</Badge>
            </ListGroup.Item>
            <ListGroup.Item className="bg-light">
              <strong>Estimated Cost: </strong>
              $
              {totalCost.toFixed(2)}
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>

        <Card.Footer className="d-flex justify-content-end">
          <Button
            variant="danger"
            className="d-flex align-items-center justify-content-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            style={{ width: '40px', height: '40px', padding: 0, zIndex: 2 }}
          >
            <Trash color="white" size={18} />
          </Button>
        </Card.Footer>
      </Card>

      <ViewShoppingListModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        shoppingList={shoppingList}
        owner={owner}
      />

      <DeleteShoppingListModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        shoppingList={shoppingList}
      />
    </>
  );
}
