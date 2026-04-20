'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  InputGroup,
  Image as RBImage,
} from 'react-bootstrap';
import { useForm, type Resolver } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditProduceSchema } from '@/lib/validationSchemas';
import { editProduce } from '@/lib/dbActions';
import { useRouter } from 'next/navigation';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import SelectWithCustomInputField from '@/components/produce/SelectWithCustomInputField';
import '../../styles/buttons.css';
import { ProduceRelations } from '@/types/ProduceRelations';
import { CATEGORY_OPTIONS, getUnitOptionsForCategory, formatCategoryLabel } from '@/lib/unitMappings';
import {
  type EditProduceFormValues,
  mapProduceToFormValues,
  mergeUniqueOptions,
  toSingleOptionArray,
} from '@/lib/produceFormUtils';
import { fetchProduceLocations, fetchProduceStorageOptions } from '@/lib/produceOptionService';

interface EditProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: ProduceRelations & { restockThreshold?: number | null };
}

export default function EditProduceModal({ show, onHide, produce }: EditProduceModalProps) {
  const router = useRouter();

  const [locations, setLocations] = useState<string[]>(
    () => toSingleOptionArray(produce.location?.name),
  );

  const [storageOptions, setStorageOptions] = useState<string[]>(
    () => toSingleOptionArray(produce.storage?.name),
  );

  const [selectedLocation, setSelectedLocation] = useState(produce.location?.name || '');
  const [selectedStorage, setSelectedStorage] = useState(produce.storage?.name || '');
  const [unitChoice, setUnitChoice] = useState('');

  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProduceFormValues>({
    resolver: yupResolver(EditProduceSchema) as unknown as Resolver<EditProduceFormValues>,
    defaultValues: { ...mapProduceToFormValues(produce) },
  });

  const selectedType = watch('type') || '';
  const imageVal = watch('image') || '';

  const unitOptions = useMemo(
    () => getUnitOptionsForCategory(selectedType),
    [selectedType],
  );

  const resetToProduce = useCallback(() => {
    const formValues = mapProduceToFormValues(produce);
    const produceUnitOptions = getUnitOptionsForCategory(produce.type);
    const resolvedUnitChoice = produceUnitOptions.includes(produce.unit)
      ? produce.unit
      : 'Other';

    reset(formValues);
    setSelectedLocation(formValues.location);
    setSelectedStorage(formValues.storage);
    setUnitChoice(resolvedUnitChoice);
    setLocations(toSingleOptionArray(produce.location?.name));
    setStorageOptions(toSingleOptionArray(produce.storage?.name));

    setValue(
      'unit',
      resolvedUnitChoice === 'Other' ? produce.unit : resolvedUnitChoice,
      { shouldValidate: false },
    );
  }, [produce, reset, setValue]);

  const fetchStorage = useCallback(
    async (location: string) => {
      if (!produce.owner || !location) return;

      const data = await fetchProduceStorageOptions(produce.id, produce.owner, location);
      setStorageOptions((prev) => mergeUniqueOptions(prev, data));

      if (data.length === 1) {
        setSelectedStorage(data[0]);
        setValue('storage', data[0], { shouldValidate: true });
      }
    },
    [produce.id, produce.owner, setValue],
  );

  const handleCategoryChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setValue('type', value, { shouldValidate: true, shouldDirty: true });
    setUnitChoice('');
    setValue('unit', '', { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleLocationSelectChange = useCallback(async (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSelectedLocation(value);

    if (value === 'Add Location') {
      setValue('location', '', { shouldValidate: true });
      setStorageOptions([]);
      setSelectedStorage('Add Storage');
      setValue('storage', '', { shouldValidate: true });
      return;
    }

    setValue('location', value, { shouldValidate: true });
    await fetchStorage(value);
  }, [fetchStorage, setValue]);

  const handleLocationInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue('location', event.target.value, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleStorageSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSelectedStorage(value);

    if (value === 'Add Storage') {
      setValue('storage', '', { shouldValidate: true });
      return;
    }

    setValue('storage', value, { shouldValidate: true });
  }, [setValue]);

  const handleStorageInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue('storage', event.target.value, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleUnitSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setUnitChoice(value);
    setValue('unit', value !== 'Other' ? value : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [setValue]);

  const handleUnitInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue('unit', event.target.value, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  useEffect(() => {
    if (!show) return;

    resetToProduce();

    const fetchLocations = async () => {
      const data = await fetchProduceLocations(produce.id, produce.owner);
      setLocations((prev) => mergeUniqueOptions(prev, data));
    };

    fetchLocations();

    if (produce.location?.name) {
      fetchStorage(produce.location.name);
    }
  }, [show, produce, fetchStorage, resetToProduce]);

  const handleClose = () => {
    resetToProduce();
    onHide();
  };

  const onSubmit = async (data: EditProduceFormValues) => {
    try {
      await editProduce({
        ...data,
        expiration: data.expiration ? new Date(data.expiration) : null,
        image: data.image === '' ? null : data.image,
        restockThreshold:
          data.restockThreshold == null || Number.isNaN(Number(data.restockThreshold))
            ? 0
            : Number(data.restockThreshold),
      });

      swal('Success', 'Your item has been updated', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch {
      swal('Error', 'Failed to update item', 'error');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Edit Pantry Item</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('id')} />

          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  placeholder="e.g., Chicken"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Category</Form.Label>
                <Form.Select
                  {...register('type', { required: true })}
                  value={selectedType}
                  isInvalid={!!errors.type}
                  onChange={handleCategoryChange}
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
                <Form.Control.Feedback type="invalid">
                  {errors.type?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={6}>
              <SelectWithCustomInputField
                label="Location"
                required
                selectValue={selectedLocation}
                selectPlaceholder="Select location..."
                options={locations}
                onSelectChange={handleLocationSelectChange}
                isInvalid={!!errors.location}
                errorMessage={errors.location?.message}
                extraOptionLabel="Add Location"
                customTriggerValue="Add Location"
                renderCustomInput={() => (
                  <Form.Control
                    type="text"
                    placeholder="Enter new location"
                    className={`mt-2 ${errors.location ? 'is-invalid' : ''}`}
                    {...register('location', { required: true })}
                    onChange={handleLocationInputChange}
                    required
                  />
                )}
              />
            </Col>

            <Col xs={6}>
              <SelectWithCustomInputField
                label="Storage"
                required
                selectValue={selectedStorage}
                selectPlaceholder="Select storage..."
                options={storageOptions}
                onSelectChange={handleStorageSelectChange}
                isInvalid={!!errors.storage}
                errorMessage={errors.storage?.message}
                extraOptionLabel="Add Storage"
                customTriggerValue="Add Storage"
                renderCustomInput={() => (
                  <Form.Control
                    type="text"
                    placeholder="Enter new storage"
                    className={`mt-2 ${errors.storage ? 'is-invalid' : ''}`}
                    {...register('storage', { required: true })}
                    onChange={handleStorageInputChange}
                    required
                  />
                )}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Quantity</Form.Label>
                <Form.Control
                  min={0}
                  type="number"
                  step={0.5}
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="e.g., 1, 1.5"
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <SelectWithCustomInputField
                label="Unit"
                required
                selectValue={unitChoice}
                selectPlaceholder="Select unit..."
                options={unitOptions}
                onSelectChange={handleUnitSelectChange}
                isInvalid={!!errors.unit}
                errorMessage={errors.unit?.message}
                customTriggerValue="Other"
                renderCustomInput={() => (
                  <Form.Control
                    type="text"
                    {...register('unit')}
                    placeholder="Enter custom unit"
                    required
                    className={`mt-2 ${errors.unit ? 'is-invalid' : ''}`}
                    onChange={handleUnitInputChange}
                  />
                )}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="mb-0">Restock Threshold</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g., 0.5"
                  isInvalid={!!errors.restockThreshold}
                  {...register('restockThreshold', {
                    setValueAs: (value) => {
                      if (value === '' || value == null) return null;
                      const parsed = Number(value);
                      return Number.isNaN(parsed) ? null : parsed;
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.restockThreshold?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  When quantity falls below this value, the item will be added to your shopping list.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0">Expiration Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register('expiration')}
                  isInvalid={!!errors.expiration}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.expiration?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0">Image</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    {...register('image')}
                    placeholder="Image URL"
                    isInvalid={!!errors.image}
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    style={{ display: 'inline-block', zIndex: 99 }}
                    onClick={() => setShowPicker(true)}
                  >
                    Pick
                  </Button>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.image?.message}
                </Form.Control.Feedback>

                {imageVal && (
                  <div className="mt-2">
                    <RBImage
                      src={imageVal}
                      alt={imageAlt || 'Preview'}
                      style={{
                        maxHeight: 120,
                        borderRadius: 8,
                        objectFit: 'cover',
                      }}
                      thumbnail
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <input type="hidden" {...register('owner')} value={produce.owner} />

          <Row className="d-flex justify-content-between mt-4">
            <Col xs={6}>
              <Button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Col>
            <Col xs={6}>
              <Button type="submit" className="btn-submit">
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <ImagePickerModal
        show={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url, meta) => {
          setValue('image', url, { shouldValidate: true, shouldDirty: true });
          if (meta?.alt) setImageAlt(meta.alt);
        }}
      />
    </Modal>
  );
}
