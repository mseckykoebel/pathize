import {useState, useEffect, useCallback} from 'react';
import {fetcher} from '../utils/fetcher';
import {useAuth} from '../CoreNav';

/**
 * @description - light wrapper over fetcher that checks the status of the userId and accessToken in async storage. if a 403 is returned, we must log the user out
 */
export const useIsAuthorized = () => {
  const {userId, accessToken} = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  /**
   * @description - fetch user information to see if 403 responded
   */
  const checkIfAuthorized = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher(`api/v1/getUser?userId=${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === 403) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      setError(true); // error, do not boot user in this case
    }
    setLoading(false);
  }, [accessToken, userId]);

  useEffect(() => {
    checkIfAuthorized();
  }, [checkIfAuthorized]);

  return {
    loading,
    error,
    isAuthorized,
    checkIfAuthorized,
  };
};
