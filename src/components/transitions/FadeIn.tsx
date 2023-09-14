import { Transition } from '@headlessui/react';
type FadeInProps = {
  isShowing: boolean;
  children: React.ReactNode;
  isSlow?: boolean;
};

export const FadeIn = ({ isShowing, children, isSlow }: FadeInProps) => {
  return (
    <Transition
      show={isShowing}
      enter={
        isSlow
          ? 'transition-opacity duration-75'
          : 'transition-opacity duration-1000'
      }
      enterFrom='opacity-0'
      enterTo='opacity-100'
      leave='transition-opacity duration-0'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
    >
      {children}
    </Transition>
  );
};
