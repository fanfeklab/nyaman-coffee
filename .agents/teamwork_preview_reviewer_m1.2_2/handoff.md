## Observation
- `DataTable` is implemented in `components/ui/data-table.tsx` using `@tanstack/react-table`.
- Search, Sort, and Pagination are fully integrated into the `useReactTable` API (via `getFilteredRowModel`, `getSortedRowModel`, `getPaginationRowModel`).
- Styling uses Neobrutalist design: `border-4 border-black`, `shadow-[4px_4px_0_0_#000]`, and high-contrast colors.
- `grep` search confirmed `DataTable` is integrated into all 7 backoffice pages: `audit`, `customers`, `employees`, `inventory`, `products`, `reports`, `users`.
- `npm run lint && npm run build` executed successfully without errors. All 21 static pages compiled successfully.

## Logic Chain
1. The `SCOPE.md` demands `DataTable` integration in backoffice pages and specifies interface contracts (`columns`, `data`, global search, sorting, pagination, Neobrutalism).
2. The implementation of `DataTable` directly satisfies all contracts with no mocked static behavior (search state binds to TanStack Table correctly).
3. The global search and sorting utilities are correctly exposed.
4. Backoffice pages utilize `DataTable` correctly and compile without type errors.
5. Build and lint passes, confirming valid Next.js pages and zero type violations.

## Caveats
- Next.js emits warnings regarding `useReactTable` escaping memoization. This is a known React Compiler warning for `@tanstack/react-table` and won't affect correctness for standard usage.
- `<img>` warnings are emitted for LCP issues, but are out of scope for the current `DataTable` refactoring.

## Conclusion
VERDICT: PASS (APPROVE)

The work meets the M1/M2 requirements fully. The integration is correct, the library is properly utilized, the Neobrutalist design is respected, and no integrity violations or fake implementations were detected.

## Verification Method
1. Run `npm run lint` and `npm run build` to verify there are no compilation or typing issues.
2. Search for `<DataTable` across `app/(dashboard)/backoffice/*` to ensure it replaced the native tables.
