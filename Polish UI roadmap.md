# Polish UI & Modern Web Refactoring Roadmap

This document outlines the tasks required to fully align the current codebase with the `AGENTS.md` system guidelines. We need to eliminate all native HTML UI elements (like `<button>`, `<input>`, `<table>`, `<select>`) and replace them with Shadcn UI / Radix UI components, ensuring the "Neobrutalism" styling is consistent throughout, and integrating `framer-motion` for complex interactions.

## 1. Eliminate Native `<button>` Elements
Replace all `<button className="...">` with Shadcn's `<Button variant="..." className="...">`.
- [ ] `app/(dashboard)/backoffice/inventory/page.tsx`
- [ ] `app/(dashboard)/backoffice/settings/page.tsx`
- [ ] `app/(dashboard)/backoffice/reports/page.tsx`
- [ ] `app/(dashboard)/backoffice/products/page.tsx`
- [ ] `app/(dashboard)/pos/page.tsx`

## 2. Eliminate Native `<table>` Elements
Replace all native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` with Shadcn's `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`.
- [ ] Install Shadcn Table component (if missing or check `/components/ui/table.tsx`).
- [ ] `app/(dashboard)/backoffice/stock-opname/page.tsx`
- [ ] `app/(dashboard)/backoffice/purchase-orders/page.tsx`
- [ ] Check other backoffice pages (Employees, Inventory, Customers, Audit, Users, Petty Cash, Reports, Products) for native tables.

## 3. Eliminate Native `<input>` & `<select>` Elements
Ensure all form inputs use Shadcn's `<Input>`, `<Select>` (or `FormSelect` wrapper), etc.
- [ ] `app/(dashboard)/backoffice/settings/page.tsx` (Contains native `<input>`)
- [ ] Review other forms globally to ensure no leaked native inputs.

## 4. Integrate `framer-motion` (`motion/react`)
Add subtle standard animations (e.g., list staggering, modal entries, layout changes).
- [ ] `app/(dashboard)/pos/page.tsx` (Currently using `motion/react`, review if it covers all dynamic lists/modals).
- [ ] Add layout transitions for the Cart, Menu Grid, and Order List.
- [ ] Implement `framer-motion` for other interactive backoffice pages (e.g. Products list, Inventory list).

## 5. UI Polish & Neobrutalism Styling (Global)
- [ ] Standardize the Neobrutalist look across all custom components: solid borders (`border-2` or `border-4 border-black`), sharp shadows (`shadow-[4px_4px_0_0_#000]`), and high contrast colors.
- [ ] Apply to `Card` components anywhere they lack the styling.
- [ ] Apply to `Table` components (e.g., thick border for header lines, sharp corners or solid wrappers).
- [ ] Check Feedback Dialogs (SweetAlert/Sonner) for consistency with the design system.

## Action Plan
We will iterate through these checkboxes step-by-step, refactoring each page sequentially to ensure the site compiles correctly after every phase.
