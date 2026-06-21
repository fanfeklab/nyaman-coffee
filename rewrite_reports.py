import re

with open('app/(dashboard)/backoffice/reports/page.tsx', 'r') as f:
    content = f.read()

# Replace Table imports
content = re.sub(
    r"import \{ Table, TableBody, TableCell, TableHead, TableHeader, TableRow \} from '@/components/ui/table';\n",
    r"import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';\nimport { ColumnDef } from '@tanstack/react-table';\n",
    content
)

# Add useMemo if not imported
if "useMemo" not in content.splitlines()[0]: # it might be in import React...
    content = re.sub(
        r"import React, \{ useState, useEffect \} from 'react';",
        r"import React, { useState, useEffect, useMemo } from 'react';",
        content
    )

# Now we need to add the definitions of the columns.
# We'll inject them before `const handleExportCSV = () => {`
transaction_columns = """
  const transactionColumns = useMemo<ColumnDef<Transaction>[]>(() => [
    { accessorKey: 'timestamp', header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu" />, cell: ({ row }) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.original.timestamp)) },
    { accessorKey: 'id', header: ({ column }) => <DataTableColumnHeader column={column} title="ID Transaksi" />, cell: ({ row }) => <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" />{row.original.id}</div> },
    { accessorKey: 'cashierId', header: ({ column }) => <DataTableColumnHeader column={column} title="Kasir" />, cell: ({ row }) => <span className="uppercase text-xs">{users.find(u => u.id === row.original.cashierId)?.fullName || row.original.cashierId}</span> },
    { accessorKey: 'customerName', header: ({ column }) => <DataTableColumnHeader column={column} title="Pelanggan" />, cell: ({ row }) => <span className="uppercase text-xs">{row.original.customerName || '-'}</span> },
    { accessorKey: 'paymentMethod', header: ({ column }) => <DataTableColumnHeader column={column} title="Metode" />, cell: ({ row }) => <span className="uppercase">{row.original.paymentMethod}</span> },
    { accessorKey: 'total', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Total" /></div>, cell: ({ row }) => <div className="text-right text-[#FF6321]">{formatRupiah(row.original.total)}</div> },
    { accessorKey: 'status', header: ({ column }) => <div className="flex justify-center"><DataTableColumnHeader column={column} title="Status" /></div>, cell: ({ row }) => <div className="text-center"><span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${row.original.status === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>{row.original.status}</span></div> },
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
"""

shift_columns = """
  const shiftColumns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => {
        if (row.original.id === 'current') return <span className="px-2 py-1 text-xs border-2 border-black rounded-md bg-[#00E5FF] font-black">OPEN</span>;
        return <span className="px-2 py-1 text-xs border-2 border-black rounded-md bg-gray-200">{row.original.status}</span>;
    } },
    { accessorKey: 'cashierId', header: ({ column }) => <DataTableColumnHeader column={column} title="Kasir" />, cell: ({ row }) => <span className="uppercase">{users?.find(u => u.id === row.original.cashierId)?.fullName || row.original.cashierId}</span> },
    { accessorKey: 'startTime', header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu" />, cell: ({ row }) => {
        if (row.original.id === 'current') return <>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.original.startTime))} - <span className="opacity-50">Sekarang</span></>;
        return <>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.original.startTime))} - {row.original.endTime ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(row.original.endTime)) : 'N/A'}</>;
    } },
    { accessorKey: 'startingCash', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Modal Awal" /></div>, cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.startingCash)}</div> },
    { id: 'pendapatanTunai', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Pendapatan Tunai" /></div>, cell: ({ row }) => {
        if (row.original.id === 'current') return <div className="text-right text-green-600">{formatRupiah(row.original.expectedEndingCash - row.original.startingCash)}</div>;
        return <div className="text-right text-green-600">{formatRupiah(Math.max(0, row.original.expectedEndingCash - row.original.startingCash))}</div>;
    } },
    { accessorKey: 'expectedEndingCash', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Sistem (Laci)" /></div>, cell: ({ row }) => <div className="text-right">{formatRupiah(row.original.expectedEndingCash)}</div> },
    { accessorKey: 'actualEndingCash', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Fisik Aktual" /></div>, cell: ({ row }) => {
        if (row.original.id === 'current') return <div className="text-right">-</div>;
        return <div className="text-right">{formatRupiah(row.original.actualEndingCash)}</div>;
    } },
    { id: 'selisih', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Selisih" /></div>, cell: ({ row }) => {
        if (row.original.id === 'current') return <div className="text-right">-</div>;
        const selisih = row.original.actualEndingCash - row.original.expectedEndingCash;
        return <div className="text-right"><span className={cn("px-2 py-1 rounded-md border-2 border-black uppercase text-xs", selisih < 0 ? "bg-red-400 text-white" : selisih > 0 ? "bg-green-400 text-black" : "bg-white")}>{selisih > 0 ? '+' : ''}{formatRupiah(selisih)}</span></div>;
    } },
    { id: 'wajibSetor', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Wajib Setor" /></div>, cell: ({ row }) => {
        if (row.original.id === 'current') return <div className="text-right">-</div>;
        const setor = row.original.actualEndingCash - row.original.startingCash;
        return <div className="text-right"><span className="font-black text-[#00E5FF] px-2 py-1 rounded-md border-2 border-black">{formatRupiah(setor)}</span></div>;
    } }
  ], [users]);
"""

analytics_columns = """
  const topSellingColumns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Menu" />, cell: ({ row }) => row.original.name },
    { accessorKey: 'soldQty', header: ({ column }) => <div className="flex justify-center"><DataTableColumnHeader column={column} title="Terjual (Qty)" /></div>, cell: ({ row }) => <div className="text-center text-[#FF6321] text-lg font-bold">{row.original.soldQty}</div> },
    { accessorKey: 'revenue', header: ({ column }) => <div className="flex justify-end"><DataTableColumnHeader column={column} title="Total Pendapatan" /></div>, cell: ({ row }) => <div className="text-right text-black">{formatRupiah(row.original.revenue)}</div> }
  ], []);
"""

content = content.replace("  const handleExportCSV = () => {", transaction_columns + shift_columns + analytics_columns + "\n  const handleExportCSV = () => {")

# For transaction table replacement:
# Find:
#          <div className="overflow-x-auto border-4 border-black rounded-xl">
#            <Table> ... </Table>
#          </div>

table1_regex = re.compile(r'<div className="overflow-x-auto border-4 border-black rounded-xl">\s*<Table>.*?<\/Table>\s*<\/div>', re.DOTALL)
tables = table1_regex.findall(content)

if len(tables) >= 3:
    content = content.replace(tables[0], '<DataTable columns={transactionColumns} data={filteredData} searchPlaceholder="Cari transaksi..." />')
    # Combine currentShift and shiftHistory into one data array
    shift_data_prep = """
                  <DataTable 
                    columns={shiftColumns} 
                    data={currentShift ? [{...currentShift, id: 'current'}, ...shiftHistory] : shiftHistory} 
                    searchPlaceholder="Cari histori shift..." 
                  />
    """
    content = content.replace(tables[1], shift_data_prep.strip())
    content = content.replace(tables[2], '<DataTable columns={topSellingColumns} data={topSelling} searchPlaceholder="Cari menu..." />')
else:
    print("Could not find 3 tables. Found:", len(tables))

with open('app/(dashboard)/backoffice/reports/page.tsx', 'w') as f:
    f.write(content)
