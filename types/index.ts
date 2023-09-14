export interface IGithubFiltering {
  organization: { label: string; value: string };
  repositoryName?: string;
  numberOfIssuesMin?: string;
  numberOfIssuesMax?: string;
}

export interface IRepository {
  name: string;
  issues: number;
  stars: number;
  url: string;
}
