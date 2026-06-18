# Manajemen State & UX Feedback

## 1. Global State Management (Zustand)
Dalam fase Sandbox (serta akan menjadi jembatan untuk production API nanti), kita menggunakan **Zustand**. Keunggulannya adalah ringan, performa tinggi, dan mudah mengelola local-first behavior.

State yang akan dikelola di Zustand (Kumpulan Store):
1. **`useAuthStore`**: Menyimpan data kasir/admin yang sedang login (simulation mode), role, dan permission list.
2. **`useShiftStore`**: Melacak status laci (open/close), waktu mulai, modal awal, nilai laci, dan perhitungan blind close.
3. **`useCartStore`**: Logika POS (Keranjang belanja). Menambahkan item, update qty, hapus item, hitung subtotal, diskon (jika ada), kalkulasi total kembalian (Change), dan fungsi hold/void cart.
4. **`useInventoryStore`** (Mock): Berisi fungsi CRUD simulasi untuk Produk, Kategori, dan Bahan Baku.

## 2. UX Feedback & Modals (Continuous Awareness)
User di POS atau sistem Point of Sales beroperasi di keramaian dan tekanan tinggi. Error handling dan user awareness adalah prioritas mutlak. Oleh karena itu:

1. **Aksi Destruktif (Butuh Konfirmasi)**:
   - Menghapus keranjang total (Clear Cart) -> *Are you sure?*
   - Void Transaksi Terakhir -> *Proses Batal Nota membutuhkan PIN Manager.*
   - Tutup Shift -> *Laci dikunci. Apakah uang tunai fisik sudah sesuai?*
   - Menghapus Inventori / Kategori -> *Semua produk yang terkait akan terpengaruh. Lanjutkan?*

2. **Aksi Berhasil (Success Modal / Toast)**:
   - Transaksi Sukses -> *Popup Success + Muncul opsi Cetak Nota, Lihat Resep, Selesai.*
   - Tambah Produk -> Toast *"Produk Ice Americano berhasil ditambah."*

3. **Error & Pencegahan (Error/Alert Modals)**:
   - Bayar Kurang (di layat Cart tunai) -> Tombol Proses Transaksi akan disabled, jika input tidak sinkron akan muncul notif *"Pembayaran Kurang"*.
   - Shift bentrok -> *"Perangkat sedang dipakai. Selesaikan shift sebelumnya."*
   - Referensi QRIS kosong -> *"Mohon isi nomor referensi QRIS pengguna."*

## 3. Komponen Utama
Sistem ini secara meluas akan mengkombinasikan package (tidak custom from scratch):
- `shadcn/ui dialog` -> Untuk Pop-up Confirm, Modal Input Modal Awal/Laci.
- `shadcn/ui sonner / toast` -> Sebagai pengingat alert aksi sukses & error yang tidak memblokir antarmuka.
- `lucide-react` -> Sesuai mandat, sebagai icon base. 
