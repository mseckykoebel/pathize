import {fetcher} from '../../utils';

const errorLogging = async (
  userId: string,
  accessToken: string,
  message: string,
) => {
  try {
    const response = await fetcher(
      `api/v1/logging?userId=${userId}&message=${message}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response;
  } catch (err) {
    console.log('ERROR IN sendToFrontEndLogging: ', err);
  }
};

export default errorLogging;
