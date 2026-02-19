'use client';

import {
  Modal,
  Button,
  Form,
  Alert,
  Row,
  Col,
  InputGroup,
  Image as RBImage,
} from 'react-bootstrap';
import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import { updateRecipe } from '@/lib/recipes';
import '@/styles/buttons.css';

type EditRecipeModalProps = {
  show: boolean;
  onHide: () => void;
  recipe: {
    id: number;
    title: string;
    cuisine: string;
    description: string;
    imageUrl: string;
    dietary: string[];
    ingredientItems: {
      id?: number;
      name: string;
      quantity: number | null;
      unit: string | null;
      order?: number | null;
    }[];
    instructions?: string | null;
    servings?: number | null;
    prepMinutes?: number | null;
    cookMinutes?: number | null;
    sourceUrl?: string | null;
  };
};

export default function EditRecipeModal({ show, onHide, recipe }: EditRecipeModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Local form state (prefilled)
  const [title, setTitle] = useState(recipe.title);
  const [cuisine, setCuisine] = useState(recipe.cuisine);
  const [description, setDescription] = useState(recipe.description || '');
  const [imageUrl, setImageUrl] = useState(recipe.imageUrl || '');
  const [dietary, setDietary] = useState((recipe.dietary ?? []).join(', '));

  // ingredientText: one ingredient per line: "qty unit name"
  const [ingredientText, setIngredientText] = useState(
    (recipe.ingredientItems ?? [])
      .map((i) => `${i.quantity ?? ''} ${i.unit ?? ''} ${i.name}`
        .trim()
        .replace(/\s+/g, ' '))
      .join('\n'),
  );

  const [instructions, setInstructions] = useState(recipe.instructions || '');
  const [servings, setServings] = useState<number | ''>(recipe.servings ?? '');
  const [prepMinutes, setPrepMinutes] = useState<number | ''>(
    recipe.prepMinutes ?? '',
  );
  const [cookMinutes, setCookMinutes] = useState<number | ''>(
    recipe.cookMinutes ?? '',
  );
  const [sourceUrl, setSourceUrl] = useState(recipe.sourceUrl || '');

  // image picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  // If the recipe prop changes while modal is open, re-sync state
  useEffect(() => {
    setTitle(recipe.title);
    setCuisine(recipe.cuisine);
    setDescription(recipe.description || '');
    setImageUrl(recipe.imageUrl || '');
    setDietary((recipe.dietary ?? []).join(', '));
    setIngredientText(
      (recipe.ingredientItems ?? [])
        .map((i) => `${i.quantity ?? ''} ${i.unit ?? ''} ${i.name}`
          .trim()
          .replace(/\s+/g, ' '))
        .join('\n'),
    );
    setInstructions(recipe.instructions || '');
    setServings(recipe.servings ?? '');
    setPrepMinutes(recipe.prepMinutes ?? '');
    setCookMinutes(recipe.cookMinutes ?? '');
    setSourceUrl(recipe.sourceUrl || '');
  }, [recipe]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);

      // Parse ingredientText → ingredientItems
      const normalizedIngredientItems = ingredientText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const parts = line.split(/\s+/);

          // first token numeric → treat as quantity
          const qty = Number(parts[0]);
          const hasNumericQty = !Number.isNaN(qty);

          if (hasNumericQty && parts.length >= 3) {
            const quantity = qty;
            const unit = parts[1];
            const name = parts.slice(2).join(' ');

            return {
              name,
              quantity,
              unit,
              order: index,
            };
          }

          // fallback: entire line is just name
          return {
            name: line,
            quantity: null,
            unit: null,
            order: index,
          };
        });

      try {
        await updateRecipe(recipe.id, {
          title,
          cuisine,
          description,
          imageUrl,
          dietary: dietary
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          // 🔥 new structured ingredients
          ingredientItems: normalizedIngredientItems,
          instructions,
          servings: servings === '' ? undefined : Number(servings),
          prepMinutes:
            prepMinutes === '' ? undefined : Number(prepMinutes),
          cookMinutes:
            cookMinutes === '' ? undefined : Number(cookMinutes),
          sourceUrl: sourceUrl || undefined,
        });

        startTransition(() => {
          router.refresh();
          onHide();
        });
      } catch (error: any) {
        setErr(error?.message ?? 'Failed to update recipe');
      }
    },
    [
      recipe.id,
      title,
      cuisine,
      description,
      imageUrl,
      dietary,
      ingredientText,
      instructions,
      servings,
      prepMinutes,
      cookMinutes,
      sourceUrl,
      router,
      onHide,
    ],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Recipe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  value={title}
                  placeholder="e.g., Spaghetti Bolognese"
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine *</Form.Label>
                <Form.Control
                  value={cuisine}
                  placeholder="e.g., Italian, Mexican, Chinese"
                  onChange={(e) => setCuisine(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="A brief description of the recipe"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowPicker(true)}
                  >
                    Pick image
                  </Button>
                </InputGroup>
                {imageAlt && (
                  <Form.Text className="text-muted">
                    Alt:
                    {imageAlt}
                  </Form.Text>
                )}
                {imageUrl && (
                  <div className="mt-2">
                    <RBImage
                      src={imageUrl}
                      alt={imageAlt || 'Preview'}
                      style={{
                        maxHeight: 140,
                        borderRadius: 8,
                        objectFit: 'cover',
                      }}
                      thumbnail
                    />
                  </div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dietary (comma-separated)</Form.Label>
                <Form.Control
                  placeholder="Vegan, Gluten-Free"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* INGREDIENT TEXTAREA */}
          <Form.Group className="mb-3">
            <Form.Label className="mb-0">Ingredients</Form.Label>
            <Form.Text className="d-block ps-3 mb-2 text-muted">
              Enter one ingredient per line, in the format:
              <br />
              <code>quantity unit name</code>
              <br />
              Examples:
              <br />
              <code>1 cup sugar</code>
              <br />
              <code>2 tbsp olive oil</code>
            </Form.Text>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={'1 cup onion\n2 pcs tomatoes\n1 tsp basil'}
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Instructions (one step per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder={'1. Preheat oven...\n2. Mix the dry ingredients...\n3. ...'}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Form.Text className="text-muted">
              Line breaks will be preserved on the recipe page.
            </Form.Text>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Servings</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 2, 4, 6"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Prep (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 15, 20, 25"
                  min={0}
                  value={prepMinutes}
                  onChange={(e) => setPrepMinutes(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Cook (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 15, 30, 45"
                  min={0}
                  value={cookMinutes}
                  onChange={(e) => setCookMinutes(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Source URL (optional)</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/recipe"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </Form.Group>

          <Row className="d-flex justify-content-between mt-4">
            <Col xs={6}>
              <Button className="btn-cancel" type="button" onClick={onHide}>
                Cancel
              </Button>
            </Col>
            <Col xs={6}>
              <Button type="submit" className="btn-submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      {/* Image picker modal */}
      <ImagePickerModal
        show={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url, meta) => {
          setImageUrl(url);
          if (meta?.alt) setImageAlt(meta.alt);
        }}
      />
    </Modal>
  );
}
