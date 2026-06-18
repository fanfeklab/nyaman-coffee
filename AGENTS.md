# Aturan Perilaku AI Agent (Nyaman Coffee Shop POS)

Dokumen ini berisi instruksi spesifik dan guardrail untuk agen AI saat bekerja pada proyek ini. Agen WAJIB mematuhi semua instruksi di bawah ini tanpa kecuali.

## 1. Prioritas Penggunaan Package (Don't Reinvent The Wheel)
- **DILARANG** membangun fitur kompleks atau komponen standar dari awal ("from scratch") jika sudah ada package yang ecosystem-nya mature dan battle-tested.
- Contoh package wajib: 
  - State Management: `zustand`
  - Validasi & Form: `zod`, `react-hook-form`
  - Drag & Drop: `@dnd-kit/core`
  - Table: `@tanstack/react-table`
  - Routing: Next.js App Router standar.

## 2. Utamakan Shadcn / Radix UI
- **WAJIB** menggunakan atau menginstal komponen dari **Shadcn UI** (via CLI) dan **Radix UI** terlebih dahulu saat membutuhkan elemen antarmuka standar (seperti Modal/Dialog, Input, Button, Dropdown, Select, dll).
- Custom UI *hanya boleh* dibuat secara manual JIKA DAN HANYA JIKA desain spesifik yang dibutuhkan tidak tersedia di Shadcn UI atau tidak dapat dicapai dengan styling over Shadcn.
- Terapkan gaya desain "Neobrutalism" pada komponen (High contrast, tebal border, rounded, tanpa gradient yang soft).

## 3. Feedback Interaksi (Awareness)
- Setiap aksi / perubahan data yang dilakukan oleh user WAJIB diberikan feedback.
- Gunakan **Alert, Confirm, Cancel, Error, dan Success Modals/Toasts**.
- Tidak boleh ada form yang di-submit atau aksi destruktif (seperti delete, hapus dari cart, void, tutup shift) yang berjalan secara silent. Wajib ada Dialog Konfirmasi dan Toast Hasil.

## 4. UI-First & Mock Data Mode (Fase Saat Ini)
- **Fase Sandbox**: Pengembangan saat ini adalah *UI Development First*.
- JANGAN terapkan koneksi backend (Firebase Auth, Cloud Firestore) sampai ada izin tertulis dari pengguna.
- Gunakan `zustand` dengan initial state mock data untuk mensimulasikan CRUD dan operasional (Product list, User session, Shopping cart, dll).

## 5. Kepatuhan Atomic Design & Dumb UI
- Patuhi struktur komponen `atoms`, `molecules`, `organisms`, dan `templates`.
- Komponen di dalam `/components` bersifat presentational (Dumb UI). State handling utamanya melalui custom hook / halaman (`/app`).
