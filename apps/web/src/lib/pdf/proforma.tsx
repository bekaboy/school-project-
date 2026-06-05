import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

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
    paddingTop: 28,
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.headerText,
    letterSpacing: 1,
  },
  companyNameAm: {
    fontSize: 10,
    color: '#a3b8a8',
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  docLabelAm: {
    fontSize: 8,
    color: '#a3b8a8',
    marginTop: 1,
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
    marginBottom: 4,
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
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: 'right' },
  colPrice: { flex: 1.2, textAlign: 'right' },
  colTotal: { flex: 1.2, textAlign: 'right' },
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
    bottom: 120,
    right: 48,
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: '#2563eb',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  stampText: {
    fontSize: 8,
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
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#e5e0d8',
    paddingTop: 8,
    fontSize: 7,
    color: colors.muted,
    textAlign: 'center',
  },
});

interface ProformaItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ProformaData {
  orderId: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  salesRep: string;
  items: ProformaItem[];
  subtotal: number;
  tax: number;
  total: number;
}

function ProformaDocument({ data }: { data: ProformaData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.companyName}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
          <Text style={styles.companyNameAm}>የኢራ ሜድ ፋርማሲዩቲካል ጅምላ ሽያጭ ኃላፊነቱ የተወሰነ የግል ማኅበር</Text>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.docLabel}>Proforma Invoice</Text>
              <Text style={styles.docLabelAm}>ቅድመ ክፍያ ደረሰኝ</Text>
            </View>
            <View>
              <Text style={[styles.infoValue, { color: colors.headerText, fontSize: 11, fontWeight: 700, textAlign: 'right' }]}>
                {data.orderId}
              </Text>
              <Text style={[styles.infoValue, { color: '#a3b8a8', fontSize: 8, textAlign: 'right' }]}>
                {data.date}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Bill To / ለተገልጋዩ</Text>
            <Text style={styles.infoValue}>{data.customerName}</Text>
            <Text style={styles.infoValue}>{data.customerAddress}</Text>
            <Text style={styles.infoValue}>{data.customerPhone}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Sales Rep / ሻጭ</Text>
            <Text style={styles.infoValue}>{data.salesRep}</Text>
            <Text style={styles.infoLabel}>Payment Terms / የክፍያ ሁኔታ</Text>
            <Text style={styles.infoValue}>Due within 15 days / በ15 ቀናት ውስጥ</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description / መግለጫ</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty / ብዛት</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price / የአንዱ ዋጋ</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total / ድምር</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{fmt(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={[styles.totalRow, styles.totalBorder]}>
            <Text>Subtotal / ድምር</Text>
            <Text>{fmt(data.subtotal)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalBorder]}>
            <Text>VAT (15%) / ተ.እ.ታ (15%)</Text>
            <Text>{fmt(data.tax)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>Total Due / ጠቅላላ ክፍያ</Text>
            <Text style={styles.grandTotalText}>{fmt(data.total)}</Text>
          </View>
        </View>

        <View style={styles.stampContainer}>
          <Text style={styles.stampText}>PAID</Text>
          <Text style={[styles.stampText, { fontSize: 6 }]}>———</Text>
          <Text style={[styles.stampText, { fontSize: 6 }]}>ERA MED</Text>
          <Text style={[styles.stampText, { fontSize: 6 }]}>PHARMACEUTICAL</Text>
        </View>

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Terms & Conditions / ውሎች እና ቅድመ ሁኔታዎች</Text>
          <Text style={styles.termsText}>
            This proforma invoice is valid for 15 days from the date above. Payment must be completed before delivery.
            {'\n'}
            ይህ ቅድመ ክፍያ ደረሰኝ ከላይ ከተጠቀሰው ቀን ጀምሮ ለ15 ቀናት የሚሰራ ነው። ክፍያው ከመከፈሉ በፊት አቅርቦት አይደረግም።
          </Text>
        </View>

        <Text style={styles.footer}>
          Bole Sub-city, Addis Ababa, Ethiopia | Tel: +251 11 123 4567 | Email: info@eramed.com
          {'\n'}
          ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ
        </Text>
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
