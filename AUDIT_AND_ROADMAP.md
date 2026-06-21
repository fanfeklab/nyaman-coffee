# Nyaman Coffee Shop POS - Enterprise Grade Audit & Roadmap

## 1. Executive Summary & Codebase Audit
- **Architecture & Tech Stack**: Next.js 15 App Router, Tailwind CSS (v4), Shadcn UI, Radix UI primitives, Lucide React, Framer Motion. The codebase is cleanly organized, well-componentized, and correctly implements the Dumb/Smart component boundary pattern.
- **State Management**: Heavily leverages `zustand` with the `persist` middleware. State domains are properly isolated (`useAuthStore`, `useShiftStore`, `useCartStore`, `useInventoryStore`, `useTransactionStore`). It functions perfectly as an offline sandbox environment.
- **UI/UX**: Consistently applies the **Neobrutalism** design system (high contrast, solid borders, sharp shadows, bold typography). Strict compliance with `AGENTS.md` is observed—native HTML inputs have been replaced with Shadcn Radix primitives, ensuring consistent accessibility and styling.
- **Performance**: Near instant responses due to the fully local execution.

## 2. The Path to "Enterprise Grade" F&B
For a high-volume F&B POS in Indonesia, internet stability is the most critical risk. A cloud-only POS will completely halt store operations during an ISP or network outage. Therefore, the system must embrace a **Local-First / Offline-First** architecture.

Key Enterprise Requirements:
1. **Blazing Fast Checkout**: Sub-second UI response time. Cashiers cannot wait for a network roundtrip to add items or calculate change.
2. **Uninterrupted Operations**: The POS must remain 100% operational (process orders, calculate totals, print receipts) during internet downtime.
3. **Audit & Accountability**: Strict Role-Based Access Control (RBAC), Supervisor PIN overrides for Voids, and "Blind Close" for shift reconciliation.
4. **Cloud Centralization**: A centralized Cloud Database (Supabase PostgreSQL) for cross-branch analytics, live dashboarding, and central menu management.
5. **Hardware Integration**: Seamless integration with thermal ESC/POS printers and cash drawers.

## 3. Architecture Blueprint: Offline-First with Supabase
To achieve these requirements, we will implement a **Local-First Sync Architecture**.

- **Local DB (IndexedDB)**: The single source of truth for the React UI. We will upgrade Zustand's persistence layer from `localStorage` (which is synchronous, thread-blocking, and has a 5MB limit) to IndexedDB (via `idb-keyval` or `Dexie.js`).
- **Cloud DB (Supabase + Drizzle ORM)**: The central server.
- **Sync Engine (`useSyncStore`)**: 
  - *Downstream (Pull)*: At app launch or shift open, the POS pulls the latest Master Data (Products, Categories, Users, Promos) from Supabase into IndexedDB. It can listen to Supabase Realtime for live price updates.
  - *Upstream (Push)*: All new transactions, inventory deductions, and audit logs are written instantly to an `ActionQueue` in local state. A background worker periodically pushes this queue to Supabase. If the connection drops, it retries indefinitely without blocking the cashier.

## 4. Concrete Steps for Supabase Migration

### Phase 1: Supabase Initialization & Data Modeling
1. **Define Schema with Drizzle ORM**: Create relational schemas for `users`, `roles`, `products`, `inventory_items`, `transactions`, `transaction_items`, and `audit_logs` inside a new `db/schema.ts` directory.
2. **Setup RLS (Row Level Security)**: Secure tables so that a POS terminal can only read/write data belonging to its specific branch.

### Phase 2: Supabase Auth & PIN Login (Fast Cashier Switching)
Standard JWT auth flows (email/password) are too slow for cashiers constantly switching between terminals or orders. We will use a **Terminal Device Auth + Local PIN** strategy.
1. **Device Registration (Terminal Login)**: The POS tablet is logged in once by a Manager using standard Supabase Email/Password Auth. This gives the device a long-lived JWT session and identifies which branch it belongs to.
2. **Cashier PIN Unlock**: 
   - The POS downloads the branch's employee list and hashes their PINs into IndexedDB.
   - When a cashier steps up to the POS, they enter their 4-digit PIN. The UI validates this against the local cache in `0ms`.
   - If valid, `useAuthStore` sets the `currentUser`.
   - All offline transactions pushed to Supabase by the Terminal will include the specific `cashier_id` in the payload to maintain strict audit trails.

### Phase 3: Transitioning Zustand Stores to Local-First Sync
1. Replace `localStorage` with `idb-keyval` for all Zustand `persist` configurations.
2. Implement `useSyncStore.ts` with a robust queue system:
   ```typescript
   interface SyncState {
     syncStatus: 'online' | 'syncing' | 'offline' | 'error';
     mutationQueue: MutationPayload[]; // queue of offline transactions
     pushQueue: () => Promise<void>;
     pullMasterData: () => Promise<void>;
   }
   ```
3. Update `useTransactionStore`: When a checkout completes, save the receipt to the local history AND append it to the `mutationQueue`.
4. Update `useInventoryStore`: Perform optimistic offline deductions so stock levels reflect reality locally. Reconcile with the Supabase source of truth when the sync engine runs.

### Phase 4: Security & Audit Hardening
1. **Void & Refund Protection**: All destructive actions must trigger a `Supervisor Override` dialog. This dialog requires entering a PIN belonging to a user with the `MANAGER` or `SUPER_ADMIN` role.
2. **Blind Close Enforcement**: During the Close Shift flow, the system must *not* display the expected cash in the drawer. The cashier must count the physical cash and input the number blindly. Any discrepancy (over/short) is calculated after submission and logged securely to `audit_logs`.
3. Move `useAuditStore` to immediately queue logs for cloud storage, ensuring non-repudiation of actions.

## 5. Next Immediate Actionable Tasks
1. **Task 10.1**: Refactor Zustand storage layer to use IndexedDB (`idb-keyval`) to eliminate the 5MB storage limit and prevent UI blocking during large state saves.
2. **Task 10.2**: Create the Drizzle Schema (`db/schema.ts`) to mirror the current mock state structures, and set up the Supabase project configuration.
3. **Task 10.3**: Implement the "Device Login" (Email/Pass via Supabase Auth) + "Cashier Unlock" (Local PIN) hybrid authentication flow.
4. **Task 10.4**: Implement the Background Sync Queue (`useSyncStore`) to handle asynchronous upstream pushes of Transactions and Audit Logs.
5. **Task 10.5**: Connect the Backoffice / Analytics Dashboards directly to Supabase via Next.js Server Components, removing them from the offline-first requirement (Backoffice is assumed to have internet access).
