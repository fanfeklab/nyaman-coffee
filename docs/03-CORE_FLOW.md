# Fitur Inti & Alur Kerja (Core Features & Flow)

## 1. Manajemen Shift (Sistem Laci Ketat & Anti-Bentrok)
- **Shift Locking**: Sistem membaca endpoint/perangkat. Hanya diperbolehkan satu shift Open per-kasir. Jika ada kasir lain mencoba Open Shift di perangkat yang belum ditutup sesinya, sistem akan memblokir ("Tutup sesi sebelumnya untuk melanjutkan").
- **Force End Shift**: Ada kalanya kasir lupa tutup kasir (pulang) atau tablet error. Super Admin/Owner bisa melakukan "Force End Sesi" dari portal Backoffice untuk me-release perangkat. Status dokumen shift akan ditandai sbg `FORCED_CLOSED`.
- **Cash Drop & Setoran**: Shift pagi input Modal Laci (misal Rp 50.000). Saat shift ditutup, akan direkap sistem (Rp 50.000 modal + Tunai masuk). Shift yang baru harus membuat Modal Laci baru (tidak membawa sisa gantung).

## 2. Sistem Pembayaran & Antarmuka Kasir (POS)
Proses checkout didesain meminimalisir klik (High-Efficiency UI).
1. **Pilih Payment Mode**: Kasir menekan checkout, lalu pilih TUNAI, QRIS, atau SPLIT.
2. **Jika TUNAI (Auto-Change Calculator)**: 
   - Terdapat tombol nominal cepat (UANG PAS, Rp 10.000, Rp 20.000, Rp 50.000, Rp 100.000).
   - Saat kasir input nilai tunai yang diterima, sistem me-render angka **Kembalian (Change)** secara instan.
3. **Jika QRIS**:
   - Sistem wajib memunculkan input field untuk `No. Referensi / Ref ID`. Tombol "Proses" disable sampai No Ref diisi, mencegah kasir lupa memvalidasi sukses pembayaran dari pembeli.
4. **Proses & Validasi**:
   - Menekan "Proses", data dikirim ke lokal memori lalu ke cloud Firebase (jika online). 
5. **Pop-up Pasca Transaksi (Receipt Popup)**:
   - Terdiri dari total ringkasan dan 3 Action Button:
     *   `[1] Cetak Nota` -> Menyambung ke Thermal Printer (Bluetooth/ESC POS).
     *   `[2] Lihat Resep` -> Popup memunculkan "Data Instruksi Masak / Recipe" KHUSUS untuk item yang sedang diproses di struk ini saja. Sangat membantu barista pemula.
     *   `[3] Selesai` -> Menutup window dan mereset keranjang POS.

## 3. Laporan Kasir Mandiri
Bukan cuma Admin yang butuh laporan.
- **My Sales Performance**: Kasir bisa melihat hasil kerja/penjualan khusus akun miliknya sendiri. 
- **Default View**: *Hari Ini (Today)*.
- **Fitur Ekstra Kasir**: Kasir juga bisa melakukan *search, filter* metode bayar (pada transaksinya sendiri) sama halnya admin, agar bisa melakukan *self-audit* jika dirasa saldo laci kurang/lebih pada saat cross-check akhir hari.

## 4. Void (Batal Nota/Transaksi)
- Menghapus transaksi yang terlanjur terbit.
- Alur: Kasir menekan batal -> Sistem meminta PIN Manager/Super Admin. Saat PIN divalidasi, status struk berubah menjadi `VOID`.
- Stok bahan baku akan otomatis dikembalikan (void items decrement reversal). Pendapatan pada grafik laporan akan dikurangi.

## 5. Fleksibilitas Fitur (Modular Flow)
- Sistem harus men-support operasional meskipun admin belum sempat set-up raw material (bahan baku).
- Melalui table `store_settings`, "Inventory Mode" menentukan cara kerja kasir: `OFF`, `LOOSE`, `STRICT`.
