# Fitur Inti & Alur Kerja (Core Features & Flow)

## 1. Manajemen Shift (Buka / Tutup Kasir)
Untuk menjawab pertanyaan tentang laci/cash in hand:
Praktik terbaik dalam POS modern untuk mencegah kecurangan adalah **"Reset Laci / Setoran" (Cash Drop)** pada setiap pergantian shift.
- **Open Shift**: Shift Pagi (Kasir A) login, menginput "Modal Laci Awal" (contoh: Rp 50.000). Nominal ini dihitung fisik.
- **Transaksi Berjalan**: Sistem melacak semua penerimaan secara tunai & non-tunai.
- **Close Shift**: Di akhir shift, Kasir A melakukan tutup kasir. Sistem menunjukkan bahwa seharusnya ada Rp 150.000 tunai (50k modal + 100k penjualan tunai). Kasir A menghitung fisik uangnya (misal ada 150k). Kasir submit, shift ditutup. 
- Uang tersebut disetorkan (Cash Drop) ke brankas/owner. 
- Saat Shift Sore (Kasir B) masuk, Kasir B **melakukan Open Shift baru** dan input Modal awal lagi dari tas operasional / brankas kecil. Jadi **tidak ada** sisa sistem operasi gantung antar orang. Semuanya clear dan dipertanggungjawabkan per-orang/shift.

## 2. Sistem POS & Pembayaran
- **Cart System**: Menambahkan item, mengurangi, mengubah jumlah produk.
- **Checkout & Payment**:
  - Pilihan metode: TUNAI, QRIS.
  - **Split Payment**: Bisa dipisah. (Contoh total tagihan 100k. Kustomer bayar QRIS 50k, sisa 50k dibayar TUNAI uang pas).
  - **Shortcut Pecahan Cash**: Di area bayar cepat (Tunai), terdapat tombol shortcut nominal: Rp 10.000, Rp 20.000, Rp 50.000, Rp 100.000, dan tombol "Uang Pas".
  - Kalkulasi *Kembalian (Change)* dihitung secara real-time.

## 3. Void (Batal Nota/Transaksi)
- Menghapus transaksi yang terlanjur terbit.
- Alur: Kasir menekan batal -> Sistem meminta PIN Manager/Super Admin. Saat PIN divalidasi, status struk berubah menjadi `VOID` (Data tidak dihapus dari DB untuk menjaga jejak audit, tapi total penjualan dikurangkan dari report berjalan). Semua stok bahan baku dikembalikan (void items).

## 4. Report & Analytics
- Grafik Penjualan (Pemasukan vs waktu).
- Laporan Shift (Export per Kasir).
- Filter data berdasarkan tanggal, metode pembayaran, kasir.
- Top selling product dashboard.
