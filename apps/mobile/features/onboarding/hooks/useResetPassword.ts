import {useState} from 'react';

import {fetcher} from '../../../utils';

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sendPasswordResetEmail = async (
    email: string,
  ): Promise<{success: boolean; message: string}> => {
    setLoading(true);
    try {
      const response = await fetcher('api/v1/sendPasswordResetEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (response.status === 404) {
        return {
          success: false,
          message: 'Email not found',
        };
      }

      return {
        success: true,
        message: 'Email sent',
      };
    } catch (err) {
      setError(true);
      return {
        success: false,
        message: 'Error sending email',
      };
    } finally {
      setLoading(false);
      setTimeout(() => setError(false), 3000);
    }
  };

  return {
    loading,
    error,
    sendPasswordResetEmail,
  };
};
