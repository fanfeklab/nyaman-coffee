import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Transaction } from '@/store/useTransactionStore';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 5,
  },
  colId: { width: '15%', fontSize: 10 },
  colDate: { width: '25%', fontSize: 10 },
  colCashier: { width: '15%', fontSize: 10 },
  colMethod: { width: '15%', fontSize: 10 },
  colAmount: { width: '15%', fontSize: 10, textAlign: 'right' },
  colStatus: { width: '15%', fontSize: 10, textAlign: 'center' },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});

interface SalesReportPdfProps {
  transactions: Transaction[];
  title: string;
  totalOmzet: number;
}

export const SalesReportPdf = ({ transactions, title, totalOmzet }: SalesReportPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Generated at: {new Date().toLocaleString('id-ID')}</Text>
      </View>
      
      <View style={styles.headerRow}>
        <Text style={styles.colId}>ID</Text>
        <Text style={styles.colDate}>TANGGAL</Text>
        <Text style={styles.colCashier}>KASIR</Text>
        <Text style={styles.colMethod}>METODE</Text>
        <Text style={styles.colAmount}>SUBTOTAL</Text>
        <Text style={styles.colStatus}>STATUS</Text>
      </View>

      {transactions.map(t => (
        <View key={t.id} style={styles.row}>
          <Text style={styles.colId}>{t.id}</Text>
          <Text style={styles.colDate}>{new Date(t.timestamp).toLocaleString('id-ID')}</Text>
          <Text style={styles.colCashier}>{t.cashierId}</Text>
          <Text style={styles.colMethod}>{t.paymentMethod}</Text>
          <Text style={styles.colAmount}>Rp {t.subtotal.toLocaleString('id-ID')}</Text>
          <Text style={styles.colStatus}>{t.status}</Text>
        </View>
      ))}

      <View style={styles.summary}>
        <Text style={styles.summaryText}>TOTAL OMZET (SELESAI): Rp {totalOmzet.toLocaleString('id-ID')}</Text>
      </View>
    </Page>
  </Document>
);
