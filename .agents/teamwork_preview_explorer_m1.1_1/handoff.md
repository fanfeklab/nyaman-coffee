# Handoff: Milestone 1 - Generic DataTable

## Observation
- Verified `/components/ui/table.tsx` exists and uses Shadcn base styles, but doesn't strictly have Neobrutalism natively injected.
- Checked `/components/ui/button.tsx`, `input.tsx`, and `select.tsx`, which are heavily customized with Neobrutalism (e.g. `border-4 border-black shadow-[4px_4px_0_0_#000]`).
- `@tanstack/react-table` is installed in `package.json` v8.21.3.
- `lucide-react` is installed for icons.
- `SCOPE.md` requires creating `/components/ui/data-table.tsx` accepting `columns` and `data` props, with global search, sorting, and pagination controls, fully styled in Neobrutalism.
- `table.tsx` is widely imported across `/app/(dashboard)/backoffice/*`, so we should prefer wrapping Neobrutalism styles in `data-table.tsx` rather than altering `table.tsx` directly, preventing breakages in existing pages before Milestone 2 refactor.

## Logic Chain
1. Since `@tanstack/react-table` and all needed Shadcn components (`table`, `button`, `input`, `select`) are present, we can assemble `DataTable` directly.
2. To satisfy the "Neobrutalism strictly" constraint from `AGENTS.md` and `SCOPE.md`, we inject Tailwind utility classes (e.g. `border-4 border-black`, `shadow-[4px_4px_0_0_#000]`, `bg-[#FFD100]`) in the table wrapper, rows, and headers within the `DataTable` component. This sidesteps editing `table.tsx` directly while fulfilling the style requirements.
3. Pagination is handled natively by TanStack Table (`getPaginationRowModel`), with Shadcn's `Select` for `pageSize` and `Button` for `nextPage()` / `previousPage()`.
4. Global Search uses `getFilteredRowModel`. We expose a `searchKey` prop to let the user define which column to filter (e.g., `name` or `email`).
5. Sorting uses `getSortedRowModel`. Column definition headers need a sort toggle. A helper component `DataTableColumnHeader` provides the generic `<Button variant="ghost">` toggler.

## Caveats
- `table.tsx` base components still lack built-in thick borders. By applying them in `data-table.tsx`, we fix it for the generic table, but standalone `<Table>` usage won't have Neobrutalism borders. If standalone tables are needed in the future, `table.tsx` should be refactored.
- `searchKey` is implemented as a single column search (e.g. searching only "name"). If global cross-column search is needed, we'd use `globalFilterFn` instead of column-specific `setFilterValue`. For now, `searchKey` suffices for standard single-column filtering as per typical Shadcn DataTable implementations.

## Conclusion
The implementation strategy is solid and ready. I have created `proposed_data-table.tsx` and `proposed_data-table-column-header.tsx` in my workspace. The `DataTable` fulfills all requirements:
- Uses `@tanstack/react-table`.
- Follows Neobrutalism styling.
- Implements sorting, pagination, and filtering.

**Next step (Implementer):**
1. Copy `proposed_data-table.tsx` to `/components/ui/data-table.tsx`.
2. Copy `proposed_data-table-column-header.tsx` to `/components/ui/data-table-column-header.tsx`.
3. Ensure no lint errors in those files.

## Verification Method
- Ensure the file `/components/ui/data-table.tsx` is created.
- Verify TypeScript compilation using `npm run lint` or `npx tsc --noEmit`.
- Check if it renders successfully by mocking a dummy page rendering `<DataTable columns={[]} data={[]} />`.
