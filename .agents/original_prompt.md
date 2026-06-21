## 2026-06-21T04:40:31Z

Sistem POS tunggal yang sangat optimal (standalone) untuk satu kedai kopi berkapasitas tinggi, berstandar industri dengan UI/UX Neobrutalism yang rapi dan terstruktur.

Working directory: /home/nara_events/Workspace/Project/nyaman-coffee
Integrity mode: development

## Requirements

### R1. Offline-First Architecture
Sistem harus menggunakan arsitektur local-first. Kasir harus tetap bisa memproses pesanan 100% lancar walau tanpa koneksi internet. Sinkronisasi data ke Supabase terjadi di latar belakang secara otomatis ketika koneksi kembali online.

### R2. Comprehensive System Audit & Roadmap
Melakukan audit menyeluruh terhadap UI/UX, user flow, state management, skema database, dan keamanan (RBAC). Menghasilkan dokumen cetak biru (roadmap) teknis untuk menjadikannya standar industri (Enterprise Grade) untuk F&B di Indonesia.

### R3. Authentication & Database Strategy
Merancang dan mengimplementasikan solusi integrasi Supabase Auth yang kompatibel dengan skenario offline-first (misal: penanganan token saat offline, sinkronisasi antrean mutasi data).

## Acceptance Criteria

### Verifikasi Kode (Proof of Concept)
- [ ] Terdapat implementasi Proof-of-Concept (PoC) untuk sistem antrean (queue) sinkronisasi offline-first.
- [ ] PoC tersebut dibuktikan dengan *automated tests* yang menyimulasikan transisi online/offline dan keberhasilan sinkronisasi data tanpa konflik.

### Verifikasi Dokumen
- [ ] Terdapat dokumen `AUDIT_AND_ROADMAP.md` yang memuat hasil audit UI/UX, alur navigasi, keamanan RBAC, dan skema database relasional.
- [ ] Roadmap mencakup langkah-langkah konkret migrasi ke Supabase Auth dengan mempertahankan pengalaman kasir yang sangat cepat (tanpa delay jaringan).

## 2026-06-21T05:10:34Z

Melakukan *overhaul* (perombakan total) pada seluruh UI/UX, page layout, flex/grid system, cards, dan komponen lainnya di aplikasi POS Nyaman Coffee. Tujuannya adalah untuk mencapai konsistensi desain Neobrutalism kelas *Enterprise* dengan mengimplementasikan komponen-komponen canggih dari Shadcn UI secara maksimal, khususnya komponen `DataTable` (dengan fitur penuh) dan `Sidebar`.

Working directory: /home/nara_events/Workspace/Project/nyaman-coffee
Integrity mode: development

## Requirements

### R1. Implementasi Penuh Shadcn DataTable
Ubah semua layout tabel manual menjadi komponen resmi Shadcn `DataTable` (berbasis TanStack Table). Komponen tabel ini wajib memiliki fitur interaktif kelas enterprise secara penuh: *Sorting* kolom, *Global Search* (Filtering), dan *Pagination*. Desain tabel harus mengadopsi ketebalan border, font, dan shadow Neobrutalism.

### R2. Migrasi ke Shadcn Sidebar & Perapian Layout
Ganti komponen sidebar manual di rute `/app/(dashboard)/backoffice/*` dengan komponen `Sidebar` resmi dari Shadcn UI. Perbaiki seluruh *padding*, *margin*, grid konten utama, serta letak komponen Header agar proposional, tidak tumpang tindih (*overlapping*), dan memiliki *whitespace* yang pas di layar lebar.

### R3. Standardisasi Komponen dan Tema Neobrutalism
Gunakan `Tabs`, `Avatar`, `Button Group` (atau modifikasi `ToggleGroup`), dan `Card` dari Shadcn UI untuk elemen-elemen dashboard lainnya. Pastikan garis tepi hitam tebal (`border-4 border-black`), sudut *rounded*, dan *solid shadows* (`shadow-[4px_4px_0_0_#000]`) terkalibrasi seragam pada semua instans komponen.

## Acceptance Criteria

### Standar UI/UX
- [ ] Terdapat implementasi `DataTable` Shadcn dengan *search box*, panah *sorting* di *header* tabel, dan kontrol *pagination* di bawah tabel untuk halaman Karyawan, Pelanggan, Produk, dll.
- [ ] Komponen navigasi kiri menggunakan fitur terbaru komponen `Sidebar` dari Shadcn (misal `SidebarProvider`, `SidebarContent`).
- [ ] Tabungan tombol yang berderet ("HARI INI", "KEMARIN", dll) telah dikonversi menjadi struktur `Tabs` atau `ToggleGroup` Shadcn yang estetik dan rapi.
- [ ] Tombol KAS KELUAR dan KAS MASUK dikelompokkan ke dalam sebuah *Card* dengan *padding* merata dan lebar tombol proporsional.

### Verifikasi Teknis
- [ ] Perubahan kode dapat dikompilasi ulang secara sukses (`npm run build`).
- [ ] Verifikasi konsistensi gaya melalui *script* inspeksi tailwind atau pemeriksaan komponen visual.
