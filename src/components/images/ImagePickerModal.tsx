'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, InputGroup, Button, Spinner, Row, Col, Image } from 'react-bootstrap';
import '@/styles/buttons.css';

type SearchImage = {
  id: string;
  thumb: string;
  full: string;
  alt: string;
  credit: string;
  link: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSelect: (url: string, meta?: { alt?: string; credit?: string; source?: string }) => void;
};

export default function ImagePickerModal({ show, onClose, onSelect }: Props) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debouncedQ = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!debouncedQ) { setResults([]); return; }
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/image-search?q=${encodeURIComponent(debouncedQ)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!active) return;
        setResults(data.results as SearchImage[]);
      } catch {
        if (active) setError('Search failed. Try again.');
      } finally {
        if (active) setLoading(false);
      }
    }
    const t = setTimeout(run, 350);
    return () => { active = false; clearTimeout(t); };
  }, [debouncedQ]);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Search an image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <InputGroup.Text>🔎</InputGroup.Text>
          <Form.Control
            placeholder="e.g. pho, grilled cheese, salad"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <Button variant="outline-secondary" onClick={() => setQ('')}>Clear</Button>
        </InputGroup>

        {loading && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <Spinner animation="border" size="sm" />
            {' '}
            <span>Searching…</span>
          </div>
        )}
        {error && <div className="text-danger small mb-2">{error}</div>}

        <Row xs={2} md={3} lg={4} className="g-3">
          {results.map((img) => (
            <Col key={img.id}>
              <button
                type="button"
                className="border-0 p-0 bg-transparent w-100"
                onClick={() => {
                  onSelect(img.full, { alt: img.alt, credit: img.credit, source: img.link });
                  onClose();
                }}
                title="Use this image"
              >
                <Image
                  src={img.thumb}
                  alt={img.alt}
                  className="w-100"
                  style={{ aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 8 }}
                />
              </button>
              <div className="small text-muted mt-1 text-truncate" title={img.credit}>
                {img.credit}
              </div>
            </Col>
          ))}
        </Row>

        {!loading && !results.length && debouncedQ && (
          <div className="text-muted">No results.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-cancel" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
