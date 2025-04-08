import {useState} from 'react';

import {ClinicalSurvey} from '@pathize/db';
import {useAuth} from '../../CoreNav';
import {fetcher} from '../../utils';

export const useHealthAssessment = () => {
  const {userId, accessToken} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const createHealthAssessment = async (healthAssessment: ClinicalSurvey) => {
    setLoading(true);
    try {
      const responseBody = JSON.stringify({
        userId: userId,
        healthAssessment: healthAssessment,
      });
      await fetcher('api/v1/createHealthAssessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: responseBody,
      });
    } catch (err) {
      console.log('createHealthAssessment error: ', err);
      setError(true);
    }
    setLoading(false);
  };

  return {createHealthAssessment, loading, error};
};
