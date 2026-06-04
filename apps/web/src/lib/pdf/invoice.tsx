import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const green = '#1a6b3c';
const maroon = '#7b1f1f';
const stampBlue = '#1a5276';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: green,
    paddingBottom: 12,
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: green,
  },
  companyNameAm: {
    fontSize: 9,
    color: maroon,
    marginTop: 2,
  },
  titleSection: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: maroon,
  },
  invoiceTitleAm: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  invoiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f8f5f0',
    borderRadius: 4,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    marginBottom: 4,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: green,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  colNum: { width: '8%' },
  colDesc: { width: '42%' },
  colQty: { width: '15%', textAlign: 'right' },
  colPrice: { width: '17%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  totalsBox: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  totalRowLabel: {
    fontSize: 9,
    color: '#374151',
  },
  totalRowValue: {
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: green,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  amountInWords: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    backgroundColor: '#f8f5f0',
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: maroon,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  vatSection: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
  },
  stampSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    borderColor: stampBlue,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7fc',
  },
  stampText: {
    fontSize: 6,
    color: stampBlue,
    textAlign: 'center',
    lineHeight: 1.4,
    paddingHorizontal: 4,
  },
  stampInner: {
    fontSize: 7,
    fontWeight: 'bold',
    color: stampBlue,
    textAlign: 'center',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 2,
    borderTopColor: maroon,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#6b7280',
  },
  taxInfo: {
    fontSize: 7,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
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

function numberToWordsEthiopian(amount: number): string {
  if (amount === 0) return 'Zero ETB only / ዜሮ ብር ብቻ';

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
    words += ` and ${convertBelowThousand(cents)} Cents`;
  }

  words += ' only';

  return words;
}

function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
            <Text style={styles.companyNameAm}>የኢራ ሜድ ፋርማሲዩቲካል ኅብረት ሥርዓት የጅምላ ሽያጭ ኃላፊነቱ የተወሰነ የግል ማኅበር</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceTitleAm}>ደረሰኝ / ኢንቮይስ</Text>
          </View>
        </View>

        <View style={styles.invoiceMeta}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Invoice No</Text>
            <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            <Text style={styles.metaLabel}>Order No</Text>
            <Text style={styles.metaValue}>{data.orderId}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Date / ቀን</Text>
            <Text style={styles.metaValue}>{data.date}</Text>
            <Text style={styles.metaLabel}>Tax ID / ተ.እ.ታ ቁጥር</Text>
            <Text style={styles.metaValue}>{data.customerTaxId || '—'}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Customer / ደንበኛ</Text>
            <Text style={styles.metaValue}>{data.customerName}</Text>
            <Text style={styles.metaValue}>{data.customerAddress}</Text>
            <Text style={styles.metaValue}>{data.customerPhone}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description / መግለጫ</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty / ብዛት</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price / ዋጋ</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total / ድምር</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={i}>
              <Text style={[styles.colNum, { fontSize: 8 }]}>{i + 1}</Text>
              <Text style={[styles.colDesc, { fontSize: 8 }]}>{item.description}</Text>
              <Text style={[styles.colQty, { fontSize: 8 }]}>{item.quantity}</Text>
              <Text style={[styles.colPrice, { fontSize: 8 }]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.colTotal, { fontSize: 8 }]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Subtotal / ድምር</Text>
              <Text style={styles.totalRowValue}>{fmt(data.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>VAT (15%) / ተ.እ.ታ (15%)</Text>
              <Text style={styles.totalRowValue}>{fmt(data.tax)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total / ጠቅላላ</Text>
              <Text style={styles.grandTotalValue}>{fmt(data.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.amountInWords}>
          <Text style={styles.amountLabel}>Amount in Words / በፊደል የተጻፈ መጠን</Text>
          <Text style={styles.amountText}>{numberToWordsEthiopian(data.total)}</Text>
        </View>

        <View style={styles.vatSection}>
          <View style={styles.vatItem}>
            <View style={data.tax > 0 ? styles.vatBoxChecked : styles.vatBox} />
            <Text style={styles.vatLabel}>VAT Inclusive / ተ.እ.ታ ጨምሮ</Text>
          </View>
          <View style={styles.vatItem}>
            <View style={data.tax === 0 ? styles.vatBoxChecked : styles.vatBox} />
            <Text style={styles.vatLabel}>VAT Exclusive / ተ.እ.ታ ሳይጨምር</Text>
          </View>
        </View>

        <View style={styles.stampSection}>
          <View>
            <Text style={{ fontSize: 8, color: '#374151', marginBottom: 2 }}>Prepared by / አዘጋጅ</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 8, color: '#374151', marginTop: 2 }}>Authorized by / ያፀደቀው</Text>
            <View style={[styles.signatureLine, { marginTop: 20 }]} />
          </View>
          <View style={styles.stampPlaceholder}>
            <Text style={styles.stampInner}>ERA MED</Text>
            <Text style={styles.stampText}>Pharmaceutical Wholesale PLC</Text>
            <Text style={{ fontSize: 5, color: stampBlue, marginTop: 2 }}>● ● ● ● ●</Text>
          </View>
        </View>

        <Text style={styles.taxInfo}>
          VAT Registration No: 1234567890 | This is a computer-generated document, no signature required.
          {'\n'}
          የተ.እ.ታ መለያ ቁጥር፡ 1234567890 | ይህ በኮምፒውተር የተዘጋጀ ሰነድ ነው፣ ፊርማ አያስፈልገውም።
        </Text>

        <Text style={styles.footer}>
          <Text>Bole Sub-city, Addis Ababa, Ethiopia | +251 11 123 4567 | info@eramed.com</Text>
          <Text>ቦሌ ክፍለ ከተማ፣ አዲስ አበባ፣ ኢትዮጵያ</Text>
        </Text>
      </Page>
    </Document>
  );
}

function fmt(amount: number): string {
  return `${amount.toFixed(2)} ETB`;
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
  a.click();
  URL.revokeObjectURL(url);
}
