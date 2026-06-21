# BRIEFING — 2026-06-21T05:22:50Z

## Mission
Analyze backoffice pages that use `<Table>` and provide a strategy to replace them with `<DataTable>`. Write the strategy to `handoff.md`.

## 🔒 My Identity
- Archetype: Teamwork Explorer
- Roles: Read-only investigator
- Working directory: /home/nara_events/Workspace/Project/nyaman-coffee/.agents/teamwork_preview_explorer_m1.2_3
- Original parent: 5ee936fe-e5db-478b-bd17-45bb41e83e60
- Milestone: M2 - Refactor backoffice tables

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze problem, synthesize findings, produce structured reports

## Current Parent
- Conversation ID: 266d59fb-cb74-450b-a904-13706103aa61
- Updated: 2026-06-21T05:22:50Z

## Investigation State
- **Explored paths**: `SCOPE.md`, `products/page.tsx`, `customers/page.tsx`, `employees/page.tsx`, `inventory/page.tsx`, `users/page.tsx`, `audit/page.tsx`, `reports/page.tsx`, `components/ui/data-table.tsx`.
- **Key findings**: Manual filtering logic is used everywhere. Tab-based views require distinct `DataTable` rendering per tab. `useMemo` should be used to encapsulate row actions.
- **Unexplored areas**: None.

## Key Decisions Made
- Use `useMemo` for `ColumnDef` inside each component so columns can access the required callback functions like `handleOpenEditProduct`.
- Map related items dynamically in the component cell definition or via accessor functions.
- For `reports/page.tsx`, keep the manual `<Table>` for Shift view, but upgrade Penjualan and Analitik.

## Artifact Index
- /home/nara_events/Workspace/Project/nyaman-coffee/.agents/teamwork_preview_explorer_m1.2_3/handoff.md — DataTable migration strategy
