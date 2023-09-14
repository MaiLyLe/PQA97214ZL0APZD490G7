'use client';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { useMemo } from 'react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ToastContainer } from 'react-toastify';
import { IGithubFiltering, IRepository } from 'types';

import { AutoCompleteInput } from '@/components/inputs/AutocompleteInput';
import { Input } from '@/components/inputs/Input';
import { Table } from '@/components/Table/Table';
import { FadeIn } from '@/components/transitions/FadeIn';

import { ListOrganizationsResponse } from '@/apiCalls/getOrganizations';
import { FIRST_ORGANIZATIONS } from '@/apiCalls/getOrganizations';
import {
  getOrganizationsByQParam,
  ORGANIZATIONS_BY_Q_PARAM,
} from '@/apiCalls/getOrganizationsByQParam';
import {
  REPOSITORIES,
  searchRepositories,
} from '@/apiCalls/searchRepositories';
import { showBackendErrorMessage } from '@/apiCalls/showBackendErrorMessage';

import { columns } from './columns';

export const TableOverview = () => {
  const queryClient = useQueryClient();

  const firstOrganizations: ListOrganizationsResponse | undefined =
    queryClient.getQueryData([FIRST_ORGANIZATIONS]);

  const { register, watch, getValues, setError, formState, ...rest } =
    useForm<IGithubFiltering>({
      criteriaMode: 'all',
      mode: 'onChange', //react-hook-form should validate onChange
    });

  const { errors, isValid, isValidating } = formState;
  const formData = watch();

  //TODO: find type from octokit
  const { isFetching, data } = useQuery<any>(
    [REPOSITORIES, formData?.organization?.value], //if organization changes, refetch
    () =>
      searchRepositories({
        organization: formData?.organization?.value,
      }),
    {
      enabled: !!formData?.organization?.value && isValid && !isValidating,
      staleTime: 60000,
      refetchOnWindowFocus: false,
      onError: (error: any) => {
        showBackendErrorMessage(error);
      },
    }
  );

  const filteredTableData: IRepository[] = useMemo(() => {
    /*repositories are filtered by name and by issue number only with a useMemo
      because the repositories returned from github are complete
      this way we prevent fetching too often*/
    if (!data) {
      return [];
    }
    const tableData = data?.map((repo: any) => ({
      name: repo.name,
      issues: repo.open_issues,
      stars: repo.stargazers_count,
      url: repo.html_url,
    }));

    /*filter by repo name: fuzzy search to also show similar names*/
    const fuse = new Fuse(tableData, { keys: ['name'] });
    let filteredData =
      formData?.repositoryName && !isValidating
        ? fuse
            .search(formData?.repositoryName)
            ?.map((fuseResult) => fuseResult.item)
        : tableData;

    /*filter by issue number: only apply the min and the max if form errors are not there
      and also only if the form is not validating*/
    filteredData = filteredData.filter(
      (repo: IRepository) =>
        ((!!errors.numberOfIssuesMin && !isValidating) ||
          repo.issues >= parseInt(formData?.numberOfIssuesMin || '0')) &&
        ((!!errors.numberOfIssuesMax && !isValidating) ||
          repo.issues <=
            parseInt(
              formData?.numberOfIssuesMax || Number.MAX_SAFE_INTEGER.toString()
            ))
    );
    return filteredData;
  }, [
    errors,
    isValidating,
    formData.repositoryName,
    formData.numberOfIssuesMax,
    formData.numberOfIssuesMin,
    data,
  ]);

  return (
    <div className='relative w-full'>
      <ToastContainer />
      <FormProvider
        {...{
          register,
          watch,
          getValues,
          setError,
          formState,
          ...rest,
        }}
      >
        <form className='mb-4'>
          <FadeIn isShowing={getValues('organization') === undefined}>
            <h1 className='mt-[20vh] pr-12 text-left'>
              Welcome. <br /> Browse through an organization's repositories.
              Start by selecting an organization first
            </h1>
            <div className='mt-8 w-96'>
              {/* The first organization autocomplete fades away
               if you select an organization and unregisters after unmount */}
              <AutoCompleteInput<IGithubFiltering>
                name='organization'
                shouldUnregister={true}
                defaultOptions={firstOrganizations?.data?.map((item) => ({
                  value: item.login,
                  label: item.login,
                }))}
                legend='Organization'
                placeholder='Type in org name'
                notFoundMessage='No organization with this name found.'
                fetchFunction={{
                  queryKey: [ORGANIZATIONS_BY_Q_PARAM],
                  function: getOrganizationsByQParam,
                }}
              />
            </div>
          </FadeIn>
          <FadeIn isShowing={getValues('organization') !== undefined}>
            <div className='grid w-full grid-cols-[1fr_1fr_0.5fr_0.5fr] gap-4'>
              <AutoCompleteInput<IGithubFiltering>
                name='organization'
                defaultOptions={firstOrganizations?.data?.map((item) => ({
                  value: item.login,
                  label: item.login,
                }))}
                required={true}
                legend='Organization'
                placeholder='Type in org name'
                notFoundMessage='No organization with this name found.'
                fetchFunction={{
                  queryKey: [ORGANIZATIONS_BY_Q_PARAM],
                  function: getOrganizationsByQParam,
                }}
              />

              <Input
                name='repositoryName'
                placeholder='Type in repository name'
                legend='Repository'
              />
              <Input
                name='numberOfIssuesMin'
                legend='Minimum number of issues'
                placeholder='E.g. 10'
                rules={{
                  pattern: {
                    value: /^\d*[0-9]\d*$/i,
                    message: 'Must be a positive non-decimal number',
                  },
                  //the error only shows are is activated
                  //if every conditional clause before the errormessage fails
                  validate: {
                    moreThanMax: (v) =>
                      v === '' ||
                      v === undefined ||
                      isNaN(
                        parseInt(
                          getValues('numberOfIssuesMax') ||
                            Number.MAX_SAFE_INTEGER.toString()
                        )
                      ) ||
                      parseInt(v) <=
                        parseInt(
                          getValues('numberOfIssuesMax') ||
                            Number.MAX_SAFE_INTEGER.toString()
                        ) ||
                      "Can't be more than maximum number of issues",
                  },
                }}
              />
              <Input
                name='numberOfIssuesMax'
                legend='Maximum number of issues'
                placeholder='E.g. 100'
                rules={{
                  pattern: {
                    value: /^\d*[0-9]\d*$/i,
                    message: 'Must be a positive non-decimal number',
                  },
                  //the error only shows are is activated
                  //if every conditional clause before the errormessage fails
                  validate: {
                    lessThanMin: (v) =>
                      v === '' ||
                      v === undefined ||
                      isNaN(parseInt(getValues('numberOfIssuesMin') || '0')) ||
                      parseInt(v) >=
                        parseInt(getValues('numberOfIssuesMin') || '0') ||
                      "Can't be less than min number of issues",
                  },
                }}
              />
            </div>
          </FadeIn>
        </form>
      </FormProvider>
      <FadeIn isShowing={!!getValues('organization')} isSlow>
        <Table
          columns={columns}
          data={filteredTableData}
          isFetching={isFetching}
          notFoundMessage='No public repositories found'
        />
      </FadeIn>
    </div>
  );
};
