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
    marginBottom: 16,
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
  amountInWords: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.text,
  },
  vatSection: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  vatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vatBox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  vatBoxChecked: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#374151',
    backgroundColor: '#374151',
  },
  vatLabel: {
    fontSize: 8,
    color: colors.text,
  },
  stampSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  signatureLine: {
    width: 140,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 4,
    marginTop: 24,
  },
  stampPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#1a5276',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7fc',
  },
  stampInner: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1a5276',
    textAlign: 'center',
    marginBottom: 2,
  },
  stampText: {
    fontSize: 6,
    color: '#1a5276',
    textAlign: 'center',
    lineHeight: 1.4,
    paddingHorizontal: 4,
  },
  taxInfo: {
    fontSize: 7,
    color: colors.muted,
    marginBottom: 4,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
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

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  expiryDate?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerTaxId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero ETB only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(n: number): string {
    if (n === 0) return '';
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result.trim();
  }

  const birr = Math.floor(amount);
  const cents = Math.round((amount - birr) * 100);

  let words = '';

  const billions = Math.floor(birr / 1000000000);
  const millions = Math.floor((birr % 1000000000) / 1000000);
  const thousands = Math.floor((birr % 1000000) / 1000);
  const remainder = birr % 1000;

  if (billions > 0) words += convertBelowThousand(billions) + ' Billion ';
  if (millions > 0) words += convertBelowThousand(millions) + ' Million ';
  if (thousands > 0) words += convertBelowThousand(thousands) + ' Thousand ';
  if (remainder > 0) words += convertBelowThousand(remainder);

  words += ' ETB';

  if (cents > 0) {
    words += ' and ' + convertBelowThousand(cents) + ' Cents';
  }

  words += ' only';

  return words;
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <View style={styles.headerRow}>
            <Image src={`${getBaseUrl()}/logo.png`} style={styles.logo} />
            <View style={styles.headerContent}>
              <Text style={styles.companyName}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
              <View style={styles.headerRight}>
                <Text style={styles.docLabel}>Invoice</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.infoValue, { color: colors.headerText, fontSize: 11, fontWeight: 700 }]}>
                    {data.invoiceNumber}
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
            <Text style={styles.infoLabel}>Order Reference</Text>
            <Text style={styles.infoValue}>{data.orderId}</Text>
            <Text style={[styles.infoLabel, { marginTop: 8 }]}>Invoice Date</Text>
            <Text style={styles.infoValue}>{data.date}</Text>
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

        <View style={styles.amountInWords}>
          <Text style={styles.amountLabel}>Amount in Words</Text>
          <Text style={styles.amountText}>{numberToWords(data.total)}</Text>
        </View>

        <View style={styles.vatSection}>
          <View style={styles.vatItem}>
            <View style={data.tax > 0 ? styles.vatBoxChecked : styles.vatBox} />
            <Text style={styles.vatLabel}>VAT Inclusive</Text>
          </View>
          <View style={styles.vatItem}>
            <View style={data.tax === 0 ? styles.vatBoxChecked : styles.vatBox} />
            <Text style={styles.vatLabel}>VAT Exclusive</Text>
          </View>
        </View>

        <View style={styles.stampSection}>
          <View>
            <Text style={{ fontSize: 8, color: '#374151', marginBottom: 2 }}>Prepared by</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 8, color: '#374151', marginTop: 12 }}>Authorized by</Text>
            <View style={[styles.signatureLine, { marginTop: 16 }]} />
          </View>
          <View style={styles.stampPlaceholder}>
            <Text style={styles.stampInner}>ERA MED</Text>
            <Text style={styles.stampText}>Pharmaceutical Wholesale PLC</Text>
            <Text style={{ fontSize: 5, color: '#1a5276', marginTop: 2 }}>● ● ● ● ●</Text>
          </View>
        </View>

        <Text style={styles.taxInfo}>
          VAT Registration No: 1234567890 | This is a computer-generated document, no signature required.
        </Text>

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

export async function generateInvoicePdf(data: InvoiceData): Promise<Blob> {
  const doc = <InvoiceDocument data={data} />;
  const instance = pdf(doc);
  return await instance.toBlob();
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
