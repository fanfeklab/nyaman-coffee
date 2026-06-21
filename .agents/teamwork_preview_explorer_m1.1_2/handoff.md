# Milestone 1: Create generic DataTable - Handoff Report

## Observation
1. **Dependencies**: `package.json` already contains `@tanstack/react-table` (version `^8.21.3`), `lucide-react`, and Shadcn UI dependencies (`table.tsx`, `input.tsx`, `button.tsx`).
2. **Current Styling (Neobrutalism)**:
   - Evaluated `components/ui/card.tsx` and `components/ui/input.tsx`. Neobrutalism is achieved via: `border-4 border-black`, `shadow-[4px_4px_0_0_#000]`, and `rounded-xl`.
   - The Shadcn UI `Table` (`components/ui/table.tsx`) is currently standard/plain and does not natively include the Neobrutalism container wrapper.
3. **Current Usage**: Checked `app/(dashboard)/backoffice/employees/page.tsx` — currently using the raw, un-paginated `Table` component from Shadcn UI. No filtering or sorting implemented yet.

## Logic Chain
1. Since the `@tanstack/react-table` package is already installed, we can proceed directly to creating the `DataTable` component. No new `npm install` is required.
2. To satisfy the Neobrutalism requirement without breaking standard `table.tsx` flexibility, the `DataTable` component should wrap the `<Table>` component within a container `div` that applies the Neobrutalism CSS classes: `className="rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] bg-white overflow-hidden"`.
3. For global search/filtering, Shadcn UI's `<Input>` already implements Neobrutalism. We can bind its `value` and `onChange` to `@tanstack/react-table`'s `globalFilter` or column-specific `filterValue`.
4. For pagination, we can use standard Shadcn UI `<Button variant="outline">` and icons from `lucide-react` (`ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight`). Since `button.tsx` is updated to Neobrutalism styling, it will automatically fit the theme.
5. To enable sorting, columns will need to utilize a header component that provides an interactive button. The `DataTable` should utilize `getSortedRowModel`.

## Caveats
- I am recommending to add the Neobrutalism wrapper to the outer `div` inside `DataTable` rather than altering the base `table.tsx` component. Altering the base component could cause unintended side effects on other raw usages of `<Table>`.
- Neobrutalism styling might look overwhelming if inner table borders are also thick. The inner rows and cells should remain standard (e.g., `border-b` / thin lines) to balance the aggressive outer wrapper.
- I haven't investigated the specific API data types for each backoffice page. The generic `DataTable` uses generic types (`<TData, TValue>`) so it is agnostic to the data shape.

## Conclusion
The project is completely ready for the implementation of the `DataTable` component.

**Implementation Plan (for the implementer agent):**
1. Create `components/ui/data-table.tsx`.
2. Import `useReactTable` and all necessary models (`getCoreRowModel`, `getPaginationRowModel`, `getSortedRowModel`, `getFilteredRowModel`) from `@tanstack/react-table`.
3. Import Shadcn UI components: `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`, `Input`, and `Button`.
4. Create the `DataTableProps<TData, TValue>` interface which accepts `columns`, `data`, and optionally a `searchKey` string.
5. Implement state hooks for `sorting`, `columnFilters`, and `columnVisibility`.
6. Render an outer container `div` using Neobrutalism styles (`rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] bg-white overflow-hidden`) to house the `Table`.
7. Render the global filter `<Input>` above the table.
8. Render the pagination controls (page info and Prev/Next buttons) below the table.

*(You can provide a code structure similar to standard Shadcn `DataTable` but with the specific Neobrutalism container div).*

## Verification Method
1. The implementer should write the component code to `/components/ui/data-table.tsx`.
2. Import the component in a dummy route or temporarily replace the `Table` in `/app/(dashboard)/backoffice/employees/page.tsx`.
3. Start the dev server (`npm run dev`) or check type definitions with `npm run build` / `npm run lint`.
4. Verify visually that:
   - The table has thick black borders and sharp shadows.
   - The search input filters the rows correctly.
   - The pagination buttons switch pages properly.
   - Clicking on sortable column headers successfully reorders the data.
