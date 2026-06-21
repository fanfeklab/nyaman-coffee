# Handoff: M1.1 - Create generic DataTable

## Observation
- The project dependencies (`package.json`) already include `@tanstack/react-table` (`^8.21.3`).
- Shadcn UI table base components exist at `components/ui/table.tsx`.
- Neobrutalism theme is strongly enforced via Tailwind classes across existing components like `components/ui/button.tsx` and `components/ui/input.tsx`. Specifically: `border-4`, `border-black`, `shadow-[4px_4px_0_0_#000]`, `rounded-xl`, and fonts like `font-space-grotesk` or `font-inter`.
- The `table.tsx` base components do not enforce heavy Neobrutalism styling directly on the `Table` wrapper, which means the custom wrapper inside `DataTable` must handle this.
- `lucide-react` is available for icons (Search, ChevronLeft, ChevronRight, etc).

## Logic Chain
1. Since `@tanstack/react-table` and `components/ui/table.tsx` are available, we can immediately create `components/ui/data-table.tsx`.
2. The `DataTable` needs to be a generic React component (`<TData, TValue>`) taking `columns` and `data` as props.
3. According to `SCOPE.md`, the component needs global search (filtering), sorting, and pagination. We will implement this using `getFilteredRowModel`, `getSortedRowModel`, and `getPaginationRowModel` from TanStack Table.
4. To meet the Neobrutalism design rules (`AGENTS.md`), we must wrap the Table with a `border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl overflow-hidden` styling. The Search input and Pagination controls should use the similarly styled `Input` and `Button` components.
5. I have drafted a complete `data-table.tsx` implementation at `proposed_data-table.tsx` within this folder, which includes a `DataTableColumnHeader` helper to allow users to add sort buttons to their columns with matching Neobrutalist design.

## Caveats
- Sorting logic inside column headers requires the caller to wrap their header titles in the `DataTableColumnHeader` component or implement standard TanStack column toggle logic.
- We assume pagination page size is default (10 rows). The caller can extend this later if a rows-per-page selector is needed.
- `globalFilter` is used directly on the whole table.

## Conclusion
The implementer can proceed to create `components/ui/data-table.tsx` using the provided proposed code. This will fulfill Milestone 1 "Create generic DataTable".

## Verification Method
1. The file `components/ui/data-table.tsx` is successfully created.
2. Run `npm run lint` or `npm run dev` to ensure there are no TypeScript or ESLint errors.
3. Verify visually by rendering it with mock data, ensuring the table has thick borders, sharp shadows, and responds to search and pagination clicks.
