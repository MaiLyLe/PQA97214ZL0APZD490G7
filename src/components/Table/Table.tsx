'use client';

/*
  Generic Table component based on react-table v8
*/
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Rings } from 'react-loader-spinner';

import 'tippy.js/dist/tippy.css';

import { RowLoader } from '@/components/RowLoader';

export type TableProps<T extends { url?: string }> = {
  data: T[];
  columns: ColumnDef<T>[];
  isFetching?: boolean;
  notFoundMessage: string;
};

export const Table = <T extends { url?: string }>({
  data,
  columns,
  isFetching,
  notFoundMessage,
}: TableProps<T>) => {
  const tableInstance = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='relative h-screen w-full pt-24'>
      {isFetching ? (
        <div className='absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center'>
          <Rings
            height='200'
            width='200'
            color='black'
            radius='300'
            visible={true}
            ariaLabel='rings-loading'
          />
        </div>
      ) : null}
      <table className='w-full table-fixed border-separate border-spacing-x-0  border-spacing-y-3	'>
        <thead>
          {tableInstance.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className='h-16 w-full px-4 pt-6'>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className='!sticky !top-0 z-10 bg-black text-white first:rounded-tl-xl last:rounded-tr-xl'
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={clsx(isFetching && 'pointer-events-none')}>
          {tableInstance.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={clsx(
                  'hover:bg-primary-pink outline-grey-medium h-24 w-full cursor-pointer rounded-xl shadow-md outline outline-1 transition-all duration-150 hover:scale-[101%] hover:rounded-xl hover:outline-0',
                  isFetching && 'bg-grey-super-light pointer-events-none'
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {row.original?.url ? (
                        <Link href={row.original.url} key={cell.id}>
                          <div className='w-full'>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </Link>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isFetching && data?.length === 0 ? (
        <RowLoader />
      ) : data?.length === 0 ? (
        <div className='border-grey-medium mb-8 flex h-64 w-full items-center justify-center rounded-xl border shadow-md'>
          {notFoundMessage}
        </div>
      ) : (
        //pagination
        <div className='mb-12 mt-4 flex w-full items-center gap-2 bg-white'>
          {/* First page */}
          <button
            className='pagination-button'
            onClick={() => tableInstance.setPageIndex(0)}
            disabled={!tableInstance.getCanPreviousPage()}
          >
            <span>
              <ChevronFirst />
            </span>
          </button>

          {/* Prev page */}
          <button
            className='pagination-button'
            onClick={() => tableInstance.previousPage()}
            disabled={!tableInstance.getCanPreviousPage()}
          >
            <span>
              <ChevronLeft />
            </span>
          </button>

          {/* Next page */}
          <button
            className='pagination-button'
            onClick={() => {
              tableInstance.nextPage();
            }}
            disabled={!tableInstance.getCanNextPage()}
          >
            <span>
              <ChevronRight />
            </span>
          </button>

          {/* Last page */}
          <button
            className='pagination-button'
            onClick={() => {
              tableInstance.setPageIndex(tableInstance.getPageCount());
            }}
            disabled={!tableInstance.getCanNextPage()}
          >
            <span>
              <ChevronLast />
            </span>
          </button>
          <span className='flex items-center gap-1'>
            <div>Page</div>
            {tableInstance.getState().pagination.pageIndex + 1} of{' '}
            {tableInstance.getPageCount()}
          </span>
          <span className='relative flex items-center gap-1'>
            <span className='inline-block w-32'> | Go to page:</span>
            <span className='w-32'>
              <input
                className='input'
                type='number'
                defaultValue={tableInstance.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  tableInstance.setPageIndex(page);
                }}
              />
            </span>
            <span className='w-32'>
              <select
                className='input'
                value={tableInstance.getState().pagination.pageSize}
                onChange={(e) => {
                  tableInstance.setPageSize(Number(e.target.value));
                }}
              >
                {[5, 10].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
