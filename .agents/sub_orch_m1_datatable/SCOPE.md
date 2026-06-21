# Scope: M1 - Shadcn DataTable Integration

## Architecture
- Module/package boundaries: `/components/ui/data-table.tsx` and all tables in `/app/(dashboard)/backoffice/*`.
- State Management: TanStack Table for sorting, filtering, and pagination.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Create generic DataTable | Install `@tanstack/react-table` (or use if installed) and create `DataTable` component. | none | DONE |
| 2 | Refactor backoffice tables | Refactor Employees, Customers, Products, etc. to use `DataTable` | 1 | DONE |

## Interface Contracts
- `DataTable` component must accept `columns` and `data` props.
- Must implement global search (input), sorting (column headers), and pagination controls.
- Must adhere strictly to Neobrutalism styling (thick borders, specific shadows).
