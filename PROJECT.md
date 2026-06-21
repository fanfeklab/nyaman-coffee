# Nyaman POS - Migration & Standardization

## Architecture
- **Framework**: Next.js App Router
- **UI & Styling**: Shadcn UI + Radix UI + Tailwind CSS (Neobrutalism style)
- **State Management**: Zustand (Mock data mode)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Code Layout
- `/app/(dashboard)/*`: Core pages (POS, Backoffice, Reports).
- `/components/ui/*`: Dumb UI components from Shadcn.
- `/components/organisms/*`: Complex composed components (Sidebar, DashboardOverview).
- `/components/templates/*`: Layout wrappers (AppLayout).
- `/store/*`: Zustand state management.

## Interface Contracts
- **DataTable**: Reusable component accepting `columns` and `data`, implementing TanStack Table.
- **Sidebar**: Must implement `SidebarProvider` and `SidebarGroup` from Shadcn.
- **Styling**: All base components must adhere strictly to Neobrutalism:
  - `border-4 border-black`
  - `shadow-[4px_4px_0_0_#000]`
  - `rounded-xl`
  - `font-space-grotesk` for headers/buttons.

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Shadcn DataTable Integration | Replace manual tables in backoffice with generic DataTable using TanStack Table (sort, paginate, global search) | none | DONE |
| M2 | Shadcn Sidebar & Layout Migration | Refactor Sidebar and AppLayout to use Shadcn Sidebar components (`SidebarProvider`, `SidebarContent`) | none | PLANNED |
| M3 | Base Component Standardization | Replace manual tabs, raw `<img>` avatars, and native `<select>` / `<input type="file">` with Shadcn components | none | PLANNED |
