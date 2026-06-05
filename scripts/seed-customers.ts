import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const CSV_PATH = 'C:\\Users\\kidis\\OneDrive\\Desktop\\fundanmental\\ethiopia_healthcare_directory_300.csv';

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

interface CustomerRow {
  organization_type: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

function parseCustomers(): CustomerRow[] {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const rows: CustomerRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.length < 6) continue;
    rows.push({
      organization_type: cols[0]!,
      name: cols[1]!,
      contact_person: cols[2]!,
      phone: cols[3]!,
      email: cols[4]!,
      address: cols[5]!,
    });
  }
  return rows;
}

async function main() {
  const customers = parseCustomers();
  console.log(`Parsed ${customers.length} customers from CSV`);

  const BATCH_SIZE = 50;
  let inserted = 0;
  let errorCount = 0;

  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('customers').insert(
      batch.map((c) => ({
        organization_type: c.organization_type,
        name: c.name,
        contact_person: c.contact_person || null,
        phone: c.phone,
        email: c.email || null,
        address: c.address || null,
      }))
    );
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      errorCount++;
    } else {
      inserted += batch.length;
      console.log(`Batch ${i / BATCH_SIZE + 1}: ${batch.length} inserted (${inserted}/${customers.length})`);
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Errors: ${errorCount}`);

  const { count, error: countError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Count error:', countError.message);
  } else {
    console.log(`Total customers in DB: ${count}`);
  }
}

main().catch(console.error);
