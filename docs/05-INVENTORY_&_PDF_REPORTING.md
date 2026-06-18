# Manajemen Resep, Menu Kombinasi & PDF Reports

## 1. Arsitektur Produk Single vs Produk Kombinasi (Paket)
Di dalam layar admin, proses pembuatan produk dinamis:
- **Pilih Tipe Produk**: Admin pertama memilih dropdown "Tipe Item" -> [SINGLE] atau [COMBO/PAKET]

**Jika SINGLE:**
- Memiliki harga.
- Memiliki varian ukuran/rasa.
- Admin men-select Bahan Baku (Inventory) yang ditarik untuk recipe. Misal: 1 sachet gula, 18 gram kopi bubuk.
- Memiliki Text Area: "Instruksi Masak".

**Jika COMBO/PAKET:**
- Dropdown bahan baku disembunyikan.
- Muncul multi-select bertuliskan "Pilih Menu Single untuk Dikombinasikan".
- Di sebelah tiap checkbox (Daftar Menu Single), **Sistem wajib merender harga asli Single Menu** sebagai UI UX helper agar admin mudah menjumlah HPP saat ingin mem-banderol harga paket.
- Saat produk Kombinasi di checkout pada layar POS, logika inventori akan me-lookup referensi id single-menu di dalamnya, dan memanggil UseCase pemotongan stok milik single-menu secara *chain reaction* berjalan.

## 2. Sistem Rendering Dokumen PDF (Laporan)
Kebutuhan: Print (berupa Nota) dan Laporan Berupa Dokumen A4 (PDF).

**Strategi Rendering Output (Client-Side Rendering)**:
- Kami menggunakan arsitektur *Client-Side PDF generation*. Ini artinya browser device kasir / owner akan merakit langsung layout A4 (Grid dan Table) tanpa butuh server Cloud Function.
- **Workflow Detail**:
  1. User/Admin masuk halaman Laporan.
  2. Set Filter Date, Filter Method QRIS, dsb. Data ditampilkan berupa Chart/Grid Summary di Screen.
  3. User menekan aksi "Download as PDF".
  4. Aplikasi mengirim data grid (JSON) saat ini kepada library engine PDF (`@react-pdf/renderer` atau `jspdf`+`autotable`).
  5. Layouting dikonversi menjadi layout kertas format "Portrait A4/A5", di-inject Logo Cafe (dari setting), disisipkan baris Tabel rapi.
  6. File ter-download langsung di browser pengguna secara instant (`laporan-penjualan-tgl-x.pdf`).

Kelebihan: 
- Tidak ada delay jaringan (loading api cetak pdf 0 detik).
- Template layout kertas yang 100% berbeda secara struktur jika dibandingkan tampilan Dashboard UI di layar (Layout Web tidak tercetak/ikut tersulap, PDF memiliki template spesifik pelaporan standar akunting/manajemen).
