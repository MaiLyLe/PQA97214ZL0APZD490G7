/* 
  For those who are not familiar with Next.js, this is a sever component
  if you don't use "use client", then it is automatically a server component
*/

import { dehydrate } from '@tanstack/query-core';
import Head from 'next/head';
import * as React from 'react';

import getQueryClient from '@/lib/react-query/getQueryClient';
import Hydrate from '@/lib/react-query/hydrate.client';

import {
  FIRST_ORGANIZATIONS,
  getOrganizations,
} from '@/apiCalls/getOrganizations';
import { TableOverview } from '@/app/table-overview/table-overview';

export default async function TablePage() {
  const queryClient = getQueryClient();

  //we server-prefetch the first 30 organizations to showcase them in the autocomplete
  await queryClient.prefetchQuery(
    [FIRST_ORGANIZATIONS],
    () => getOrganizations({ per_page: 30 }),
    { staleTime: 60000 }
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <main>
      <Head>
        <title>Github Repository Searcher</title>
      </Head>
      <section className='bg-white'>
        <div className='layout relative flex min-h-screen flex-col items-center pb-12 pt-24 text-center'>
          {/* react query will provide the prefetched state with hydration */}
          <Hydrate state={dehydratedState}>
            <TableOverview />
          </Hydrate>
        </div>
      </section>
    </main>
  );
}
