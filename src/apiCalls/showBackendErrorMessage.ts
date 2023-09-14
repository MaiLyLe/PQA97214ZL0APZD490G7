import { toast } from 'react-toastify';

//TODO: write more understandable messages for different statuses
const getMessage = (status?: number) => {
  switch (status) {
    case 403:
      return 'Calm your horses, Cowboy. ;) Rate limit exceeded. Try again later.';
    case 404:
      return 'Not found. Try other search values or try again later.';
    case 429:
      return 'Nothing found based on your filtering values. Try searching and filtering for other values.';
    default:
      return 'HTTP error. Try again later.';
  }
};

//TODO: get type for error from octokit
export const showBackendErrorMessage = (error: any) => {
  toast.error(`${getMessage(error?.response?.status)}`, {
    toastId: 'backendErrorMessage',
  });
};
