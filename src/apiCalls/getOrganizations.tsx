//getOrganizations.tsx is used to get the first 100 organizations based on join date
//for the autocomplete when the user first focuses the input and opens the dropdown
import { Octokit } from '@octokit/core';
import { Endpoints } from '@octokit/types';

export const FIRST_ORGANIZATIONS = 'FIRST_ORGANIZATIONS';

export type ListOrganizationsResponse =
  Endpoints['GET /organizations']['response'];

const octokit = new Octokit({
  //auth: process.env.NEXT_PUBLIC_ACCESS_TOKEN_GITHUB, //token can enable more requests
});

export const getOrganizations = async ({
  per_page,
  since,
}: {
  per_page: number;
  since?: number;
}) => {
  //Try/Catch not needed because react-query handles it
  const data = await octokit.request('GET /organizations', {
    per_page,
    ...(since ? { since } : {}),
  });

  return data;
};
