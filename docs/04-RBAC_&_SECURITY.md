# RBAC (Role-Based Access Control) & Fitur Flags

## 1. Filosofi Otorisasi
Otorisasi tidak lagi dihard-coded dengan statemen `if (role === 'admin')`, melainkan menggunakan konsep **Feature Flag/Permissions Based**. Ini memungkinkan Super Admin (Owner) untuk secara dinamis mengizinkan atau melarang fungsionalitas tertentu pada sebuah role.

## 2. Struktur Izin (Permissions & DTO Strings)
Izin didefinisikan sebagai array of string:
- `POS_ACCESS`
- `OPEN_CLOSE_SHIFT`
- `PROCESS_PAYMENT`
- `VOID_TRANSACTION_APPROVAL` (Izin spesial untuk manager yang bisa membatalkan transaksi / memberikan diskon manual)
- `VIEW_SALES_REPORT`
- `VIEW_INVENTORY`
- `MANAGE_INVENTORY`
- `MANAGE_USERS`
- `MANAGE_SYSTEM_SETTINGS`

## 3. Preset Roles Default
- **KASIR**: `['POS_ACCESS', 'OPEN_CLOSE_SHIFT', 'PROCESS_PAYMENT']`
- **SUPERVISOR / MANAGER**: Semua role Kasir ditambah `['VOID_TRANSACTION_APPROVAL', 'VIEW_INVENTORY', 'VIEW_SALES_REPORT']`
- **SUPER ADMIN / OWNER**: Memiliki akses absolut ke semua fitur (bypass).

## 4. Implementasi
- Frontend akan memiliki komponen wrapper `<Guard permission="VOID_TRANSACTION_APPROVAL"> ... </Guard>` untuk me-render UI secara kondisional.
- Middleware Next.js & Route Handler akan mem-validasi `roles` (bisa ditarik via custom claims Firebase Auth atau dicocokkan dengan session di Firestore) pada akses resource terkait. 
- Aturan Firebase keamanan (Firestore Security Rules) akan memastikan `write` data divalidasi oleh logic permission role.
