/*
  This function looks for repos by organization name
*/
import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';

export const REPOSITORIES = 'REPOSITORIES';

const MyOctokit = Octokit.plugin(paginateRest);
const octokit = new MyOctokit({
  auth: process.env.NEXT_PUBLIC_ACCESS_TOKEN_GITHUB, //token can enable more requests
});

interface IRepositorySearchOptions {
  organization: string;
}

export async function searchRepositories({
  organization,
}: IRepositorySearchOptions) {
  //Try/Catch not needed because react-query handles it
  const query = `org:${organization} is:public`;

  const response = await octokit.paginate('GET /search/repositories', {
    q: query,
  });

  return response;
}
