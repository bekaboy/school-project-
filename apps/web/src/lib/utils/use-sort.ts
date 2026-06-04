import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useSort<T>(items: T[], defaultKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  function toggleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [items, sortKey, sortDir]);

  function getSortProps(key: keyof T) {
    const isActive = sortKey === key;
    return {
      isActive,
      direction: sortDir,
      onClick: () => toggleSort(key),
    };
  }

  return { sorted, sortKey, sortDir, getSortProps };
}
