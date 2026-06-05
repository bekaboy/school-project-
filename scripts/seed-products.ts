import * as fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const CSV_PATH = 'C:\\Users\\kidis\\OneDrive\\Desktop\\fundanmental\\ethiopia_pharma_products_150.csv';

const supabaseUrl = 'https://mrojjnzhwsstjikxubai.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb2pqbnpod3NzdGppa3h1YmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyMDE5MywiZXhwIjoyMDk1Mjk2MTkzfQ.6Y8bYr99PfyWpLklNfQs_cXfEr0gUHl0ddZYrlS5WUA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

interface ProductRow {
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  pack_size: string;
  manufacturer: string;
  country_of_origin: string;
  unit_of_measure: string;
  category: string;
  cost_price: number;
  selling_price: number;
  tax_rate: number;
  reorder_quantity: number;
  storage_requirements: string | null;
  description: string | null;
  product_id: string;
}

function parseProducts(): ProductRow[] {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const rows: ProductRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.length < 16) continue;
    rows.push({
      product_id: cols[15]!,
      generic_name: cols[0]!,
      brand_name: cols[1]!,
      strength: cols[2]!,
      dosage_form: cols[3]!,
      pack_size: cols[4]!,
      manufacturer: cols[5]!,
      country_of_origin: cols[6]!,
      unit_of_measure: cols[7]!,
      category: cols[8]!,
      cost_price: Number(cols[9]!),
      selling_price: Number(cols[10]!),
      tax_rate: Number(cols[11]!),
      reorder_quantity: Number(cols[12]!),
      storage_requirements: cols[13] || null,
      description: cols[14] || null,
    });
  }
  return rows;
}

async function main() {
  const products = parseProducts();
  console.log(`Parsed ${products.length} products from CSV`);

  const BATCH_SIZE = 50;
  let inserted = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      errorCount++;
    } else {
      inserted += batch.length;
      console.log(`Batch ${i / BATCH_SIZE + 1}: ${batch.length} inserted (${inserted}/${products.length})`);
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Errors: ${errorCount}`);

  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Count error:', countError.message);
  } else {
    console.log(`Total products in DB: ${count}`);
  }
}

main().catch(console.error);
