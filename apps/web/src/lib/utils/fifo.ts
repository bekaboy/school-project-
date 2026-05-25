interface BatchStock {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  quantityRemaining: number;
}

interface DeductionResult {
  batchId: string;
  quantityTaken: number;
}

export function deductFifo(
  batches: BatchStock[],
  quantityNeeded: number,
): DeductionResult[] {
  const sorted = [...batches]
    .filter((b) => b.quantityRemaining > 0)
    .sort(
      (a, b) =>
        new Date(a.manufacturingDate).getTime() -
        new Date(b.manufacturingDate).getTime(),
    );

  const results: DeductionResult[] = [];
  let remaining = quantityNeeded;

  for (const batch of sorted) {
    if (remaining <= 0) break;

    const taken = Math.min(remaining, batch.quantityRemaining);
    results.push({ batchId: batch.id, quantityTaken: taken });
    remaining -= taken;
  }

  if (remaining > 0) {
    throw new Error(
      `Insufficient stock: needed ${quantityNeeded}, but only ${quantityNeeded - remaining} available across all batches`,
    );
  }

  return results;
}
