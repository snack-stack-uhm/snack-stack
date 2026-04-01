'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import type { ProduceRelations } from '@/types/ProduceRelations';
import SearchBarControls from './SearchBarControls';
import ProduceTable from './ProduceTable';
import ProduceCardGrid from './ProduceCardGrid';
import GroupedSections from './GroupedSections';

const STORAGE_ORDER = ['freezer', 'fridge', 'pantry'] as const;
const PANTRY_CONTROLS_STORAGE_KEY = 'snack-stack:pantry-controls';
type ViewMode = 'table' | 'cards';
type StoredPantryControls = {
  search: string;
  sort: SortType;
  groupByStorage: boolean;
  view: ViewMode;
};
const VALID_SORTS: SortType[] = ['', 'name-asc', 'cat-asc', 'expiration-soon', 'qty-desc', 'qty-asc'];
const VALID_VIEWS: ViewMode[] = ['table', 'cards'];

const toTime = (d: unknown): number => {
  if (!d) return Number.POSITIVE_INFINITY;
  const t = new Date(d as string | number | Date).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
};

export type SortType =
  | ''
  | 'name-asc'
  | 'cat-asc'
  | 'expiration-soon'
  | 'qty-desc'
  | 'qty-asc';

function sortProduce(arr: ProduceRelations[], sort: string): ProduceRelations[] {
  const sorted = [...arr];
  switch (sort) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'cat-asc':
      sorted.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''));
      break;
    case 'expiration-soon':
      sorted.sort((a, b) => toTime(a.expiration) - toTime(b.expiration));
      break;
    case 'qty-desc':
      sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
      break;
    case 'qty-asc':
      sorted.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
      break;
    default:
      break;
  }
  return sorted;
}

const ProduceListWithGrouping: React.FC<{ initialProduce: ProduceRelations[] }> = ({ initialProduce }) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortType>('');
  const [groupByStorage, setGroupByStorage] = useState(false);
  const [view, setView] = useState<ViewMode>('table');
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

  useEffect(() => {
    try {
      const savedControls = localStorage.getItem(PANTRY_CONTROLS_STORAGE_KEY);
      if (!savedControls) return;

      const parsed = JSON.parse(savedControls) as Partial<StoredPantryControls>;

      if (typeof parsed.search === 'string') setSearch(parsed.search);
      if (VALID_SORTS.includes(parsed.sort as SortType)) setSort(parsed.sort as SortType);
      if (typeof parsed.groupByStorage === 'boolean') setGroupByStorage(parsed.groupByStorage);
      if (VALID_VIEWS.includes(parsed.view as ViewMode)) setView(parsed.view as ViewMode);
    } catch {
      localStorage.removeItem(PANTRY_CONTROLS_STORAGE_KEY);
    } finally {
      setHasLoadedPreferences(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferences) return;

    const controls: StoredPantryControls = {
      search,
      sort,
      groupByStorage,
      view,
    };

    localStorage.setItem(PANTRY_CONTROLS_STORAGE_KEY, JSON.stringify(controls));
  }, [groupByStorage, hasLoadedPreferences, search, sort, view]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = [...initialProduce];
    if (q) {
      arr = arr.filter(
        (p) => p.name.toLowerCase().includes(q)
          || (p.type?.toLowerCase().includes(q) ?? false)
          || (p.storage?.name?.toLowerCase().includes(q) ?? false)
          || (p.location?.name?.toLowerCase().includes(q) ?? false),
      );
    }
    return sortProduce(arr, sort);
  }, [initialProduce, search, sort]);

  const grouped = useMemo(() => {
    if (!groupByStorage) return [] as Array<[string, ProduceRelations[]]>;
    const map = new Map<string, ProduceRelations[]>();
    for (const item of filteredSorted) {
      const key = item.storage?.name?.trim().toLowerCase() || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    const sections: Array<[string, ProduceRelations[]]> = [];
    for (const storage of STORAGE_ORDER) {
      if (map.has(storage)) {
        sections.push([storage, sortProduce(map.get(storage)!, sort)]);
        map.delete(storage);
      }
    }
    for (const [storage, items] of Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      sections.push([storage, sortProduce(items, sort)]);
    }

    return sections;
  }, [filteredSorted, groupByStorage, sort]);

  const clear = () => {
    setSearch('');
    setSort('');
    setGroupByStorage(false);
  };

  const renderContent = () => {
    if (groupByStorage) {
      return view === 'table'
        ? <GroupedSections groups={grouped} view="table" />
        : <GroupedSections groups={grouped} view="cards" />;
    }
    return view === 'table'
      ? <ProduceTable rows={filteredSorted} />
      : <ProduceCardGrid rows={filteredSorted} />;
  };

  return (
    <Container>
      <SearchBarControls
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        groupByStorage={groupByStorage}
        setGroupByStorage={setGroupByStorage}
        view={view}
        setView={setView}
        clear={clear}
      />
      {renderContent()}
    </Container>
  );
};

export default ProduceListWithGrouping;
