import {TerraWidgetResponse} from 'terra-api/lib/esm/API/GenerateWidgetSessions';

import {GetResponse} from '@pathize/api';
import {ServiceObjectMessage} from '../../types';
import {fetcher} from '../../utils/fetcher';

export async function generateWidgetSession(
  url: string,
  accessToken: string,
): Promise<ServiceObjectMessage<TerraWidgetResponse>> {
  try {
    const response: GetResponse<TerraWidgetResponse> = await fetcher(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data as TerraWidgetResponse,
      };
    }

    return {
      success: false,
      error:
        'There was an error generating a widget session. There might be an outage. If this persists, please connect with us and we will try and help you out!',
    };
  } catch (err) {
    return {
      success: false,
      error:
        'There was an error generating a widget session. There might be an outage. If this persists, please connect with us and we will try and help you out!',
    };
  }
}
