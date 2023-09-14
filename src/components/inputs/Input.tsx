/*
  Input controlled by react-hook-form
*/
import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import * as React from 'react';
import { type RegisterOptions, useFormContext } from 'react-hook-form';

export type InputProps = {
  name: string;
  hasInitialValue?: boolean;
  legend: string;
  rules?: RegisterOptions;
} & React.ComponentPropsWithRef<'input'>;

export const Input = ({
  name,
  legend,
  disabled,
  rules,
  ...rest
}: InputProps) => {
  //thanks to <FormProvider/> we can access react-hook-form functionaliy with useFormcontext
  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <fieldset className='text-grey-dark relative w-full'>
      <div className='relative'>
        <label className='input-label'>{legend}</label>
        <input
          {...rest}
          className={clsx(
            'input absolute',
            disabled
              ? 'pointer-events-none'
              : errors?.[name]
              ? 'border-primary-red focus:border-primary-red'
              : 'border-grey-medium'
          )}
          {...rest}
          {...(register &&
            register(name, {
              ...(rules || {}),
            }))}
        ></input>
      </div>
      {!disabled && (
        <ErrorMessage
          errors={errors}
          name={name as any}
          render={({ message }) => <p className='error-message'>{message}</p>}
        />
      )}
    </fieldset>
  );
};
