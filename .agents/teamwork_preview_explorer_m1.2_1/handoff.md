# Handoff Report: Refactor Tables to DataTable

## 1. Observation
- Inspected 7 files under `app/(dashboard)/backoffice/*/page.tsx`.
- All pages currently use Shadcn's native `<Table>` component with mapped rows (`<TableRow>`) directly rendering `<TableCell>`s.
- `products/page.tsx` uses a single table rendering conditionally based on `activeTab` (`PRODUCTS`, `CATEGORIES`, `VARIANTS`). It maps over `filteredProducts`, `filteredCategories`, and `filteredVariants`.
- `inventory/page.tsx` uses a single table rendering conditionally based on `activeTab` (`MATERIALS`, `RECIPES`).
- `reports/page.tsx` renders three separate tables conditionally based on `activeTab` (`penjualan`, `shift`, `analitik`). Note: The 'shift' tab renders `currentShift` as the first row manually, and maps `shiftHistory` below it.
- All tables contain an `Aksi` (Action) column with interactive buttons (Edit, Delete, Void, etc.) that rely on component state setters (e.g. `setDeleteId`, `handleOpenEditProduct`).

## 2. Logic Chain
- To replace `<Table>` with the new `<DataTable>` component (which accepts `columns` and `data` props), we need to extract the table headers and cell rendering logic into `ColumnDef<T>[]` arrays.
- Because the `Aksi` cells rely on state setter functions (like `setDeleteConfirmId`), the `columns` arrays MUST be defined *inside* the React functional components (preferably wrapped in `useMemo` to prevent unnecessary re-renders).
- For pages with tabs (like Products, Inventory, Reports), we should define separate `columns` arrays for each dataset, and conditionally render the `<DataTable columns={...} data={...} />` component.
- The `shift` table in `reports/page.tsx` requires passing combined data `[currentShift, ...shiftHistory]` into the DataTable to avoid manually creating the first row.

## 3. Caveats
- `users/page.tsx` and `employees/page.tsx` both manage users from `useAuthStore` and are largely redundant, but both need refactoring if they both remain.
- Some table rows use conditional styling (e.g. `tx.status === 'VOID' ? 'opacity-50' : ''`). `DataTable` might need a mechanism (like `getRowProps`) to apply row-level styles, or this styling must be migrated into cell renderers.
- The global search logic (e.g., `filteredProducts`) is currently handled manually before passing to the map. The `<DataTable>` scope mentions it "Must implement global search (input)...", so we need to either pass `filteredData` directly or let `DataTable` handle the filtering natively and pass the raw `data`. We will assume we pass `data` and let the component handle it or pass `filteredData` as is. The `columns` definitions remain the same.

## 4. Conclusion
We must define the following column arrays inside their respective components:

### 1. `products/page.tsx`
```tsx
const productColumns = useMemo<ColumnDef<Product>[]>(() => [
  { accessorKey: "type", header: "Tipe", cell: ({ row }) => <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.original.type === "COMBO" ? "bg-[#FF90E8]" : "bg-gray-200"}`}>{row.original.type}</span> },
  { accessorKey: "name", header: "Nama Menu", cell: ({ row }) => <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-md flex items-center justify-center"><Coffee className="w-4 h-4 text-gray-500" /></div>{row.original.name}</div> },
  { id: "category", header: "Kategori", cell: ({ row }) => {
      const cat = categories.find((c) => c.id === row.original.categoryId);
      return cat ? <span className="px-2 py-1 text-xs border-2 border-black rounded-md uppercase" style={{ backgroundColor: cat.color }}>{cat.name}</span> : null;
  }},
  { accessorKey: "basePrice", header: () => <div className="text-right">Harga Dasar</div>, cell: ({ row }) => <div className="text-right text-[#FF6321]">{formatRupiah(row.original.basePrice)}</div> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenEditProduct(row.original)}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="destructive" size="icon" onClick={() => setDeleteProductConfirm(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
  )},
], [categories]);

const categoryColumns = useMemo<ColumnDef<Category>[]>(() => [
  { id: "color", header: "Warna", cell: ({ row }) => <div className="w-6 h-6 border-2 border-black rounded-full" style={{ backgroundColor: row.original.color }} /> },
  { accessorKey: "name", header: "Nama Kategori", cell: ({ row }) => <span className="uppercase">{row.original.name}</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenEditCategory(row.original)}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="destructive" size="icon" onClick={() => setDeleteCategoryConfirm(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
  )},
], []);

const variantColumns = useMemo<ColumnDef<any>[]>(() => [
  { accessorKey: "name", header: "Nama Varian", cell: ({ row }) => <span className="uppercase font-black">{row.original.name}</span> },
  { id: "type", header: "Tipe & Sifat", cell: ({ row }) => (
      <div className="text-sm">
        <span className={`px-2 py-1 mr-2 border-2 border-black rounded-md ${row.original.type === "SINGLE_CHOICE" ? "bg-cyan-100" : "bg-purple-100"}`}>{row.original.type === "SINGLE_CHOICE" ? "Pilih Satu" : "Pilih Banyak"}</span>
        <span className={`px-2 py-1 border-2 border-black rounded-md ${row.original.isRequired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{row.original.isRequired ? "Wajib" : "Opsional"}</span>
      </div>
  )},
  { id: "options", header: "Jumlah Opsi", cell: ({ row }) => <span>{row.original.options?.length || 0} Opsi</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenEditVariant(row.original)}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="destructive" size="icon" onClick={() => setDeleteVariantConfirm(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
  )},
], []);
```

### 2. `customers/page.tsx`
```tsx
const columns = useMemo<ColumnDef<Customer>[]>(() => [
  { accessorKey: "name", header: "Nama Pelanggan", cell: ({ row }) => <span className="font-inter font-bold text-black">{row.original.name}</span> },
  { accessorKey: "phone", header: "Nomor HP", cell: ({ row }) => <span className="font-inter font-bold text-black">{row.original.phone}</span> },
  { accessorKey: "points", header: "Loyalty Points", cell: ({ row }) => <span className="px-2 py-1 bg-[#00E5FF] border-2 border-black rounded font-black text-xs">{row.original.points} Poin</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
  )},
], []);
```

### 3. `employees/page.tsx`
```tsx
const columns = useMemo<ColumnDef<User>[]>(() => [
  { accessorKey: "fullName", header: "Nama Lengkap", cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span> },
  { accessorKey: "username", header: "Username" },
  { accessorKey: "role", header: "Role", cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.role === 'SUPER_ADMIN' || row.original.role === 'MANAGER' ? <Shield className="h-4 w-4 text-blue-500" /> : <UserIcon className="h-4 w-4 text-green-500" />}
        <span className={row.original.role === 'SUPER_ADMIN' || row.original.role === 'MANAGER' ? 'text-blue-500 font-bold' : 'text-green-600 font-bold'}>{row.original.role}</span>
      </div>
  )},
  { accessorKey: "pin", header: "PIN", cell: () => <span className="font-mono">••••</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(row.original)} className="h-8 w-8"><Pencil className="h-4 w-4 text-orange-500" /></Button>
        <Button variant="outline" size="icon" onClick={() => handleDeleteRequest(row.original.id)} disabled={row.original.username === 'admin'} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash className="h-4 w-4" /></Button>
      </div>
  )},
], []);
```

### 4. `inventory/page.tsx`
```tsx
const materialColumns = useMemo<ColumnDef<RawMaterial>[]>(() => [
  { id: "icon", header: "", cell: () => <div className="w-10 h-10 bg-orange-100 border-2 border-black rounded flex items-center justify-center"><PackageOpen className="w-5 h-5 text-orange-600" /></div> },
  { accessorKey: "name", header: "Nama Bahan" },
  { accessorKey: "currentStock", header: "Stok Saat Ini", cell: ({ row }) => <span className={`px-3 py-1 border-2 border-black rounded text-sm ${row.original.currentStock <= 10 ? 'bg-red-200' : 'bg-green-200'}`}>{row.original.currentStock} {row.original.unit}</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button onClick={() => handleOpenEdit(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100"><Edit2 className="w-4 h-4"/></Button>
        <Button onClick={() => setDeleteConfirmId(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4"/></Button>
      </div>
  )},
], []);

const recipeColumns = useMemo<ColumnDef<any>[]>(() => [
  { id: "productName", header: "Menu (Produk)", cell: ({ row }) => {
      const prod = products.find(p => p.id === row.original.productId);
      return <span className="uppercase font-black">{prod?.name || 'Unknown Menu'}</span>;
  }},
  { id: "ingredientsCount", header: "Jumlah Bahan", cell: ({ row }) => <span className="font-bold text-gray-500">{row.original.ingredients.length} Bahan Baku di-link</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button onClick={() => handleOpenEditRecipe(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100"><Edit2 className="w-4 h-4"/></Button>
        <Button onClick={() => setDeleteRecipeConfirm(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4"/></Button>
      </div>
  )},
], [products]);
```

### 5. `users/page.tsx`
```tsx
const columns = useMemo<ColumnDef<User>[]>(() => [
  { accessorKey: "fullName", header: "Nama Lengkap", cell: ({ row }) => <span className="font-inter font-bold text-black">{row.original.fullName}</span> },
  { accessorKey: "username", header: "Username", cell: ({ row }) => <span className="font-inter font-bold text-black">{row.original.username}</span> },
  { accessorKey: "role", header: "Role", cell: ({ row }) => <span className={`px-2 py-1 border-2 border-black rounded uppercase font-black text-xs ${row.original.role === 'SUPER_ADMIN' ? 'bg-red-300' : row.original.role === 'MANAGER' ? 'bg-blue-300' : 'bg-green-300'}`}>{row.original.role.replace('_', ' ')}</span> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)} disabled={row.original.id === currentUser?.id}><Trash2 className="w-4 h-4" /></Button>
      </div>
  )},
], [currentUser]);
```

### 6. `audit/page.tsx`
```tsx
const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
  { accessorKey: "timestamp", header: "Waktu", cell: ({ row }) => <span className="font-inter font-bold text-black whitespace-nowrap">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(row.original.timestamp))}</span> },
  { id: "user", header: "Pengguna", cell: ({ row }) => <div className="flex flex-col"><span className="font-inter font-bold text-black">{row.original.userName}</span><span className="text-xs text-gray-500">{row.original.userRole}</span></div> },
  { accessorKey: "action", header: "Aksi", cell: ({ row }) => <span className="font-inter font-bold text-[#FF6321]">{row.original.action}</span> },
  { accessorKey: "details", header: "Detail", cell: ({ row }) => <span className="font-inter text-gray-700">{row.original.details}</span> },
], []);
```

### 7. `reports/page.tsx`
```tsx
const transactionColumns = useMemo<ColumnDef<Transaction>[]>(() => [
  { accessorKey: "timestamp", header: "Waktu", cell: ({ row }) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.original.timestamp)) },
  { accessorKey: "id", header: "ID Transaksi", cell: ({ row }) => <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />{row.original.id}</div> },
  { accessorKey: "cashierId", header: "Kasir", cell: ({ row }) => <span className="uppercase text-xs">{users.find(u => u.id === row.original.cashierId)?.fullName || row.original.cashierId}</span> },
  { accessorKey: "customerName", header: "Pelanggan", cell: ({ row }) => <span className="uppercase text-xs">{row.original.customerName || '-'}</span> },
  { accessorKey: "paymentMethod", header: "Metode", cell: ({ row }) => <span className="uppercase">{row.original.paymentMethod}</span> },
  { accessorKey: "total", header: () => <div className="text-right">Total</div>, cell: ({ row }) => <div className="text-right text-[#FF6321]">{formatRupiah(row.original.total)}</div> },
  { accessorKey: "status", header: () => <div className="text-center">Status</div>, cell: ({ row }) => <div className="text-center"><span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.original.status === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>{row.original.status}</span></div> },
  { id: "actions", header: () => <div className="text-right">Aksi</div>, cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        {row.original.status === 'COMPLETED' && (
          <Button onClick={() => setVoidConfirmId(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Void Transaksi"><Ban className="w-4 h-4"/></Button>
        )}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && (
          <Button onClick={() => {
             if (confirm('Hapus histori transaksi ini secara permanen?')) {
                useTransactionStore.getState().deleteTransaction?.(row.original.id);
                toast.success('Transaksi dihapus permanen');
             }
          }} className="p-2 border-2 border-black rounded bg-gray-100 hover:bg-gray-200 transition-colors" title="Hapus Permanen"><Trash2 className="w-4 h-4"/></Button>
        )}
      </div>
  )},
], [users, user]);

const shiftColumns = useMemo<ColumnDef<any>[]>(() => [
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.original.status === 'OPEN' ? 'bg-[#00E5FF] font-black' : 'bg-gray-200'}`}>{row.original.status}</span> },
  { accessorKey: "cashierId", header: "Kasir", cell: ({ row }) => <span className="uppercase">{users?.find(u => u.id === row.original.cashierId)?.fullName || row.original.cashierId}</span> },
  { id: "waktu", header: "Waktu", cell: ({ row }) => (
      <span className="text-xs text-gray-600">
         {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.original.startTime))}
         {' - '}
         {row.original.endTime ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.original.endTime)) : <span className="opacity-50">Sekarang</span>}
      </span>
  )},
  { accessorKey: "startingCash", header: () => <div className="text-right">Modal Awal</div>, cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.startingCash)}</div> },
  { id: "pendapatan", header: () => <div className="text-right">Pendapatan Tunai</div>, cell: ({ row }) => <div className="text-right text-green-600">{formatRupiah(Math.max(0, row.original.expectedEndingCash - row.original.startingCash))}</div> },
  { accessorKey: "expectedEndingCash", header: () => <div className="text-right">Sistem (Laci)</div>, cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.expectedEndingCash)}</div> },
  { accessorKey: "actualEndingCash", header: () => <div className="text-right">Fisik Aktual</div>, cell: ({ row }) => <div className="text-right">{row.original.actualEndingCash ? formatRupiah(row.original.actualEndingCash) : '-'}</div> },
  { id: "selisih", header: () => <div className="text-right">Selisih</div>, cell: ({ row }) => {
      if (row.original.status === 'OPEN') return <div className="text-right">-</div>;
      const selisih = row.original.actualEndingCash - row.original.expectedEndingCash;
      return <div className="text-right"><span className={cn("px-2 py-1 rounded-md border-2 border-black uppercase text-xs", selisih < 0 ? "bg-red-400 text-white" : selisih > 0 ? "bg-green-400 text-black" : "bg-white")}>{selisih > 0 ? '+' : ''}{formatRupiah(selisih)}</span></div>;
  }},
  { id: "setor", header: () => <div className="text-right">Wajib Setor</div>, cell: ({ row }) => {
      if (row.original.status === 'OPEN') return <div className="text-right">-</div>;
      const setor = row.original.actualEndingCash - row.original.startingCash;
      return <div className="text-right"><span className="font-black text-[#00E5FF] px-2 py-1 rounded-md border-2 border-black">{formatRupiah(setor)}</span></div>;
  }},
], [users]);

const analyticsColumns = useMemo<ColumnDef<any>[]>(() => [
  { accessorKey: "name", header: "Nama Menu" },
  { accessorKey: "soldQty", header: () => <div className="text-center">Terjual (Qty)</div>, cell: ({ row }) => <div className="text-center text-[#FF6321] text-lg">{row.original.soldQty}</div> },
  { accessorKey: "revenue", header: () => <div className="text-right">Total Pendapatan</div>, cell: ({ row }) => <div className="text-right text-black">{formatRupiah(row.original.revenue)}</div> },
], []);
```

## 5. Verification Method
- **Implementer Action:** Integrate these `useMemo` blocks into the respective `page.tsx` files.
- **Verification:** Import `ColumnDef` from `@tanstack/react-table`. Confirm that the state variables (e.g., `categories`, `handleOpenEditProduct`) referenced within the cells are accurately captured by the component's scope and included in the `useMemo` dependency array to prevent stale closures. Ensure `<DataTable>` renders flawlessly with the custom neobrutalism UI style on each page without breaking the original page state.
