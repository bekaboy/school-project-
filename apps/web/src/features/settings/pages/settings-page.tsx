import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Settings2, Save } from 'lucide-react';
import { useSettings, useUpsertSettings } from '@/lib/supabase';
import { useAuthStore } from '@/stores';

const STORAGE_KEY = 'era-med-settings';

interface CompanySettings {
  companyName: string;
  amharicName: string;
  taxId: string;
  vatRegistration: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  defaultTaxRate: string;
  lowStockThreshold: string;
  expiryWarningPeriod: string;
}

const defaults: CompanySettings = {
  companyName: 'Era Med Pharmaceutical Wholesale PLC',
  amharicName: 'የኢራ ሜድ ፋርማሲዩቲካል ኅብረት ሥርዓት የጅምላ ሽያጭ ኃላፊነቱ የተወሰነ የግል ማኅበር',
  taxId: '1234567890',
  vatRegistration: 'VAT-987654321',
  phone: '+251 11 123 4567',
  email: 'info@eramed.com',
  address: 'Bole Sub-city, Addis Ababa, Ethiopia',
  currency: 'ETB (Ethiopian Birr)',
  defaultTaxRate: '15',
  lowStockThreshold: 'Per-product reorder quantity',
  expiryWarningPeriod: '90',
};

function loadLocal(): CompanySettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function toApi(s: CompanySettings, userId: string) {
  return {
    user_id: userId,
    company_name: s.companyName,
    amharic_name: s.amharicName,
    tax_id: s.taxId,
    vat_registration: s.vatRegistration,
    phone: s.phone,
    email: s.email,
    address: s.address,
    currency: s.currency,
    default_tax_rate: s.defaultTaxRate,
    low_stock_threshold: s.lowStockThreshold,
    expiry_warning_period: s.expiryWarningPeriod,
  };
}

function toForm(s: Record<string, string>): CompanySettings {
  return {
    companyName: s.company_name ?? defaults.companyName,
    amharicName: s.amharic_name ?? defaults.amharicName,
    taxId: s.tax_id ?? defaults.taxId,
    vatRegistration: s.vat_registration ?? defaults.vatRegistration,
    phone: s.phone ?? defaults.phone,
    email: s.email ?? defaults.email,
    address: s.address ?? defaults.address,
    currency: s.currency ?? defaults.currency,
    defaultTaxRate: s.default_tax_rate ?? defaults.defaultTaxRate,
    lowStockThreshold: s.low_stock_threshold ?? defaults.lowStockThreshold,
    expiryWarningPeriod: s.expiry_warning_period ?? defaults.expiryWarningPeriod,
  };
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { data: dbSettings, isLoading } = useSettings(userId);
  const upsert = useUpsertSettings();

  const [settings, setSettings] = useState<CompanySettings>(() => {
    return loadLocal() ?? defaults;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (dbSettings) {
      setSettings(toForm(dbSettings as unknown as Record<string, string>));
    }
  }, [dbSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function update<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (userId) {
      await upsert.mutateAsync(toApi(settings, userId));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">System configuration and company profile.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name">
              <Input value={settings.companyName} onChange={(e) => update('companyName', e.target.value)} />
            </Field>
            <Field label="Amharic Name">
              <Input value={settings.amharicName} onChange={(e) => update('amharicName', e.target.value)} />
            </Field>
            <Field label="Tax ID (TIN)">
              <Input value={settings.taxId} onChange={(e) => update('taxId', e.target.value)} />
            </Field>
            <Field label="VAT Registration">
              <Input value={settings.vatRegistration} onChange={(e) => update('vatRegistration', e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={settings.phone} onChange={(e) => update('phone', e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={settings.email} onChange={(e) => update('email', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <Input value={settings.address} onChange={(e) => update('address', e.target.value)} />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Currency">
              <Input value={settings.currency} onChange={(e) => update('currency', e.target.value)} />
            </Field>
            <Field label="Default Tax Rate (%)">
              <Input value={settings.defaultTaxRate} onChange={(e) => update('defaultTaxRate', e.target.value)} />
            </Field>
            <Field label="Low Stock Threshold">
              <Input value={settings.lowStockThreshold} onChange={(e) => update('lowStockThreshold', e.target.value)} />
            </Field>
            <Field label="Expiry Warning Period (days)">
              <Input value={settings.expiryWarningPeriod} onChange={(e) => update('expiryWarningPeriod', e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
