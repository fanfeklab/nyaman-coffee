# Observation
We have 7 page components in `/app/(dashboard)/backoffice/*` that currently use Shadcn UI's raw `<Table>` component:
1. `products/page.tsx`: 3 tables (PRODUCTS, CATEGORIES, VARIANTS)
2. `customers/page.tsx`: 1 table (Customers)
3. `employees/page.tsx`: 1 table (Employees/Users)
4. `inventory/page.tsx`: 2 tables (MATERIALS, RECIPES)
5. `users/page.tsx`: 1 table (Users, similar to employees)
6. `audit/page.tsx`: 1 table (Audit Logs)
7. `reports/page.tsx`: 3 tables (Transactions, Shift History, Top Selling Analytics)

All tables use standard headers and rows, and include custom cell actions in the final column (such as Edit, Delete, Void) that trigger component-level dialogs and state changes. Search functionality is currently implemented manually in the pages.

# Logic Chain
To replace these raw tables with the new generic `<DataTable>` component (which implements `@tanstack/react-table` with sorting, filtering, and pagination):
1. **Column Definitions**: We need to define `ColumnDef<T>[]` for each table. Since the action cells rely on component-level functions (like `handleOpenEdit`, `setDeleteConfirmId`), the columns are best defined inside the page component using `useMemo` (or passed actions via props to a column factory function). We'll use `useMemo` directly in the page to maintain the current context.
2. **Remove Manual Search**: `DataTable` handles global search. We can remove the local `search` states and filter logic from the pages, passing the raw data arrays directly to `DataTable`.
3. **Data Mapping**: Ensure the data arrays (e.g., `products`, `categories`) are correctly passed.

# Caveats
- `DataTable` handles its own search, so custom manual search bars in pages should be replaced. However, `DataTable` might need a prop like `searchKey` to know which column to search, or it might implement global filtering across all columns.
- `reports/page.tsx` uses custom date filtering. This should still be kept in the page, and the pre-filtered `visibleTransactions` data should be passed to `DataTable`.
- Some tables (like Shift History) have no actions but still need `ColumnDef`s.

# Conclusion
The strategy is to define `columns` arrays using `useMemo` within each page component to capture cell actions, then replace `<Table>` and its wrapper with `<DataTable columns={...} data={...} />`.

# Specific Column Definitions Strategy
Below are code snippets for the columns arrays required for each file:

## 1. `products/page.tsx`
```tsx
import { ColumnDef } from '@tanstack/react-table';

// Inside the component:
const productColumns = useMemo<ColumnDef<Product>[]>(() => [
  { accessorKey: 'type', header: 'Tipe', cell: ({ row }) => <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.original.type === "COMBO" ? "bg-[#FF90E8]" : "bg-gray-200"}`}>{row.original.type}</span> },
  { accessorKey: 'name', header: 'Nama Menu', cell: ({ row }) => <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-md flex items-center justify-center"><Coffee className="w-4 h-4 text-gray-500" /></div>{row.original.name}</div> },
  { accessorKey: 'categoryId', header: 'Kategori', cell: ({ row }) => {
      const cat = categories.find((c) => c.id === row.original.categoryId);
      return cat ? <span className="px-2 py-1 text-xs border-2 border-black rounded-md uppercase" style={{ backgroundColor: cat.color }}>{cat.name}</span> : null;
  } },
  { accessorKey: 'basePrice', header: () => <div className="text-right">Harga Dasar</div>, cell: ({ row }) => <div className="text-right text-[#FF6321]">{formatRupiah(row.original.basePrice)}</div> },
  { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenEditProduct(row.original)}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="destructive" size="icon" onClick={() => setDeleteProductConfirm(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
  ) }
], [categories, handleOpenEditProduct]);

// ... Similar definitions for categoryColumns and variantColumns
```

## 2. `customers/page.tsx`
```tsx
const columns = useMemo<ColumnDef<Customer>[]>(() => [
  { accessorKey: 'name', header: 'Nama Pelanggan' },
  { accessorKey: 'phone', header: 'Nomor HP' },
  { accessorKey: 'points', header: 'Loyalty Points', cell: ({ row }) => <span className="px-2 py-1 bg-[#00E5FF] border-2 border-black rounded font-black text-xs">{row.original.points} Poin</span> },
  { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
  ) }
], [handleOpenForm]);
```

## 3. `employees/page.tsx` & `users/page.tsx`
```tsx
const columns = useMemo<ColumnDef<User>[]>(() => [
  { accessorKey: 'fullName', header: 'Nama Lengkap' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'role', header: 'Role', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.role === 'SUPER_ADMIN' || row.original.role === 'MANAGER' ? <Shield className="h-4 w-4 text-blue-500" /> : <UserIcon className="h-4 w-4 text-green-500" />}
        <span className={row.original.role === 'SUPER_ADMIN' || row.original.role === 'MANAGER' ? 'text-blue-500 font-bold' : 'text-green-600 font-bold'}>{row.original.role}</span>
      </div>
  ) },
  { accessorKey: 'pin', header: 'PIN', cell: () => <span className="font-mono">••••</span> },
  { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(row.original)} className="h-8 w-8"><Pencil className="h-4 w-4 text-orange-500" /></Button>
        <Button variant="outline" size="icon" onClick={() => handleDeleteRequest(row.original.id)} disabled={row.original.username === 'admin'} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash className="h-4 w-4" /></Button>
      </div>
  ) }
], [handleOpenDialog, handleDeleteRequest]);
```

## 4. `inventory/page.tsx`
```tsx
const materialColumns = useMemo<ColumnDef<RawMaterial>[]>(() => [
  { id: 'icon', header: '', cell: () => <div className="w-10 h-10 bg-orange-100 border-2 border-black rounded flex items-center justify-center"><PackageOpen className="w-5 h-5 text-orange-600" /></div> },
  { accessorKey: 'name', header: 'Nama Bahan' },
  { accessorKey: 'currentStock', header: 'Stok Saat Ini', cell: ({ row }) => <span className={`px-3 py-1 border-2 border-black rounded text-sm ${row.original.currentStock <= 10 ? 'bg-red-200' : 'bg-green-200'}`}>{row.original.currentStock} {row.original.unit}</span> },
  { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button onClick={() => handleOpenEdit(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"><Edit2 className="w-4 h-4"/></Button>
        <Button onClick={() => setDeleteConfirmId(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4"/></Button>
      </div>
  ) }
], [handleOpenEdit]);

// ... Similar definition for recipeColumns
```

## 5. `audit/page.tsx`
```tsx
const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
  { accessorKey: 'timestamp', header: 'Waktu', cell: ({ row }) => <span className="whitespace-nowrap">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(row.original.timestamp))}</span> },
  { accessorKey: 'userName', header: 'Pengguna', cell: ({ row }) => <div className="flex flex-col"><span className="font-inter font-bold text-black">{row.original.userName}</span><span className="text-xs text-gray-500">{row.original.userRole}</span></div> },
  { accessorKey: 'action', header: 'Aksi', cell: ({ row }) => <span className="font-inter font-bold text-[#FF6321]">{row.original.action}</span> },
  { accessorKey: 'details', header: 'Detail', cell: ({ row }) => <span className="font-inter text-gray-700">{row.original.details}</span> }
], []);
```

## 6. `reports/page.tsx`
```tsx
const transactionColumns = useMemo<ColumnDef<Transaction>[]>(() => [
  { accessorKey: 'timestamp', header: 'Waktu', cell: ({ row }) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.original.timestamp)) },
  { accessorKey: 'id', header: 'ID Transaksi', cell: ({ row }) => <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />{row.original.id}</div> },
  { accessorKey: 'cashierId', header: 'Kasir', cell: ({ row }) => <span className="uppercase text-xs">{users.find(u => u.id === row.original.cashierId)?.fullName || row.original.cashierId}</span> },
  { accessorKey: 'customerName', header: 'Pelanggan', cell: ({ row }) => <span className="uppercase text-xs">{row.original.customerName || '-'}</span> },
  { accessorKey: 'paymentMethod', header: 'Metode', cell: ({ row }) => <span className="uppercase">{row.original.paymentMethod}</span> },
  { accessorKey: 'total', header: () => <div className="text-right">Total</div>, cell: ({ row }) => <div className="text-right text-[#FF6321]">{formatRupiah(row.original.total)}</div> },
  { accessorKey: 'status', header: () => <div className="text-center">Status</div>, cell: ({ row }) => <div className="text-center"><span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.original.status === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>{row.original.status}</span></div> },
  { id: 'actions', header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => {
      const tx = row.original;
      return (
        <div className="flex justify-end gap-2">
          {tx.status === 'COMPLETED' && <Button onClick={() => setVoidConfirmId(tx.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Void Transaksi"><Ban className="w-4 h-4"/></Button>}
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && <Button onClick={() => { if (confirm('Hapus histori transaksi ini secara permanen?')) { useTransactionStore.getState().deleteTransaction?.(tx.id); toast.success('Transaksi dihapus permanen'); } }} className="p-2 border-2 border-black rounded bg-gray-100 hover:bg-gray-200 transition-colors" title="Hapus Permanen"><Trash2 className="w-4 h-4"/></Button>}
        </div>
      );
  } }
], [users, user]);
```

# Verification Method
1. Inspect the definitions of `DataTable` in `components/ui/data-table.tsx` to verify if it supports `searchKey` for global filter inputs, then update column properties as required.
2. Refactor one file manually (e.g. `customers/page.tsx`) and run `npm run dev` to verify the page loads, sorting/searching works, and the custom actions still trigger correct component state updates.
