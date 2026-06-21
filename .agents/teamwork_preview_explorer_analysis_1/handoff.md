# Handoff Report: Codebase Analysis for Nyaman POS Migration

## 1. Observation
- **Tables**: Currently, tables are implemented in `/app/(dashboard)/backoffice/*` (e.g., `employees/page.tsx`, `products/page.tsx`, etc.) using basic Shadcn `Table`, `TableBody`, `TableRow`, `TableCell` components. Data mapping is done manually (`array.map`), without any pagination, global search, or built-in sorting. `@tanstack/react-table` is installed in `package.json` but not utilized to create a reusable `DataTable`.
- **Sidebar**: The Sidebar is implemented as a custom React component in `/components/organisms/Sidebar.tsx` and orchestrated manually in `/components/templates/AppLayout.tsx`. It uses custom mobile overlays, `framer-motion`, and custom logic for active links (`isActive`), rather than the official Shadcn `Sidebar` component.
- **Basic Components**:
  - **Tabs**: Tab navigation in pages like `products/page.tsx`, `inventory/page.tsx`, `reports/page.tsx`, and `settings/page.tsx` uses custom state (`useState`) and conditional rendering with custom styled buttons, completely bypassing standard Radix/Shadcn `Tabs`.
  - **Avatar**: User avatars in `/app/(dashboard)/shift/page.tsx` are using raw HTML `<img>` tags pointing to `api.dicebear.com`.
  - **Native HTML Elements**: A native `<input type="file">` exists in `/app/(dashboard)/backoffice/settings/page.tsx` (line 251), and a native `<select>` exists in `/components/organisms/DashboardOverview.tsx` (line 68).
  - **Neobrutalism**: Shadcn components like `Card` and `Button` already incorporate Neobrutalism styling (`border-4 border-black shadow-[4px_4px_0_0_#000]`).

## 2. Logic Chain
- The user's rules explicitly state to use Shadcn UI and Radix UI components instead of hardcoded/from scratch styling.
- **Tables** need to be fully integrated with `@tanstack/react-table` through a reusable `DataTable` component to provide features like search, sort, and pagination.
- **Sidebar** must be replaced by Shadcn's official Sidebar component (`npx shadcn@latest add sidebar`), simplifying `AppLayout.tsx` and `Sidebar.tsx`.
- **Tabs**, **Avatar**, and **ToggleGroup** components need to be installed from Shadcn and implemented in the respective pages to replace the custom manual logic.
- The remaining hardcoded native inputs (`<input type="file">` and `<select>`) must be wrapped or replaced with standard Shadcn UI components.

## 3. Caveats
- Moving to Shadcn Sidebar might require some custom adjustments for the Neobrutalism styles (thick borders, harsh shadows) to match the existing look and feel of the current custom sidebar.
- Refactoring `Tabs` across complex pages like `settings/page.tsx` will require migrating nested state logic into Radix tab contents.

## 4. Conclusion
The codebase heavily relies on custom implementations for tables, navigation, and tabs despite using Shadcn UI for basic elements. A structured migration process via the Orchestrator pattern in `PROJECT.md` is required. The plan consists of three clear milestones: 
- **M1: Shadcn DataTable Integration**
- **M2: Shadcn Sidebar & Layout Migration**
- **M3: Base Component Standardization (Tabs, Cards, Avatar, Neobrutalism UI)**

## 5. Verification Method
- **Tables**: `grep -r "@tanstack/react-table" app/` to ensure new DataTables are implemented and used.
- **Sidebar**: Verify `/components/organisms/Sidebar.tsx` imports from `@/components/ui/sidebar`.
- **Components**: `grep -r "Tabs" app/` and `grep -r "Avatar" app/` to verify custom tabs and images are replaced.
- **No Native HTML**: Run `grep -rnw 'app' -e '<select'` to verify zero occurrences.

---

# Draft PROJECT.md

Write the following content into `PROJECT.md` at the root directory:

```markdown
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

### M1: Shadcn DataTable Integration
- Build a generic `DataTable` component wrapping `@tanstack/react-table` (include sorting, pagination, and global search).
- Refactor all manual tables in `/app/(dashboard)/backoffice/*` (Employees, Customers, Products, Inventory, Manual Sales, Petty Cash, Purchase Orders, Users) to use `DataTable`.

### M2: Shadcn Sidebar & Layout Migration
- Install Shadcn Sidebar (`npx shadcn@latest add sidebar`).
- Refactor `/components/organisms/Sidebar.tsx` to use Shadcn components (`Sidebar`, `SidebarContent`, `SidebarGroup`).
- Refactor `/components/templates/AppLayout.tsx` to utilize `SidebarProvider`.
- Maintain Neobrutalism styling for the sidebar navigation links.

### M3: Base Component Standardization
- Install `Tabs`, `Avatar`, `ToggleGroup` from Shadcn.
- Replace manual tab navigation with `<Tabs>` in `products`, `inventory`, `reports`, and `settings` pages.
- Replace all raw `<img>` avatars in `shift/page.tsx` with Shadcn `<Avatar>`.
- Replace hardcoded `<select>` in `DashboardOverview.tsx` with `<Select>`.
- Replace or properly style native `<input type="file">` in `settings/page.tsx` using Shadcn elements.
```
