import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrojjnzhwsstjikxubai.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb2pqbnpod3NzdGppa3h1YmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMDE5MywiZXhwIjoyMDk1Mjk2MTkzfQ.6Y8bYr99PfyWpLklNfQs_cXfEr0gUHl0ddZYrlS5WUA';
const supabase = createClient(supabaseUrl, serviceRoleKey);

const SUPPLIERS = [
  'PharmaEth Supply Co.',
  'East Africa Medical Supply',
  'Addis Pharmaceutical Distributors',
  'Ethio-Drug Wholesale',
  'Curex Ethiopia PLC',
  'Kopran Ethiopia',
  'Julphar East Africa',
  'GSK Ethiopia',
  'Pfizer East Africa',
  'Sanofi Ethiopia',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(monthsFromNow: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toISOString().split('T')[0]!;
}

function pastDate(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().split('T')[0]!;
}

function batchNumber(productId: string, index: number): string {
  return `BATCH-${productId}-${index}`;
}

interface Product {
  id: string;
  product_id: string;
  category: string;
  pack_size: string;
}

function getStockRange(category: string, packSize: string): [number, number] {
  const cat = category.toLowerCase();
  const isInjection = packSize.toLowerCase().includes('vial') || packSize.toLowerCase().includes('ampoule') || packSize.toLowerCase().includes('injection');
  const isSuspension = packSize.toLowerCase().includes('suspension') || packSize.toLowerCase().includes('syrup');

  if (isInjection) return [50, 300];
  if (isSuspension) return [30, 150];
  if (cat.includes('anti-infective') || cat.includes('antibiotic')) return [200, 800];
  if (cat.includes('analgesic') || cat.includes('pain')) return [150, 600];
  if (cat.includes('cvs') || cat.includes('cardiac') || cat.includes('cardio')) return [100, 400];
  if (cat.includes('cns') || cat.includes('neuro')) return [80, 350];
  if (cat.includes('gi') || cat.includes('gastric')) return [100, 500];
  if (cat.includes('respiratory') || cat.includes('asthma')) return [80, 300];
  if (cat.includes('diabetic') || cat.includes('insulin')) return [60, 250];
  return [100, 500];
}

async function main() {
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, product_id, category, pack_size')
    .not('product_id', 'like', 'PROD-2026%');

  if (prodError) throw prodError;
  if (!products) { console.log('No products found'); return; }

  console.log(`Found ${products.length} new products to create batches for`);

  const BATCH_SIZE = 25;
  let inserted = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const records: Record<string, unknown>[] = [];

    for (const product of batch as Product[]) {
      const [minQty, maxQty] = getStockRange(product.category, product.pack_size);
      const qty = randomInt(minQty, maxQty);

      records.push({
        product_id: product.id,
        batch_number: batchNumber(product.product_id, 1),
        expiry_date: futureDate(randomInt(12, 24)),
        manufacturing_date: pastDate(randomInt(4, 10)),
        quantity_received: qty,
        quantity_remaining: qty,
        supplier: SUPPLIERS[randomInt(0, SUPPLIERS.length - 1)],
        date_received: pastDate(randomInt(1, 3)),
        batch_status: 'Active',
      });

      if (qty > 400) {
        const qty2 = randomInt(100, 300);
        records.push({
          product_id: product.id,
          batch_number: batchNumber(product.product_id, 2),
          expiry_date: futureDate(randomInt(18, 30)),
          manufacturing_date: pastDate(randomInt(2, 6)),
          quantity_received: qty2,
          quantity_remaining: qty2,
          supplier: SUPPLIERS[randomInt(0, SUPPLIERS.length - 1)],
          date_received: pastDate(randomInt(0, 2)),
          batch_status: 'Active',
        });
      }
    }

    const { error } = await supabase.from('batches').insert(records);
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      errorCount++;
    } else {
      inserted += records.length;
      console.log(`Batch ${i / BATCH_SIZE + 1}: ${records.length} batch records created`);
    }
  }

  console.log(`\nDone. Created ${inserted} batch records, Errors: ${errorCount}`);

  const { count, error: countError } = await supabase
    .from('batches')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Count error:', countError.message);
  } else {
    console.log(`Total batches in DB: ${count}`);
  }

  const { data: stockCheck } = await supabase
    .from('batches')
    .select('product_id, quantity_remaining')
    .gte('quantity_remaining', 1)
    .limit(5);

  console.log('Sample batches with stock:', JSON.stringify(stockCheck));
}

main().catch(console.error);
