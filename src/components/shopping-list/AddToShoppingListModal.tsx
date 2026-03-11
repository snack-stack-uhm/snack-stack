'use client';

import { Button, Col, Form, Modal, Row, InputGroup, Offcanvas } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AddShoppingListItemSchema } from '@/lib/validationSchemas';
import { addShoppingListItem } from '@/lib/dbActions';
import { CATEGORY_OPTIONS, getUnitOptionsForCategory, formatCategoryLabel } from '@/lib/unitMappings';

// ------- types -------
type SL = { id: number; name: string };

type AddItemValues = {
  name: string;
  quantity: number;
  shoppingListId: number;
  price?: number;
  unit?: string;
  type?: string;
};

interface Props {
  show: boolean;
  onHide: () => void;
  shoppingLists: SL[];
  sidePanel: boolean;
  prefillName: string;
}

export default function AddToShoppingListModal({
  show,
  onHide,
  shoppingLists,
  sidePanel = false,
  prefillName,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const owner = session?.user?.email;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<AddItemValues>({
    resolver: yupResolver(AddShoppingListItemSchema),
    defaultValues: {
      name: prefillName,
      quantity: 0,
      unit: '',
      price: 0,
      shoppingListId: shoppingLists[0]?.id ?? 0,
      type: '',
    },
  });

  const selectedCategory = watch('type') || '';
  const [unitChoice, setUnitChoice] = useState('');

  const unitOptions = useMemo(
    () => getUnitOptionsForCategory(selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    if (!show) {
      reset({
        name: prefillName,
        quantity: 0,
        unit: '',
        price: 0,
        shoppingListId: shoppingLists[0]?.id ?? 0,
        type: '',
      });
      setUnitChoice('');
    }
  }, [show, reset, prefillName, shoppingLists]);

  const handleClose = () => {
    reset({
      name: prefillName,
      quantity: 0,
      unit: '',
      price: 0,
      shoppingListId: shoppingLists[0]?.id ?? 0,
      type: '',
    });
    setUnitChoice('');
    onHide();
  };

  const onSubmit = async (data: AddItemValues) => {
    if (!owner) {
      swal('Error', 'You must be signed in to add to your shopping list.', 'error');
      return;
    }

    try {
      const price = typeof data.price === 'number' ? data.price : parseFloat(data.price || '0');

      await addShoppingListItem({
        name: data.name.trim(),
        quantity: Number(data.quantity),
        unit: data.unit || '',
        type: data.type || '',
        price,
        shoppingListId: Number(data.shoppingListId),
      });

      swal('Success', 'Item added to your shopping list', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Something went wrong', 'error');
    }
  };

  const formContent = (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Row className="mb-3">
        <Col xs={4}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Bananas"
              {...register('name')}
              className={`${errors.name ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={2}>
          <Form.Group>
            <Form.Label>Qty</Form.Label>
            <Form.Control
              type="number"
              min={1}
              {...register('quantity')}
              className={`${errors.quantity ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.quantity?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={3}>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select
              {...register('type')}
              value={selectedCategory}
              onChange={(e) => {
                const { value } = e.target;
                setValue('type', value, { shouldValidate: true });
                setUnitChoice('');
                setValue('unit', '', { shouldValidate: true });
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
          </Form.Group>
        </Col>

        <Col xs={3}>
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Select
              value={unitChoice}
              onChange={(e) => {
                const { value } = e.target;
                setUnitChoice(value);
                setValue('unit', value === 'Other' ? '' : value, { shouldValidate: true });
              }}
              disabled={!selectedCategory}
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
              type="text"
              className="mt-2"
              placeholder="Enter custom unit"
              {...register('unit')}
            />
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={5}>
          <Form.Group>
            <Form.Label>Price (optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                className={`${errors.price ? 'is-invalid' : ''}`}
              />
            </InputGroup>
            <div className="invalid-feedback">{errors.price?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={7}>
          <Form.Group>
            <Form.Label>List</Form.Label>
            <Form.Select
              {...register('shoppingListId', { valueAsNumber: true })}
              defaultValue={shoppingLists[0]?.id ?? ''}
            >
              <option value="">Choose a list…</option>
              {shoppingLists.map((sl) => (
                <option key={sl.id} value={sl.id}>
                  {sl.name}
                </option>
              ))}
            </Form.Select>
            <div className="invalid-feedback">{errors.shoppingListId?.message}</div>
          </Form.Group>
        </Col>
      </Row>

      <Row className="pt-3">
        <Col>
          <Button
            type="button"
            onClick={() => {
              reset({
                name: prefillName,
                quantity: 0,
                unit: '',
                price: 0,
                shoppingListId: shoppingLists[0]?.id ?? 0,
                type: '',
              });
              setUnitChoice('');
            }}
            className="btn-reset"
          >
            Reset
          </Button>
        </Col>
        <Col>
          <Button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Submit'}
          </Button>
        </Col>
      </Row>
    </Form>
  );

  return !sidePanel ? (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Shopping List Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>{formContent}</Modal.Body>
    </Modal>
  ) : (
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add Shopping List Item</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>{formContent}</Offcanvas.Body>
    </Offcanvas>
  );
}
