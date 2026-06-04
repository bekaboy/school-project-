import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface ManifestItem {
  orderId: string;
  customerName: string;
  address: string;
  phone: string;
  driverName: string;
  status: string;
  items: number;
}

interface ManifestData {
  date: string;
  driverName: string;
  deliveries: ManifestItem[];
}

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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#2d5a3d',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    fontSize: 9,
  },
  colOrder: { flex: 1.5 },
  colCustomer: { flex: 2 },
  colAddress: { flex: 2 },
  colPhone: { flex: 1.2 },
  colDriver: { flex: 1.5 },
  colItems: { flex: 0.8, textAlign: 'right' },
  colStatus: { flex: 1, textAlign: 'right' },
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
});

function ManifestDocument({ data }: { data: ManifestData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>ERA MED PHARMACEUTICAL WHOLESALE PLC</Text>
          <Text style={styles.subtitle}>Delivery Manifest / የመላኪያ ዝርዝር</Text>
          <View style={styles.metaRow}>
            <Text>Date: {data.date}</Text>
            <Text>Driver: {data.driverName}</Text>
            <Text>Total Deliveries: {data.deliveries.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colOrder}>Order ID</Text>
            <Text style={styles.colCustomer}>Customer</Text>
            <Text style={styles.colAddress}>Address</Text>
            <Text style={styles.colPhone}>Phone</Text>
            <Text style={styles.colDriver}>Driver</Text>
            <Text style={styles.colItems}>Items</Text>
            <Text style={styles.colStatus}>Status</Text>
          </View>
          {data.deliveries.map((d, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colOrder}>{d.orderId}</Text>
              <Text style={styles.colCustomer}>{d.customerName}</Text>
              <Text style={styles.colAddress}>{d.address}</Text>
              <Text style={styles.colPhone}>{d.phone}</Text>
              <Text style={styles.colDriver}>{d.driverName}</Text>
              <Text style={styles.colItems}>{d.items}</Text>
              <Text style={styles.colStatus}>{d.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Bole Sub-city, Addis Ababa, Ethiopia | Phone: +251 11 123 4567 | Email: info@eramed.com
        </Text>
      </Page>
    </Document>
  );
}

export async function generateDeliveryManifestPdf(data: ManifestData): Promise<Blob> {
  const doc = <ManifestDocument data={data} />;
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
