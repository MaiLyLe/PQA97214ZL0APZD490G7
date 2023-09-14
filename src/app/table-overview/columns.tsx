/*
  Columns for the table, shaped to fit react-table v8
*/

import { ColumnDef } from '@tanstack/react-table';
import { BadgeAlert, FolderGit2, Star } from 'lucide-react';
import { IRepository } from 'types';

export const columns: ColumnDef<IRepository>[] = [
  {
    cell: (info) => info.getValue(),
    accessorKey: 'name',
    id: 'name',
    header: () => (
      <div className='flex items-center justify-center'>
        <FolderGit2 className='mr-1' />
        <span>Repository Name</span>
      </div>
    ),
    footer: (props) => props.column.id,
  },
  {
    accessorKey: 'issues',
    id: 'issues',
    cell: (info) => info.getValue(),
    header: () => (
      <div className='flex items-center justify-center'>
        <BadgeAlert className='mr-1' />
        <span>Number of Issues</span>
      </div>
    ),
    footer: (props) => props.column.id,
  },
  {
    id: 'stars',
    accessorKey: 'stars',
    cell: (info) => info.getValue(),
    header: () => (
      <div className='flex items-center justify-center'>
        <Star className='mr-1' /> <span>Number of Stars</span>
      </div>
    ),
    footer: (props) => props.column.id,
  },
];
