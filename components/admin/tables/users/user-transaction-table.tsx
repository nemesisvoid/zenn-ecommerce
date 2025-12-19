'use client';

import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

interface UserTransactionTable<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
const UserTransactionTable = <TData, TValue>({ columns, data }: UserTransactionTable<TData, TValue>) => {
  const [columnVisibility, setColumnVisibility] = useState({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,

    state: {
      columnVisibility,
      pagination,
    },
  });

  // --- pagination helpers ---
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;
  const maxPagesToShow = 5; // adjust window size

  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (pageCount <= maxPagesToShow) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
      return pages;
    }

    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(pageCount - 1, currentPage + half);

    // adjust when close to edges
    if (currentPage - half < 0) {
      end = Math.min(pageCount - 1, end + (half - currentPage));
    }
    if (currentPage + half > pageCount - 1) {
      start = Math.max(0, start - (currentPage + half - (pageCount - 1)));
    }

    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push('...');
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < pageCount - 1) {
      if (end < pageCount - 2) pages.push('...');
      pages.push(pageCount - 1);
    }

    return pages;
  }, [pageCount, currentPage, maxPagesToShow]);

  return (
    <div className='pb-3'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className='text-[#5D7186] dark:text-[#AAB8C5] text-sm bg-[#FCFCFD] dark:bg-[#293038] px-5'>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className='text text-[#5D7186] dark:text-[#AAB8C5] text-xs bg-[#FCFCFD]dark:bg-[#293038 ] px-5 py-3'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='flex items-center justify-end gap-2 px-4 py-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          <ChevronLeftIcon className='mr-2 h-4 w-4' />
          Previous
        </Button>

        {/* numeric pager */}
        <div className='flex items-center justify-end  gap-1'>
          {pageNumbers.map((p, idx) =>
            p === '...' ? (
              <span
                key={`dots-${idx}`}
                className='px-3 py-1 text-sm text-muted-foreground'>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => table.setPageIndex(p as number)}
                className={`px-3 py-1 rounded-md text-sm ${
                  p === currentPage ? 'bg-primary text-white' : 'bg-transparent text-[#5D7186] hover:bg-gray-100'
                }`}
                aria-current={p === currentPage ? 'page' : undefined}>
                {(p as number) + 1}
              </button>
            )
          )}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          Next
          <ChevronRightIcon className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export default UserTransactionTable;
