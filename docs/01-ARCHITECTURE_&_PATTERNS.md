# Arsitektur & Pola Desain (Architecture & Patterns)

## 1. Modular Monolith
Untuk sistem skala menengah seperti manajemen kafe yang akan di-deploy ke Vercel, arsitektur **Modular Monolith** adalah pilihan terbaik. Dibandingkan Microkernel (yang seringkali menambah kompleksitas plugin system) atau Microservices (overhead operasional tinggi), Modular Monolith memberikan:
- **Kemudahan Maintenance**: Semua kode dalam satu repository (Monorepo).
- **Domain Boundaries**: Modul dipisah secara ketat berdasarkan domain bisnis (POS, Inventory, HR, Reports).
- **Scalability**: Jika suatu saat domain tertentu (misal Report) butuh instance terpisah, sangat mudah untuk di-extract menjadi microservice karena batas domainnya sudah jelas.

## 2. Struktur Direktori (Domain Driven Design - DDD)
Kita akan mengadopsi DDD secara pragmatis dalam Next.js App Router.

```text
src/
├── app/                      # Next.js Routing Layer (Dumb Routing)
├── core/                     # Shared kernel (Constants, Utils, Zod Config)
├── components/               # Global Dumb UI Components (Atomic Design: Atoms, Molecules, Organisms)
└── modules/                  # Domain Modules
    ├── pos/
    ├── inventory/
    ├── users/
    └── reports/
```

Setiap modul di dalam `modules/` akan mengikuti prinsip **SOC (Separation of Concerns)**:
- `domain/`: Berisi Entities dan DTO (Data Transfer Object) menggunakan `zod` schema. Tidak depend pada framework UI.
- `application/`: Berisi Use Cases (business logic) dan custom React Hooks (`usePosCart`, `useShift`).
- `infrastructure/`: Berisi Repository untuk komunikasi dengan eksternal (Firebase Firestore).
- `presentation/`: Berisi Smart/Dumb UI component spesifik untuk domain tersebut.

## 3. SOLID & Dumb UI
- **Dumb UI (Presentational)**: Komponen di `components/` hanya menerima `props` dan emit event (`onChange`, `onClick`). Tidak boleh memiliki logic fetching data.
- **Smart UI (Container)**: Komponen page di `app/` atau `presentation/` yang akan memanggil custom hooks untuk resolve dependencies dan parsing ke Dumb UI.
- **Single Responsibility**: Setiap Use Case atau custom hook hanya menangani satu tanggung jawab bisnis (misal: `calculateCartTotal`, `processPayment`).
- **Dependency Inversion**: UI layer tidak memanggil Firestore API secara langsung. UI memanggil Use Case / Repo abstraksi.
