# Scope: M2 - Shadcn Sidebar & Layout Migration

## Architecture
- Module/package boundaries: `/components/organisms/Sidebar.tsx` and `/components/templates/AppLayout.tsx`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Add Shadcn Sidebar | Run `npx shadcn@latest add sidebar` and configure | none | PLANNED |
| 2 | Refactor Layout | Refactor `AppLayout.tsx` to use `SidebarProvider` and `Sidebar` component. | 1 | PLANNED |
| 3 | Refactor Sidebar | Update `Sidebar.tsx` to use Shadcn's specific sidebar components (`SidebarContent`, `SidebarGroup`, etc.). | 2 | PLANNED |

## Interface Contracts
- AppLayout must correctly position the sidebar and main content without overlaps.
- Sidebar must be collapsible/responsive and respect Neobrutalism UI style (thick borders, high contrast).
