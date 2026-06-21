# Handoff Report: Milestone 2 - Refactor backoffice tables to DataTable

## 1. Observation
- The `SCOPE.md` specifies replacing manual `<Table>` implementations with the newly created `DataTable` component.
- The `<DataTable>` component is already implemented in `components/ui/data-table.tsx`. It supports global search and sorting out of the box using TanStack Table.
- Multiple pages in `/app/(dashboard)/backoffice/*` currently manage search filtering (`filteredData = data.filter(...)`) and map through state arrays manually to render `<Table>`, `<TableHeader>`, and `<TableRow>`.
- These pages have custom action buttons in the last column (e.g., Edit, Delete, Void) which require access to component-level state and handlers (e.g., `handleOpenEdit`, `setDeleteId`).

## 2. Logic Chain
- To use `<DataTable>`, we must define a `columns` array (`ColumnDef<T>[]`) for each table.
- Because the action buttons need access to local state variables and handlers (like `handleOpenForm`, `setDeleteId`), the `columns` arrays should ideally be defined using `useMemo` inside the functional component. This acts as a closure and guarantees access to local handlers.
- Since `<DataTable>` has its own `globalFilter` state with an `<Input>` inside it, we can remove the manual `search` states, `<Search>` inputs from the pages, and the `filteredData` arrays. The raw `data` array can be passed directly to `<DataTable data={data} columns={columns} />`.
- For pages with tabs (e.g., Products, Inventory, Reports), we can render a specific `<DataTable>` for the active tab instead of having one big `<Table>` with conditional headers and bodies.

## 3. Caveats
- Some tables (like "PRODUCTS" tab) need data from multiple stores (e.g., mapping `categoryId` to `category.name`). We handle this cleanly in the column `cell` renderer by capturing the `categories` array from the outer scope via `useMemo` dependency array.
- The `DataTable` component already includes a search input. The existing search inputs in the pages should be deleted to prevent duplicate search bars.
- Sorting is enabled via `DataTableColumnHeader`. We need to use this component in the `header` definitions for columns that should be sortable.
- The shift tab in the reports page has a complex UI structure with a `currentShift` row merged with the rest of the array. It might be easier to convert only the Penjualan and Analitik tabs to `<DataTable>`, unless you merge `currentShift` into a unified `shiftData` array for Tanstack Table.

## 4. Conclusion
We will refactor all backoffice pages to remove manual `<Table>` mappings and replace them with `<DataTable>` and `ColumnDef`. Local `search` states and filtering logic will be removed entirely. Action buttons will be handled within the cell renderers in the `columns` array.

## 5. Verification Method
- After implementation, test each backoffice page visually.
- Verify that global search works correctly without the manual `search` state.
- Verify that action buttons (Edit, Delete, Void) open the correct dialogs and affect the correct row context.
- Verify sorting by clicking on column headers where `DataTableColumnHeader` is used.

---

# Implementation Strategy & Code Snippets

## 1. `app/(dashboard)/backoffice/products/page.tsx`
**Strategy:** 
Remove manual search state (`search`, `filteredProducts`, etc.). Remove the manual `<Search>` input since `DataTable` has one. Use conditional rendering for the three tabs. Define three sets of columns (`productColumns`, `categoryColumns`, `variantColumns`) inside the component using `useMemo` to capture handlers and `categories` array.

**Code Snippet:**
```tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";

// ... inside ProductsPage component
const productColumns = useMemo<ColumnDef<Product>[]>(() => [
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${type === 'COMBO' ? 'bg-[#FF90E8]' : 'bg-gray-200'}`}>
          {type}
        </span>
      );
    }
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Menu" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 border-2 border-black rounded-md flex items-center justify-center">
          <Coffee className="w-4 h-4 text-gray-500" />
        </div>
        {row.getValue("name")}
      </div>
    )
  },
  {
    accessorKey: "categoryId",
    header: "Kategori",
    cell: ({ row }) => {
      const cat = categories.find(c => c.id === row.getValue("categoryId"));
      return cat ? (
        <span className="px-2 py-1 text-xs border-2 border-black rounded-md uppercase" style={{ backgroundColor: cat.color }}>
          {cat.name}
        </span>
      ) : null;
    }
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Harga Dasar" />,
    cell: ({ row }) => (
      <div className="text-right text-[#FF6321]">{formatRupiah(row.getValue("basePrice"))}</div>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenEditProduct(row.original)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => setDeleteProductConfirm(row.original.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }
], [categories]);

// Similarly define categoryColumns and variantColumns...

// Replace Table with:
{activeTab === 'PRODUCTS' && <DataTable columns={productColumns} data={products} searchPlaceholder="Cari menu..." />}
{activeTab === 'CATEGORIES' && <DataTable columns={categoryColumns} data={categories} searchPlaceholder="Cari kategori..." />}
{activeTab === 'VARIANTS' && <DataTable columns={variantColumns} data={variants || []} searchPlaceholder="Cari varian..." />}
```

## 2. `app/(dashboard)/backoffice/customers/page.tsx`
**Strategy:**
Define `customerColumns` using `useMemo` to capture `handleOpenForm` and `setDeleteId`.

**Code Snippet:**
```tsx
const customerColumns = useMemo<ColumnDef<Customer>[]>(() => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Pelanggan" />,
    cell: ({ row }) => <span className="font-inter font-bold text-black">{row.getValue("name")}</span>
  },
  {
    accessorKey: "phone",
    header: "Nomor HP",
    cell: ({ row }) => <span className="font-inter font-bold text-black">{row.getValue("phone")}</span>
  },
  {
    accessorKey: "points",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loyalty Points" />,
    cell: ({ row }) => (
      <span className="px-2 py-1 bg-[#00E5FF] border-2 border-black rounded font-black text-xs">
        {row.getValue("points")} Poin
      </span>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }
], []);

// Usage:
<DataTable columns={customerColumns} data={customers} searchPlaceholder="Cari pelanggan..." />
```

## 3. `app/(dashboard)/backoffice/employees/page.tsx`
**Strategy:**
Define `employeeColumns` capturing handlers and `users` data.

**Code Snippet:**
```tsx
const employeeColumns = useMemo<ColumnDef<User>[]>(() => [
  {
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Lengkap" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("fullName")}</span>
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isAdmin = role === 'SUPER_ADMIN' || role === 'MANAGER';
      return (
        <div className="flex items-center gap-2">
          {isAdmin ? <Shield className="h-4 w-4 text-blue-500" /> : <UserIcon className="h-4 w-4 text-green-500" />}
          <span className={isAdmin ? 'text-blue-500 font-bold' : 'text-green-600 font-bold'}>{role}</span>
        </div>
      );
    }
  },
  {
    id: "pin",
    header: "PIN",
    cell: () => <span className="font-mono">••••</span>
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(row.original)} className="h-8 w-8">
          <Pencil className="h-4 w-4 text-orange-500" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => handleDeleteRequest(row.original.id)} 
          disabled={row.original.username === 'admin'}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    )
  }
], []);
```

## 4. `app/(dashboard)/backoffice/inventory/page.tsx`
**Strategy:**
Two tabs: "MATERIALS" and "RECIPES". Map the `productName` via `accessorFn` for the recipe columns so search works against the product name automatically.

**Code Snippet:**
```tsx
const materialColumns = useMemo<ColumnDef<RawMaterial>[]>(() => [
  {
    id: "icon",
    header: "",
    cell: () => (
      <div className="w-10 h-10 bg-orange-100 border-2 border-black rounded flex items-center justify-center">
        <PackageOpen className="w-5 h-5 text-orange-600" />
      </div>
    )
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Bahan" />,
  },
  {
    accessorKey: "currentStock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stok Saat Ini" />,
    cell: ({ row }) => (
      <span className={`px-3 py-1 border-2 border-black rounded text-sm ${row.original.currentStock <= 10 ? 'bg-red-200' : 'bg-green-200'}`}>
        {row.original.currentStock} {row.original.unit}
      </span>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button onClick={() => handleOpenEdit(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"><Edit2 className="w-4 h-4"/></Button>
        <Button onClick={() => setDeleteConfirmId(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4"/></Button>
      </div>
    )
  }
], []);

const recipeColumns = useMemo<ColumnDef<any>[]>(() => [
  {
    id: "productName",
    accessorFn: (row) => products.find(p => p.id === row.productId)?.name || 'Unknown Menu',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Menu (Produk)" />,
    cell: ({ row }) => <span className="uppercase font-black">{row.getValue("productName")}</span>
  },
  {
    id: "ingredientsCount",
    header: "Jumlah Bahan",
    cell: ({ row }) => <span className="font-bold text-gray-500">{row.original.ingredients.length} Bahan Baku di-link</span>
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button onClick={() => handleOpenEditRecipe(row.original)} className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors"><Edit2 className="w-4 h-4"/></Button>
        <Button onClick={() => setDeleteRecipeConfirm(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4"/></Button>
      </div>
    )
  }
], [products]);
```

## 5. `app/(dashboard)/backoffice/users/page.tsx`
**Strategy:**
Similar to `employees`, but this is specifically for users. Define `userColumns`.

**Code Snippet:**
```tsx
const userColumns = useMemo<ColumnDef<User>[]>(() => [
  {
    accessorKey: "fullName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Lengkap" />,
    cell: ({ row }) => <span className="font-inter font-bold text-black">{row.getValue("fullName")}</span>
  },
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    cell: ({ row }) => <span className="font-inter font-bold text-black">{row.getValue("username")}</span>
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <span className={`px-2 py-1 border-2 border-black rounded uppercase font-black text-xs ${role === 'SUPER_ADMIN' ? 'bg-red-300' : role === 'MANAGER' ? 'bg-blue-300' : 'bg-green-300'}`}>
          {role.replace('_', ' ')}
        </span>
      )
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button size="icon-sm" variant="outline" onClick={() => handleOpenForm(row.original)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="icon-sm" variant="destructive" onClick={() => setDeleteId(row.original.id)} disabled={row.original.id === currentUser?.id}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }
], [currentUser]);
```

## 6. `app/(dashboard)/backoffice/audit/page.tsx`
**Strategy:**
Define `auditColumns`.

**Code Snippet:**
```tsx
const auditColumns = useMemo<ColumnDef<AuditLog>[]>(() => [
  {
    accessorKey: "timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu" />,
    cell: ({ row }) => <span className="font-inter font-bold text-black whitespace-nowrap">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(row.getValue("timestamp")))}</span>
  },
  {
    accessorKey: "userName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pengguna" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-inter font-bold text-black">{row.getValue("userName")}</span>
        <span className="text-xs text-gray-500">{row.original.userRole}</span>
      </div>
    )
  },
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aksi" />,
    cell: ({ row }) => <span className="font-inter font-bold text-[#FF6321]">{row.getValue("action")}</span>
  },
  {
    accessorKey: "details",
    header: "Detail",
    cell: ({ row }) => <span className="font-inter text-gray-700">{row.getValue("details")}</span>
  }
], []);
```

## 7. `app/(dashboard)/backoffice/reports/page.tsx`
**Strategy:**
Define `transactionColumns`, and `analyticsColumns`. For the "Shift" tab, you may want to keep the manual render since it includes a highly-specific `currentShift` top row, or use DataTable if merging is preferred. 

**Code Snippet:**
```tsx
const transactionColumns = useMemo<ColumnDef<any>[]>(() => [
  {
    accessorKey: "timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu" />,
    cell: ({ row }) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.getValue("timestamp")))
  },
  {
    accessorKey: "id",
    header: "ID Transaksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-500" />
        {row.getValue("id")}
      </div>
    )
  },
  {
    accessorKey: "cashierId",
    header: "Kasir",
    cell: ({ row }) => <span className="uppercase text-xs">{users.find(u => u.id === row.getValue("cashierId"))?.fullName || row.getValue("cashierId")}</span>
  },
  {
    accessorKey: "customerName",
    header: "Pelanggan",
    cell: ({ row }) => <span className="uppercase text-xs">{row.getValue("customerName") || '-'}</span>
  },
  {
    accessorKey: "paymentMethod",
    header: "Metode",
    cell: ({ row }) => <span className="uppercase">{row.getValue("paymentMethod")}</span>
  },
  {
    accessorKey: "total",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => <div className="text-right text-[#FF6321]">{formatRupiah(row.getValue("total"))}</div>
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-center">
        <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.getValue("status") === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>
          {row.getValue("status")}
        </span>
      </div>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        {row.getValue("status") === 'COMPLETED' && (
          <Button onClick={() => setVoidConfirmId(row.original.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Void Transaksi">
            <Ban className="w-4 h-4"/>
          </Button>
        )}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && (
          <Button onClick={() => {
             if (confirm('Hapus histori transaksi ini secara permanen?')) {
                useTransactionStore.getState().deleteTransaction?.(row.original.id);
                toast.success('Transaksi dihapus permanen');
             }
          }} className="p-2 border-2 border-black rounded bg-gray-100 hover:bg-gray-200 transition-colors" title="Hapus Permanen">
            <Trash2 className="w-4 h-4"/>
          </Button>
        )}
      </div>
    )
  }
], [users, user]);

const analyticsColumns = useMemo<ColumnDef<any>[]>(() => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Menu" />
  },
  {
    accessorKey: "soldQty",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Terjual (Qty)" />,
    cell: ({ row }) => <div className="text-center text-[#FF6321] text-lg">{row.getValue("soldQty")}</div>
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Pendapatan" />,
    cell: ({ row }) => <div className="text-right text-black">{formatRupiah(row.getValue("revenue"))}</div>
  }
], []);
```
