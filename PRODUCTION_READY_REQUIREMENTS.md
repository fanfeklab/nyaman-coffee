# Kebutuhan Industrial Grade "Production-Ready" POS

Berdasarkan tinjauan atas fungsionalitas aplikasi Point of Sales (POS) saat ini, meskipun fitur inti (pembayaran, shift dasar, inventori dasar) sudah tersedia secara mock, sistem belum dapat diklasifikasikan sebagai POS tingkat industri (Industrial Grade/Production Ready). 

Agar sistem layak pakai secara operasional skala penuh dan siap rilis ke pasaran (Production-Ready), dokumen ini menjabarkan seluruh fitur esensial yang WAJIB diimplementasikan.

## 1. User & Role Management (Manajemen Karyawan)
Saat ini sistem hanya melakukan hard-code login admin. Dibutuhkan antarmuka administrasi lengkap untuk manajemen pengguna.
- **Data Master Karyawan:** CRUD (Create, Read, Update, Delete) karyawan, termasuk pendaftaran PIN, Nama, dan Kontak.
- **Granular Role-Based Access Control (RBAC):** Tidak hanya superadmin dan kasir, tapi akses permission yang spesifik. Misalnya: hak akses untuk melakukan *Void*, hak akses modifikasi *Harga*, hak akses *Stock Opname*.
- **Audit Trails (Log Aktivitas):** Perekaman otomatis setiap aksi kritikal yang dilakukan oleh user (misal: "Admin X mengubah harga Kopi Y dari 15000 menjadi 25000 pada tanggal Z") untuk mencegah fraud.

## 2. Advanced Reporting & Analytics (Laporan Lanjutan)
Pelaporan yang tersedia saat ini sangat mendasar. Bisnis F&B membutuhkan detail laporan keuangan.
- **Export to CSV / Excel / PDF:** Laporan wajib bisa diekspor untuk dimasukkan ke software akuntansi eksternal (Accurate, Jurnal, dll).
- **Laporan Laba Rugi (COGS / HPP):** Kalkulasi harga pokok penjualan (HPP) berdasarkan Harga Beli Bahan Baku dibandingkan dengan Harga Jual, untuk melihat gross profit secara otomatis.
- **Top & Least Selling Items:** Laporan statistik produk mana yang paling laku dan paling tidak laku.
- **Rekap Metode Pembayaran (Settlement):** Pencocokan data QRIS, Debit, Kredit, Cash, Ojek Online, dll untuk persiapan rekonsiliasi bank di akhir hari.
- **Pajak (PB1 / PPN) & Service Charge:** Dukungan untuk menambahkan komponen Pajak (misal 11%) dan Service Charge ke dalam total penjualan dan laporannya.

## 3. Advanced Inventory Management (Manajemen Inventaris Lanjutan)
Pemotongan stok saat ini hanya dilakukan per penjualan (FIFO sederhana). Dibutuhkan fitur tata laksana inventori lengkap.
- **Stock Opname (Penyesuaian Stok):** Fitur untuk mencocokkan stok fisik di gudang/toko dengan sistem. Harus ada pencatatan 'Selisih' dan alasan (misal: "Basi", "Tumpah", "Salah Hitung").
- **PO (Purchase Order) & Supplier Management:** Modul untuk mencatat pembelian / restock bahan baku dari supplier, dan otomatis menambah jumlah inventori sekaligus mencatat pengeluaran uang kas.
- **Alert Stok Menipis (Low Stock Warning):** Notifikasi di dashboard jika ada bahan baku yang berada di bawah 'Minimum Stock Level'.

## 4. Advanced Transaction & Checkout (Transaksi Lanjutan)
Skenario di lapangan kasir sangat dinamis.
- **Split Bill (Pisah Nota):** Pelanggan seringkali ingin membagi tagihan menjadi beberapa bagian (bayar masing-masing).
- **Simpan Pesanan (Save Bill / Open Tab):** Kasir harus bisa menyimpan pesanan pelanggan tanpa langsung membayar (misalnya pelanggan duduk dulu, atau pending karena mau nambah antrean).
- **Diskon & Promo:** Mendukung dua tipe diskon: Diskon Persentase (%) dan Diskon Nominal (Rp), baik diterapkan per item pesanan maupun per total tagihan.
- **Input Manual (Custom Item):** Kemampuan kasir menambah item non-katalog secara cepat jika ada penyesuaian khusus (atas izin manajer).

## 5. Customer & Loyalty (CRM)
- **Database Pelanggan:** Pendaftaran identitas nama dan nomor telepon (Opsional saat checkout).
- **Loyalty Points:** Menghitung sistem poin bagi member (misalnya setiap 10.000 dapat 1 poin), dan dapat ditukar dengan menu tertentu.
- **Member Tiering:** Dukungan harga berbeda (misal harga khusus reseller/member).

## 6. Cash & Drawer Management (Manajemen Laci Kas)
Pergerakan uang kas fisik (Cash) tidak hanya terjadi saat pelanggan membayar.
- **Petty Cash In/Out (Kas Keluar/Masuk Kasir):** Fitur bagi kasir untuk mengambil uang kas dari laci (misal: beli es batu dadakan ke warung) atau setor kas tambahan, yang akan direkam dan divalidasi ke laporan tutup shift.
- **Blind Closing:** Saat kasir tutup shift, mereka harus mengetik mundur hitungan fisik uang tanpa melihat harapan saldo dari sistem, untuk mencegah manipulasi. Selisih (Discrepancy) akan dilaporkan ke manajer.

## 7. Hardware Integration (Integrasi Perangkat Keras)
POS nyata tidak sekadar web browser, melainkan harus terhubung dengan periferal kasir secara seamless.
- **Thermal Printer ESC/POS:** Optimasi pencetakan nota/struk langsung ke printer bluetooth/USB/LAN tanpa menampilkan popup pratinjau browser (silent printing jika memungkinkan).
- **Cash Drawer Kick (RJ11):** Mengirim *trigger* lewat printer untuk otomatis 'menendang' buka laci kas setiap ada pembayaran 'TUNAI'.
- **Barcode Scanner:** Input fokus otomatis jika ada pembacaan kode ISBN/SKU dari scanner untuk mempercepat pencarian barang ritel pendamping.

## 8. Offline-First Support (Keandalan Koneksi)
Sistem kasir tidak boleh berhenti berfungsi jika internet toko mati.
- **Local Database (IndexedDB / SQLite):** Sistem menggunakan antrean asinkron (queue). Transaksi disimpan sementara di mesin kasir secara aman.
- **Background Sync:** Sinkronisasi otomatis ke Cloud (Firebase / Server) segera setelah internet pulih, tanpa memblokir antrean kasir.

## Kesimpulan & Action Plan
Jika Anda (sebagai *Project Owner*) setuju dengan rancangan **Level Produksi (Industrial Grade)** di atas, mari kita tambahkan ke dalam `ROADMAP.md` pada **FASE BARU**. 

Saat ini, instruksi pengembangan terbatas pada penyelesaian mock MVP. Jika kita beralih ke mode *Production-Ready*, saya akan memulai dari pembenahan fundamental *User Management* dan *Inventory Opname* sebelum migrasi ke Backend Firebase. 

Menunggu persetujuan Anda apakah spesifikasi detail ini sudah mencakup kebutuhan, dan apakah saya boleh memodifikasi `ROADMAP.md` kita untuk mengeksekusinya.
