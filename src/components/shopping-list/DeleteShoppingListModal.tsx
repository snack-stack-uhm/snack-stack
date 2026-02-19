'use client';

import { useState, useTransition } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import { deleteShoppingList } from '@/lib/dbActions';
import '../../styles/buttons.css';

interface DeleteShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList: any;
}

const DeleteShoppingListModal = ({ show, onHide, shoppingList }: DeleteShoppingListModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      startTransition(async () => {
        await deleteShoppingList(shoppingList.id);
      });
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>
          {`Delete ${shoppingList.name}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-1">
          <Col className="text-center">
            <h5 className="fw-bold">
              Are you sure you want to delete this list?
            </h5>
            <p className="text-danger fw-semibold mt-2">
              This action cannot be undone.
            </p>
          </Col>
        </Row>

        {shoppingList?.items && shoppingList.items.length > 0 ? (
          <Row>
            <Col>
              <h6>Items in List:</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {shoppingList.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        {item.quantity}
                        {item.unit}
                      </td>
                      <td>
                        {item.price ? `$${parseFloat(item.price.toString()).toFixed(2)}` : 'N/A'}
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
              onClick={onHide}
              className="btn-cancel"
              disabled={isDeleting || isPending}
            >
              Cancel
            </Button>
          </Col>
          <Col className="text-center">
            <Button
              onClick={handleDelete}
              className="btn-submit"
              disabled={isDeleting || isPending}
            >
              {isDeleting || isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteShoppingListModal;
