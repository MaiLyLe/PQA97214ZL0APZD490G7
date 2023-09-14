/*
  Function to get organizations by query param, important for autocomplete
*/
import { Octokit } from '@octokit/core';

export const ORGANIZATIONS_BY_Q_PARAM = 'ORGANIZATIONS_BY_Q_PARAM';

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_ACCESS_TOKEN_GITHUB, //token can enable more requests
});

export const getOrganizationsByQParam = async ({ q }: { q: string }) => {
  const data = await octokit.request('GET /search/users', {
    type: 'org',
    q: q,
  });

  return data.data.items.map((item) => {
    return {
      label: item.login,
      value: item.login,
    };
  });
};
