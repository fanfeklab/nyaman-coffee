# Skema Database (Firebase Firestore)

Karena Firestore adalah NoSQL, kita akan mendesain dokumen secara denormalized secukupnya agar *read* efisien.

## 1. `store_settings` (Konfigurasi Global & Fleksibilitas)
Dokumen tunggal untuk mengatur workflow kafe (bisa diakses Super Admin).
*   `id`: "global_config"
*   `inventory_mode`: enum ("OFF", "LOOSE", "STRICT") -> Mengatur apakah transaksi memotong stok atau tidak.
*   `store_info`: object (nama, alamat, logo, pesan struk).

## 2. `users` & `roles`
*   **Collection `roles`**
    *   `id`: string
    *   `name`: string (e.g., "Kasir", "Manager", "Super Admin")
    *   `permissions`: string[]
*   **Collection `users`**
    *   `uid`: string (from Firebase Auth)
    *   `name`: string
    *   `email`: string
    *   `role_id`: reference
    *   `pin`: string (hashed, untuk otorisasi void / quick login terminal pos)
    *   `status`: boolean (active/inactive)

## 3. `shifts` (Manajemen Kasir & Laci)
Hanya ada 1 shift aktif per Device/Register.
*   `id`: string
*   `kasir_id`: reference (`users`)
*   `register_id`: string (Identifikasi device, e.g., "POS-01")
*   `start_time`: timestamp
*   `end_time`: timestamp | null
*   `starting_cash`: number (Modal awal di laci)
*   `ending_cash_system`: number (Modal + Total Tunai)
*   `ending_cash_actual`: number (Uang fisik / Blind Close)
*   `discrepancy`: number
*   `status`: enum ("OPEN", "CLOSED", "FORCED_CLOSED") -> Force closed by admin

## 4. `inventory_items` & `categories`
*   **Collection `categories`**
    *   `id`: string
    *   `name`: string (e.g., "Coffee", "Mocktail", "Main Course", "Paket")
    *   `type`: enum ("SINGLE", "COMBO")
*   **Collection `inventory_items` (Bahan Baku)**
    *   `id`: string
    *   `name`: string (e.g., "Biji Kopi Arabica", "Gelas Cup 14oz")
    *   `stock`: number
    *   `unit`: string (gram, ml, pcs)

## 5. `products` (Katalog Menu POS)
*   `id`: string
*   `name`: string
*   `category_id`: reference (`categories`)
*   `type`: enum ("SINGLE", "COMBO")
*   `image_url`: string | null
*   `preparation_instructions`: string (Text area untuk cara masak/buat)
*   `variants`: array of object (Jika tidak ada varian, default 1 array object)
    *   `variant_name`: string (e.g., "Size Regular", "Hot")
    *   `price`: number
    *   `recipe`: array of object (Relasi ke `inventory_items` + `quantity` + `unit`)
*   `combo_items`: array of object (HANYA MUNCUL JIKA type === "COMBO")
    *   `product_id`: reference (Produk menu single)
    *   `variant_name`: string (Spesifik varian dari menu single tersebut)
    *   `qty`: number (Jumlah item dlm paket)
    *   `snapshot_price`: number (Untuk acuan UI pembuat harga)

## 6. `transactions`
*   `id`: string (Nomor Nota: `#TRX-20261017-001`)
*   `shift_id`: reference
*   `kasir_id`: reference
*   `timestamp`: timestamp
*   `items`: array
    *   `product_id`: string
    *   `variant_name`: string
    *   `name`: string
    *   `qty`: number
    *   `price_per_item`: number
    *   `subtotal`: number
    *   `is_combo`: boolean
*   `subtotal_amount`: number
*   `discount_amount`: number
*   `total_amount`: number
*   `payment`: object
    *   `method`: enum ("CASH", "QRIS", "SPLIT")
    *   `details`: array (Jika split, isinya mix. Jika single, isinya 1 object metode)
    *   `cash_received`: number
    *   `change_amount`: number
    *   `qris_reference_no`: string | null (Wajib jika QRIS)
*   `status`: enum ("COMPLETED", "VOID")
*   `void_reason`: string | null
*   `void_by`: reference (User ID approver)
