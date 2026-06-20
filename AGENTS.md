# Aturan Perilaku AI Agent (Nyaman Coffee Shop POS)

Dokumen ini berisi instruksi spesifik dan guardrail untuk agen AI saat bekerja pada proyek ini. Agen WAJIB mematuhi semua instruksi di bawah ini tanpa kecuali.

## 1. DILARANG KERAS MENGGUNAKAN NATIVE HTML INPUTS & TAILWIND MURNI UNTUK KOMPONEN UI
- **HARAM HUKUMNYA** menggunakan element HTML native seperti `<select>`, `<input>`, `<button>`, `<dialog>` dengan styling Tailwind mentahan (from scratch) jika komponen tersebut ada di Shadcn UI / Radix UI.
- Semua elemen UI yang interaktif (Button, Select, Dropdown, Menu, Modal, Toast, dsb) **WAJIB** diinstal dan menggunakan library **Shadcn UI** / **Radix UI** !!
- Semua ikon **WAJIB** menggunakan **`lucide-react`**.
- Semua interaksi transisi dan animasi kompleks **WAJIB** menggunakan **`framer-motion`** (atau package `motion/react`).

## 2. Prioritas Penggunaan Package (Don't Reinvent The Wheel)
- **DILARANG** membangun fitur kompleks atau komponen standar dari awal ("from scratch").
- Kumpulan tech stack wajib: 
  - UI Components: Shadcn UI, Radix UI (Headless)
  - Animasi: `framer-motion` / `motion`
  - Ikon: `lucide-react`
  - State Management: `zustand`
  - Validasi & Form: `zod`, `react-hook-form`
  - Drag & Drop: `@dnd-kit/core`
  - Table: `@tanstack/react-table`
  - Routing: Next.js App Router standar.

## 3. Gaya Desain: Neobrutalism yang Konsisten
- Terapkan gaya **Neobrutalism** pada semua komponen Shadcn. Sesuaikan di base komponennya atau via custom variant (High contrast, tebal border hitam solid, rounded-md/xl, shadow solid/tajam seperti `shadow-[4px_4px_0_0_#000]`, warna background mencolok, hilangkan styling soft/gradient).

## 4. Feedback Interaksi (Awareness)
- Setiap aksi / perubahan data yang dilakukan oleh user WAJIB diberikan feedback menggunakan komponen dari Shadcn (misal: **Sonner**, **Toast**, **Alert Dialog**).
- Tidak boleh ada form yang di-submit atau aksi destruktif (seperti delete, void, tutup shift) yang berjalan secara silent. Wajib beri konfirmasi dan hasil operasinya.

## 5. UI-First & Mock Data Mode (Fase Saat Ini)
- **Fase Sandbox**: Pengembangan saat ini adalah *UI Development First*.
- JANGAN terapkan koneksi backend (Firebase Auth, Cloud Firestore) sampai ada izin tertulis dari pengguna.
- Gunakan `zustand` dengan initial state mock data untuk mensimulasikan CRUD dan operasional.

## 6. Kepatuhan Atomic Design & Dumb UI
- Patuhi best practice composable UI.
- Komponen UI di dalam `/components` (seperti Select, Button, Form, dsb) wajib dibuat reusable, dapat menerima `props` dengan baik, dan sebisa mungkin presentational (Dumb Component). State bisnis logika wajib disimpan di page/custom hooks.
