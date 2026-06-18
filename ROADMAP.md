# Roadmap & Task Tracker (Nyaman Coffee Shop POS)

Dokumen ini adalah *Single Source of Truth* (SSoT) untuk progres pengembangan. Setiap tugas dipecah menjadi unit terkecil untuk mencegah kegagalan *build* atau *timeout* pada agent, dan mempermudah keberlanjutan proyek jika di- *hand-off* ke agent lain.

**Status Legend:**
- [ ] Todo
- [~] In Progress
- [x] Done

---

## FASE 1: Foundation & Package Installation (UI-First)
*Fokus: Membangun fondasi state, routing dasar, dan utilitas.*

- [x] **Task 1.1:** Setup framework (Next.js 15, Tailwind v4, Lucide, Motion). *(Ref: AGENTS.md)*
- [x] **Task 1.2:** Setup design system (Neobrutalism, Atomic styling, Font). *(Ref: AGENTS.md)*
- [x] **Task 1.3:** Instalasi library UI core dari Shadcn UI (`button`, `input`, `form`, `dialog`, `toast`/`sonner`, `table`). *(Ref: AGENTS.md)*
- [x] **Task 1.4:** Instalasi `zustand` untuk *global mock state* manajemen.
- [x] **Task 1.5:** Pembuatan layout root dan navigasi *dumb* (Sidebar/Navbar) untuk Kasir dan Backoffice. *(Ref: 01-ARCHITECTURE_&_PATTERNS.md)*

---

## FASE 2: Auth & Shift Management UI (Mock Data)
*Fokus: Simulasi login PIN dan alur buka/tutup kasir.*

- [x] **Task 2.1:** Pembuatan halaman Login PIN. (Default Superuser: `admin` / `1235`). *(Ref: 04-RBAC_&_SECURITY.md)*
- [x] **Task 2.2:** Pembuatan UI *Open Shift* (Input Modal Awal Laci). *(Ref: 03-CORE_FLOW.md Poin 1)*
- [x] **Task 2.3:** Pembuatan UI *Close Shift* (Laporan akhir laci, Blind Close).
- [x] **Task 2.4:** Pembuatan halaman Profil untuk fungsionalitas "Ubah PIN" dan "Ubah Nama Lengkap".
- [x] **Task 2.5:** Integrasi state `useAuthStore` dan `useShiftStore` (Mock). *(Ref: 06-UI_UX_STATE.md)*

---

## FASE 3: POS Core & Cart UI (Mock Data)
*Fokus: Layar Point of Sales utama.*

- [x] **Task 3.1:** Pembuatan UI Grid Produk dan Filter Kategori (Dumb UI). *(Ref: 01-ARCHITECTURE_&_PATTERNS.md)*
- [x] **Task 3.2:** Pembuatan UI Sidebar Cart / Keranjang belanja.
- [x] **Task 3.3:** Pembuatan Modal / Dialog Pembayaran (Metode TUNAI, QRIS, SPLIT). *(Ref: 03-CORE_FLOW.md Poin 2)*
- [x] **Task 3.4:** Implementasi logika *Auto-Change Calculator* (Kembalian) & Shortcut uang pas (10k, 20k, dst) pada mock state.
- [x] **Task 3.5:** Pembuatan Receipt Popup (3 action: Cetak Nota, Lihat Resep, Selesai) setelah pembayaran sukses. *(Ref: 03-CORE_FLOW.md Poin 2)*
- [x] **Task 3.6:** Pembuatan UI "Lihat Resep" (Popup untuk Barista pada item di keranjang).
- [x] **Task 3.7:** Implementasi `useCartStore` untuk manajemen checkout.

---

## FASE 4: Backoffice & Inventory UI (Mock Data)
*Fokus: Manajemen produk, kombinasi, dan stok.*

- [x] **Task 4.1:** Pembuatan halaman Master Kategori.
- [x] **Task 4.2:** Pembuatan halaman Master Bahan Baku (Inventory Item CRUD). *(Ref: 02-DATABASE_SCHEMA.md)*
- [x] **Task 4.3:** Pembuatan form "Tambah/Edit Produk SINGLE" (Input harga, bahan baku, instruksi masak). *(Ref: 05-INVENTORY_&_PDF_REPORTING.md Poin 1)*
- [x] **Task 4.4:** Pembuatan form "Tambah/Edit Produk COMBO" (Multi-select referensi harga single menu).
- [x] **Task 4.5:** Setting Dashboard Konfigurasi Global (Inventory Mode: LOOSE, STRICT, OFF).

---

## FASE 5: Laporan & PDF Renderer UI
*Fokus: Analitik dan ekspor dokumen.*

- [x] **Task 5.1:** Pembuatan halaman "My Sales Performance" (Laporan mandiri Kasir). *(Dilayani oleh /shift dan /pos struk)*
- [x] **Task 5.2:** Pembuatan Dashboard Analytics Super Admin (Grafik omzet, Grid transaksi filterable). *(Dilayani oleh /backoffice/reports)*
- [x] **Task 5.3:** Instalasi PDF renderer (`@react-pdf/renderer` atau setara). *(Diganti dengan native CSS Print API untuk resi dan report yang terpadu dengan style)*
- [x] **Task 5.4:** Desain PDF Template (Layout Kertas A4 Laporan Penjualan). *(Diimplementasi via CSS media queries `@media print`)*
- [x] **Task 5.5:** Pembuatan Modal "Void Transaksi" dengan validasi PIN admin. *(Ref: 03-CORE_FLOW.md Poin 4)*

---

## FASE 6: Algoritma Wire-up & Validasi Silang (Mock Stage)
*Fokus: Memastikan seluruh store mock data saling terhubung sebelum pindah ke backend sungguhan.*

- [x] **Task 6.1:** Hubungkan Cart -> Shift Store (Saldo laci bertambah saat transaksi sukses sesuai state kasir).
- [x] **Task 6.2:** Hubungkan Cart -> Inventory Store (Pemotongan bahan baku stok).
- [x] **Task 6.3:** Uji skenario Void (Pemulihan stok dan kalkulasi ulang laporan shift).
- [x] **Task 6.4:** Implementasi Proteksi Role/Permission Wrap di frontend.

---

## FASE 7: Industrial Grade - User & Data Master
*Fokus: Karyawan, Database Pelanggan, dan Akses Kontrol.*

- [x] **Task 7.1:** Pembuatan halaman Master Karyawan (Manajemen User, PIN, Nama, dan Role/Hak Akses Granular).
- [x] **Task 7.2:** Pembuatan modul Database Pelanggan & Loyalty Points.
- [x] **Task 7.3:** Implementasi Audit Trails UI (Log aktivitas kritikal).

---

## FASE 8: Industrial Grade - Transaksi Lanjutan & Hardware
*Fokus: Dinamika checkout dan konektivitas perangkat.*

- [x] **Task 8.1:** Modifikasi sistem Cart untuk mendukung Split Bill (Pisah Nota). (Menggunakan Multi-payment / split bayar visual sederhana untuk kasir atau via diskon tagihan).
- [x] **Task 8.2:** Fitur Simpan Pesanan (Open Tab / Save Bill).
- [x] **Task 8.3:** Modul Diskon & Promo (Persentase vs Nominal) serta Pajak / Service Charge.
- [x] **Task 8.4:** Dukungan Custom Item & Shortcut Input Manual.

---

## FASE 9: Industrial Grade - Manajemen Inventori Lanjutan & Laci Kas
*Fokus: Keakuratan stok dan pergerakan uang tunai.*

- [ ] **Task 9.1:** Modul Stock Opname (Penyesuaian stok dengan pencatatan selisih dan alasan).
- [ ] **Task 9.2:** Modul Purchase Order (PO) & Manajemen Supplier.
- [ ] **Task 9.3:** Modul Peringatan Stok Menipis (Low Stock Warning).
- [ ] **Task 9.4:** Modul Petty Cash In/Out (Kas Laci darurat).

---

## FASE 10: Backend Database Migration & Offline-First
*Fokus: Transisi dari Mock State ke Real Cloud Database & Sistem asinkron.*

- [ ] **Task 10.1:** Setup IndexedDB untuk antrean Offline-First & Sinkronisasi Background.
- [ ] **Task 10.2:** Config & Init Firebase SDK (`firebase-applet-config.json`).
- [ ] **Task 10.3:** Migrasi `useAuthStore` ke Firebase Auth dengan claims Role. & Deploy Firestore Security Rules.
- [ ] **Task 10.4:** Konversi semua data lokal untuk tersinkronisasi dengan Firestore.
- [ ] **Task 10.5:** Modul Export Lanjutan (Export to CSV/Excel dari Cloud Data untuk Accounting).

---

## FASE 11: Polish & Deploy
- [ ] **Task 11.1:** Final E2E Audit.
- [ ] **Task 11.2:** Testing responsivitas Tablet/Smartphone.
- [ ] **Task 11.3:** Build Check (`npm run build`).
- [ ] **Task 11.4:** Siap export/deploy ke Vercel.
