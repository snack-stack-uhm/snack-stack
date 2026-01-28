'use client';

import React from 'react';
import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { BsList, BsGrid } from 'react-icons/bs';
import type { SortType } from './ProduceListWithGrouping';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  sort: SortType;
  setSort: (v: SortType) => void;
  groupByStorage: boolean;
  setGroupByStorage: (v: boolean) => void;
  view: 'table' | 'cards';
  setView: (v: 'table' | 'cards') => void;
  clear: () => void;
};

const SearchBarControls: React.FC<Props> = ({
  search,
  setSearch,
  sort,
  setSort,
  groupByStorage,
  setGroupByStorage,
  view,
  setView,
  clear,
}) => (
  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center my-4">
    <Form.Control
      type="text"
      placeholder="Search by name, category, or location…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
      style={{ maxWidth: '315px' }}
    />

    <Form.Select
      value={sort}
      onChange={(e) => setSort(e.target.value as SortType)}
      style={{ maxWidth: '180px' }}
    >
      <option value="">Sort by…</option>
      <option value="name-asc">Name (A–Z)</option>
      <option value="type-cat">Category (A–Z)</option>
      <option value="expiration-soon">Expiration (Soonest)</option>
      <option value="qty-desc">Quantity (High → Low)</option>
      <option value="qty-asc">Quantity (Low → High)</option>
    </Form.Select>

    <Form.Check
      type="switch"
      id="group-by-storage"
      label="Group by storage"
      checked={groupByStorage}
      onChange={(e) => setGroupByStorage(e.currentTarget.checked)}
    />

    <ButtonGroup aria-label="View mode">
      <Button
        className={view === 'table' ? 'btn-view-active' : 'btn-view-inactive'}
        onClick={() => setView('table')}
        title="Table View"
      >
        <BsList size={20} />
      </Button>
      <Button
        className={view === 'cards' ? 'btn-view-active' : 'btn-view-inactive'}
        onClick={() => setView('cards')}
        title="Card View"
      >
        <BsGrid size={20} />
      </Button>
    </ButtonGroup>

    <Button className="btn-clear" onClick={clear}>
      Clear
    </Button>
  </div>
);

export default SearchBarControls;
