import { describe, it, expect } from 'vitest';
import { deductFifo } from '@/lib/utils/fifo';

interface BatchStock {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  quantityRemaining: number;
}

function makeBatch(
  id: string,
  mfgDate: string,
  qty: number,
  batchNumber = `BATCH-${id}`,
): BatchStock {
  return { id, batchNumber, manufacturingDate: mfgDate, quantityRemaining: qty };
}

describe('deductFifo', () => {
  it('deducts from oldest batch first', () => {
    const batches = [
      makeBatch('1', '2024-01-01', 10),
      makeBatch('2', '2024-06-01', 10),
      makeBatch('3', '2024-03-01', 10),
    ];
    const result = deductFifo(batches, 15);
    expect(result).toEqual([
      { batchId: '1', quantityTaken: 10 },
      { batchId: '3', quantityTaken: 5 },
    ]);
  });

  it('skips batches with zero remaining', () => {
    const batches = [
      makeBatch('1', '2024-01-01', 0),
      makeBatch('2', '2024-03-01', 10),
    ];
    const result = deductFifo(batches, 5);
    expect(result).toEqual([{ batchId: '2', quantityTaken: 5 }]);
  });

  it('takes full quantity from one batch', () => {
    const batches = [makeBatch('1', '2024-01-01', 50)];
    const result = deductFifo(batches, 50);
    expect(result).toEqual([{ batchId: '1', quantityTaken: 50 }]);
  });

  it('takes partial from multiple batches across all', () => {
    const batches = [
      makeBatch('a', '2024-01-01', 5),
      makeBatch('b', '2024-02-01', 5),
      makeBatch('c', '2024-03-01', 5),
    ];
    const result = deductFifo(batches, 12);
    expect(result).toEqual([
      { batchId: 'a', quantityTaken: 5 },
      { batchId: 'b', quantityTaken: 5 },
      { batchId: 'c', quantityTaken: 2 },
    ]);
  });

  it('throws when stock is insufficient', () => {
    const batches = [makeBatch('1', '2024-01-01', 3)];
    expect(() => deductFifo(batches, 10)).toThrow('Insufficient stock');
  });

  it('throws when no batches have stock', () => {
    const batches = [makeBatch('1', '2024-01-01', 0)];
    expect(() => deductFifo(batches, 1)).toThrow('Insufficient stock');
  });

  it('returns empty array when quantity needed is zero', () => {
    const batches = [makeBatch('1', '2024-01-01', 10)];
    const result = deductFifo(batches, 0);
    expect(result).toEqual([]);
  });

  it('does not mutate original batch array', () => {
    const batches = [makeBatch('1', '2024-01-01', 10)];
    const copy = [...batches];
    deductFifo(batches, 5);
    expect(batches).toEqual(copy);
  });

  it('sorts correctly with same-date batches', () => {
    const batches = [
      makeBatch('a', '2024-01-01', 5),
      makeBatch('b', '2024-01-01', 5),
    ];
    const result = deductFifo(batches, 8);
    expect(result).toEqual([
      { batchId: 'a', quantityTaken: 5 },
      { batchId: 'b', quantityTaken: 3 },
    ]);
  });

  it('handles exact multi-batch match', () => {
    const batches = [
      makeBatch('x', '2024-01-01', 7),
      makeBatch('y', '2024-02-01', 3),
    ];
    const result = deductFifo(batches, 10);
    expect(result).toEqual([
      { batchId: 'x', quantityTaken: 7 },
      { batchId: 'y', quantityTaken: 3 },
    ]);
  });
});
