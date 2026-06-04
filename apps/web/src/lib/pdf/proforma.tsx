import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a5f',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#2d5a3d',
    marginBottom: 4,
  },
  proformaLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  section: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#9ca3af',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    marginTop: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  totalsSection: {
    marginLeft: 'auto',
    width: '40%',
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  terms: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#374151',
  },
  termsText: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.5,
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
        <View style={styles.header}>
          <Text style={styles.title}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
          <Text style={styles.subtitle}>በኢራ ሜድ ፋርማሲዩቲካል ኅብረት ሥርዓት የጅምላ ሽያጭ ኃላፊነቱ የተወሰነ የግል ማኅበር</Text>
          <Text style={styles.proformaLabel}>PROFORMA INVOICE / ቅድመ ክፍያ ደረሰኝ</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Order No</Text>
            <Text style={styles.value}>{data.orderId}</Text>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{data.customerName}</Text>
            <Text style={styles.value}>{data.customerAddress}</Text>
            <Text style={styles.value}>{data.customerPhone}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Sales Rep</Text>
            <Text style={styles.value}>{data.salesRep}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description / መግለጫ</Text>
            <Text style={styles.colQty}>Qty / ብዛት</Text>
            <Text style={styles.colPrice}>Price / ዋጋ</Text>
            <Text style={styles.colTotal}>Total / ድምር</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{format(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{format(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal / ድምር</Text>
            <Text>{format(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT / ተ.እ.ታ</Text>
            <Text>{format(data.tax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total / ጠቅላላ</Text>
            <Text>{format(data.total)}</Text>
          </View>
        </View>

        <View style={styles.terms}>
          <Text style={styles.termsTitle}>Terms & Conditions / ውሎች እና ቅድመ ሁኔታዎች</Text>
          <Text style={styles.termsText}>
            This is a proforma invoice. Payment must be completed within 15 days of the proforma date for the quoted prices to remain valid.
            {'\n'}
            ይህ ቅድመ ክፍያ ደረሰኝ ነው። ዋጋዎች ልክ እንዲሆኑ ክፍያው ከዚህ ደረሰኝ ቀን ጀምሮ በ15 ቀናት ውስጥ መከፈል አለበት።
          </Text>
        </View>

        <Text style={styles.footer}>
          Bole Sub-city, Addis Ababa, Ethiopia | Phone: +251 11 123 4567 | Email: info@eramed.com
          {'\n'}
          ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ
        </Text>
      </Page>
    </Document>
  );
}

function format(amount: number): string {
  return `${amount.toFixed(2)} ETB`;
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
  a.click();
  URL.revokeObjectURL(url);
}
