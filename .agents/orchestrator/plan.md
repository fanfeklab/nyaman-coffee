# Project Plan: Nyaman Coffee Shop POS (Phase 10 / PoC & Audit)

1. **Audit & Roadmap Document**:
   - Agent: `teamwork_preview_worker` (or Explorer)
   - Task: Review existing UI/UX (Neobrutalism), state management (`zustand`), DB schema documents (`drizzle` / `supabase` directory / `ROADMAP.md` / `02-DATABASE_SCHEMA.md`), and security (`useAuthStore.ts`).
   - Deliverable: Create `/home/nara_events/Workspace/Project/nyaman-coffee/AUDIT_AND_ROADMAP.md` containing the audit and the concrete migration steps for Supabase Auth (offline-first compatible).

2. **Test Setup**:
   - Orchestrator (or Worker): Install `vitest`, `jsdom`, `@testing-library/react`.

3. **Offline-First PoC Implementation**:
   - Agent: `teamwork_preview_worker`
   - Task: Create `store/useSyncQueueStore.ts` (Zustand) representing an offline queue of mutations.
   - Implement `online` / `offline` state management.
   - Implement sync resolution logic (conflict-free).

4. **Automated Tests**:
   - Agent: `teamwork_preview_worker`
   - Task: Write `__tests__/offlineSync.test.ts` to simulate online/offline transitions, adding items to queue, and flushing them successfully without conflicts.
   - Verify tests pass using `npm run test` (via Vitest).

5. **Completion check**:
   - Verify all acceptance criteria are met.
   - Report success to user.
