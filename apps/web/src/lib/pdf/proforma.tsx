import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';

const colors = {
  primary: '#1a4731',
  secondary: '#b8860b',
  text: '#1a1a1a',
  muted: '#6b7280',
  border: '#d1d5db',
  background: '#f8f6f0',
  headerBg: '#1a4731',
  headerText: '#ffffff',
  accent: '#c41e3a',
};

const BANK_ACCOUNTS = [
  ['Commercial Bank of Ethiopia', '1000694326564'],
  ['Siinqee Bank', '1090329051215'],
  ['Awash Bank', '013041642529100'],
  ['Abyssinia Bank', '225157715'],
  ['Dashen Bank', '0178901191011'],
  ['Oromia Coop Bank', '1013300161306'],
  ['Oromia Bank', '1879439400001'],
  ['Birhan Bank', '2500090149344'],
  ['Abay Bank', '1262112361585018'],
  ['Hibret Bank', '1731815453602014'],
] as const;

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  headerBar: {
    backgroundColor: colors.headerBg,
    marginBottom: 28,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 55,
    height: 55,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.headerText,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  docLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 7,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 3,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece4',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ece4',
    backgroundColor: '#fcfaf7',
  },
  colNo: { flex: 0.4, textAlign: 'center' },
  colDesc: { flex: 2.6 },
  colExpiry: { flex: 1, textAlign: 'center' },
  colQty: { flex: 0.7, textAlign: 'right' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totalsContainer: {
    marginLeft: 'auto',
    width: '45%',
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  totalBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 4,
  },
  grandTotalText: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
  },
  stampContainer: {
    position: 'absolute',
    bottom: 160,
    right: 48,
    width: 110,
    height: 110,
    borderWidth: 3,
    borderColor: '#2563eb',
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  stampText: {
    fontSize: 7,
    color: '#2563eb',
    fontWeight: 700,
    textAlign: 'center',
  },
  termsBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#e5e0d8',
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 7,
    color: colors.muted,
    lineHeight: 1.6,
  },
  bankSection: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e0d8',
    backgroundColor: colors.background,
  },
  bankTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bankName: {
    fontSize: 7,
    color: colors.text,
    width: '50%',
  },
  bankNumber: {
    fontSize: 7,
    color: colors.text,
    width: '50%',
    fontFamily: 'Courier',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#1a4731',
    paddingTop: 10,
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
  },
  footerCol: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  footerText: {
    fontSize: 6.5,
    color: colors.muted,
    lineHeight: 1.6,
  },
});

interface ProformaItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  expiryDate?: string;
}

interface ProformaData {
  orderId: string;
  date: string;
  validUntil: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerTaxId: string;
  salesRep: string;
  items: ProformaItem[];
  subtotal: number;
  tax: number;
  total: number;
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function ProformaDocument({ data }: { data: ProformaData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <View style={styles.headerRow}>
            <Image src={`${getBaseUrl()}/logo.png`} style={styles.logo} />
            <View style={styles.headerContent}>
              <Text style={styles.companyName}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
              <View style={styles.headerRight}>
                <Text style={styles.docLabel}>Proforma Invoice</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.infoValue, { color: colors.headerText, fontSize: 11, fontWeight: 700 }]}>
                    {data.orderId}
                  </Text>
                  <Text style={[styles.infoValue, { color: '#a3b8a8', fontSize: 8 }]}>
                    {data.date}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoValue}>{data.customerName}</Text>
            <Text style={styles.infoValue}>{data.customerAddress}</Text>
            <Text style={styles.infoValue}>{data.customerPhone}</Text>
            {data.customerTaxId && (
              <Text style={styles.infoValue}>Tax ID: {data.customerTaxId}</Text>
            )}
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Valid Until</Text>
            <Text style={styles.infoValue}>{data.validUntil}</Text>
            <Text style={[styles.infoLabel, { marginTop: 8 }]}>Sales Rep</Text>
            <Text style={styles.infoValue}>{data.salesRep}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colExpiry]}>Expiry</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={i}>
              <Text style={styles.colNo}>{i + 1}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colExpiry}>{item.expiryDate ?? '—'}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{fmt(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={[styles.totalRow, styles.totalBorder]}>
            <Text>Subtotal</Text>
            <Text>{fmt(data.subtotal)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalBorder]}>
            <Text>VAT (15%)</Text>
            <Text>{fmt(data.tax)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>Total Due</Text>
            <Text style={styles.grandTotalText}>{fmt(data.total)}</Text>
          </View>
        </View>

        <View style={styles.stampContainer}>
          <Text style={styles.stampText}>PAID</Text>
          <Text style={[styles.stampText, { fontSize: 5 }]}>———</Text>
          <Text style={[styles.stampText, { fontSize: 5 }]}>ERA MED</Text>
          <Text style={[styles.stampText, { fontSize: 5 }]}>PHARMACEUTICAL</Text>
        </View>

        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Bank Accounts</Text>
          {BANK_ACCOUNTS.map(([bank, account]) => (
            <View style={styles.bankRow} key={bank}>
              <Text style={styles.bankName}>{bank}</Text>
              <Text style={styles.bankNumber}>{account}</Text>
            </View>
          ))}
        </View>

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            This proforma invoice is valid until {data.validUntil}. Payment must be completed before delivery. Subject to product availability and credit approval.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
          <View style={styles.footerRow}>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Contact Information</Text>
              <Text style={styles.footerText}>Phone: 0911-24-49-01 / 0911-85-34-43</Text>
              <Text style={styles.footerText}>Email: eramedpharma@gmail.com</Text>
              <Text style={styles.footerText}>Website: https://www.era-med.org</Text>
              <Text style={styles.footerText}>P.O. Box: 21259/1000</Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Head Office</Text>
              <Text style={styles.footerText}>Addis Ababa, Ethiopia</Text>
              <Text style={styles.footerText}>Sub-City: Addis Ketama</Text>
              <Text style={styles.footerText}>Woreda: 06</Text>
              <Text style={styles.footerText}>House No: 331/201</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function fmt(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

export async function generateProformaPdf(data: ProformaData): Promise<Blob> {
  const doc = <ProformaDocument data={data} />;
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  requestAnimationFrame(() => {
    a.click();
    requestAnimationFrame(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
}
