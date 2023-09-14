/* 
  Input component that combines react-hook-form with the headlessui Combobox.
*/
import { Combobox } from '@headlessui/react';
import { ErrorMessage } from '@hookform/error-message';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import type { FieldValues, Path } from 'react-hook-form';
import { useController, useFormContext } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { RowLoader } from '@/components/RowLoader';

import { showBackendErrorMessage } from '@/apiCalls/showBackendErrorMessage';

type Option = {
  label: string;
  value: string;
};
type AutoCompleteInputProps = {
  shouldUnregister?: boolean;
  notFoundMessage: string;
  legend: string;
  defaultOptions?: Option[];
  fetchFunction: {
    queryKey: string[];
    function: (param: { q: string }) => Promise<Option[]>;
  };
} & React.ComponentPropsWithRef<'input'>;

export type FormAutoCompleteInputProps<T extends FieldValues> = {
  name: Path<T>; //name of the input cannot be any string
} & Omit<AutoCompleteInputProps, 'name'>;

export const AutoCompleteInput = <T extends FieldValues>({
  type,
  disabled,
  maxLength,
  required,
  name,
  defaultOptions,
  placeholder,
  notFoundMessage,
  shouldUnregister,
  legend,
  fetchFunction,
  ...rest
}: FormAutoCompleteInputProps<T>) => {
  const [displayedOptions, setDisplayedOptions] = useState<Option[]>(
    defaultOptions || []
  );
  const {
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useFormContext();

  //TODO: do research on whether useController is really needed here
  //there is a high possibility that useFormContext is enough
  const { field } = useController({
    name,
    control,
    rules: {
      required,
      ...({ shouldUnregister } || {}), //means: input is ignored by react-hook-form on onMount if true
    },
  });

  const [query, setQuery] = useState(field?.value?.value || '');
  //let's debounce the query to avoid unnecessary requests
  const [debouncedValue] = useDebounce(query, 300);

  //fetches options for the autocomplete dropdown
  const queryReturnvalues = useQuery(
    [...fetchFunction.queryKey, debouncedValue],
    () => fetchFunction.function({ q: debouncedValue }),
    {
      staleTime: 10,
      enabled: !!debouncedValue,
      onSuccess: (data: Option[]) => {
        setDisplayedOptions(data);
      },
      onError: (error: any) => {
        showBackendErrorMessage(error);
        if (!displayedOptions.length) {
          setDisplayedOptions(defaultOptions || []);
        }
      },
    }
  );

  //defaultValues can be fetched beforehand or even on the server because they are static
  const [selectedOption, setSelectedOption] = useState(
    field.value || displayedOptions?.[0] || []
  );

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    if (required && event.target.value === '') {
      setError(name, { message: `Field ${name} is required` });
    } else {
      clearErrors(name);
    }
  };

  const onSelectedOptionChange = (option: Option) => {
    //value is only set if user selects an option, not if they type in the input
    setSelectedOption(option);
    field.onChange(option);
    clearErrors(name);
  };
  return (
    <>
      <fieldset className='text-grey-dark relative w-full'>
        <div className={clsx(`relative`)}>
          <label className={clsx(`input-label`)}>{legend}</label>
          <Combobox value={selectedOption} onChange={onSelectedOptionChange}>
            <Combobox.Input
              {...rest}
              onBlur={() => {
                clearErrors(name);
              }}
              onFocus={(event) => {
                event.target.select();
              }}
              //headless UI https://headlessui.com/react/combobox uses it like this
              //but the typing is not flexibel enough to allow options that are not strings
              displayValue={(option) =>
                field.value === undefined
                  ? placeholder || ''
                  : (option as unknown as Option).label
              }
              className={clsx(
                'input absolute',
                disabled
                  ? 'pointer-events-none'
                  : errors?.[name]
                  ? 'border-primary-red focus:border-primary-red'
                  : 'border-grey-medium'
              )}
              name={field.name}
              type={type}
              maxLength={maxLength}
              required={required}
              onChange={onInputChange}
              ref={field.ref}
            />

            <Combobox.Options
              className={clsx(
                'absolute left-0 right-0 top-[88px] z-20 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none  sm:text-sm'
              )}
            >
              {queryReturnvalues.isFetching ? (
                <div className='p-2'>
                  <RowLoader />
                </div>
              ) : displayedOptions.length === 0 ? (
                <div className='relative left-0 right-0 top-0 flex h-40 cursor-default select-none items-center  justify-center rounded-md px-2 py-2 text-gray-700'>
                  {notFoundMessage}
                </div>
              ) : (
                displayedOptions.map(
                  (option: { label: string; value: string }) => (
                    <Combobox.Option
                      key={option.label}
                      value={option}
                      className={({ active }) =>
                        clsx(
                          'relative h-10 cursor-default select-none py-2 pl-3 pr-4 text-left  hover:text-black focus:text-black',
                          active ? 'bg-grey-light text-black' : 'text-grey-dark'
                        )
                      }
                    >
                      {option.label}
                    </Combobox.Option>
                  )
                )
              )}
            </Combobox.Options>
          </Combobox>
        </div>
        {!disabled && (
          <ErrorMessage
            errors={errors}
            name={name as any}
            render={({ message }) => <p className='error-message'>{message}</p>}
          />
        )}
      </fieldset>
    </>
  );
};
