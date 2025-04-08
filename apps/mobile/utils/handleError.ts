import {Dispatch, SetStateAction} from 'react';

export function handleError(
  errorMessage: string,
  setError: Dispatch<SetStateAction<string | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  duration = 3000,
) {
  setLoading(false);
  setError(errorMessage);
  setTimeout(() => {
    setError(null);
  }, duration);
}
