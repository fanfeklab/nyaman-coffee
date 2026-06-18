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

- [x] **Task 5.1:** Pembuatan halaman "My Sales Performance" (Laporan mandiri Kasir). *(Ref: 03-CORE_FLOW.md Poin 3)*
- [x] **Task 5.2:** Pembuatan Dashboard Analytics Super Admin (Grafik omzet, Grid transaksi filterable).
- [x] **Task 5.3:** Instalasi PDF renderer (`@react-pdf/renderer` atau setara). *(Ref: 05-INVENTORY_&_PDF_REPORTING.md Poin 2)*
- [x] **Task 5.4:** Desain PDF Template (Layout Kertas A4 Laporan Penjualan).
- [x] **Task 5.5:** Pembuatan Modal "Void Transaksi" dengan validasi PIN admin. *(Ref: 03-CORE_FLOW.md Poin 4)*

---

## FASE 6: Algoritma Wire-up & Validasi Silang (Mock Stage)
*Fokus: Memastikan seluruh store mock data saling terhubung sebelum pindah ke backend sungguhan.*

- [x] **Task 6.1:** Hubungkan Cart -> Shift Store (Saldo laci bertambah saat transaksi sukses sesuai state kasir).
- [x] **Task 6.2:** Hubungkan Cart -> Inventory Store (Pemotongan bahan baku stok).
- [x] **Task 6.3:** Uji skenario Void (Pemulihan stok dan kalkulasi ulang laporan shift).
- [x] **Task 6.4:** Implementasi Proteksi Role/Permission Wrap di frontend.

---

## FASE 7: Firebase Backend Migration
*Fokus: Transisi dari Mock State ke Real Cloud Database Firestore & Firebase Auth.*

- [ ] **Task 7.1:** Config & Init Firebase SDK (`firebase-applet-config.json`).
- [ ] **Task 7.2:** Migrasi `useAuthStore` ke Firebase Auth (Email/Phone) & custom user claims untuk Role.
- [ ] **Task 7.3:** Generate & Deploy Firestore Security Rules.
- [ ] **Task 7.4:** Konversi `useShiftStore` CRUD ke Firestore Query Layer.
- [ ] **Task 7.5:** Konversi `useInventoryStore` & `useProductStore` CRUD ke Firestore.
- [ ] **Task 7.6:** Konversi `useCartStore` checkout ke Firestore Batch Writes/Transactions (Atomicity).

---

## FASE 8: Polish & Deploy
- [ ] **Task 8.1:** Final E2E Audit.
- [ ] **Task 8.2:** Testing responsivitas Tablet/Smartphone.
- [ ] **Task 8.3:** Build Check (`npm run build`).
- [ ] **Task 8.4:** Siap export/deploy ke Vercel.
