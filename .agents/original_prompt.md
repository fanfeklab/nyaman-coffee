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
