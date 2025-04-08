import {TerraAuthTokenResponse} from 'terra-api/lib/esm/API/GenerateAuthToken';

import {PostResponse} from '@pathize/api';
import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils/fetcher';

export async function getTerraAuthToken(
  accessToken: string,
): Promise<ServiceObjectMessage<TerraAuthTokenResponse>> {
  try {
    const response: PostResponse<TerraAuthTokenResponse> = await fetcher(
      'api/v1/generateAuthToken',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return {
      success: true,
      data: response.data as TerraAuthTokenResponse,
    };
  } catch (err) {
    return {
      success: false,
      error:
        'Connection to apple failed, please try again. If this continues, please reach out to us for help.',
    };
  }
}
