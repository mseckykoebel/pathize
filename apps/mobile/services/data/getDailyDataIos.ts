import {Connections, getDaily} from 'terra-react';
import {Daily} from 'terra-api/lib/cjs/models/Daily';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import dayjs from 'dayjs';

import {getMetadata} from '../../lib';
import {Metadata} from '../../contexts';

const getDailyDataIos = async (
  today: string,
  tomorrow: string,
  limit: number,
) => {
  const appleData = await getDaily(
    Connections.APPLE_HEALTH,
    dayjs(today).toDate(),
    dayjs(tomorrow).toDate(),
    false,
  );

  if (appleData.error && appleData.error === 'Unauthenticated') return null;
  if (!(appleData.data as Record<string, string | unknown>).data) return null;

  for (let i = 0; i < (appleData.data as any).data.length; i++) {
    if (
      dayjs((appleData.data as any).data[i].metadata.start_time).format(
        'YYYY-MM-DD',
      ) === dayjs(today).format('YYYY-MM-DD')
    ) {
      const heartRateSamplesToday: HeartRateDataSample[] = (
        appleData.data as any
      ).data[i].heart_rate_data.detailed.hr_samples;

      if (heartRateSamplesToday.length === 0) return null;

      // 1️⃣ get time above limit, min hr, max hr
      const {timeAboveLimit, minHr, maxHr} = getMetadata(
        heartRateSamplesToday,
        limit,
      );

      // 2️⃣ get other metadata values
      const hrv = ((appleData.data as any).data[i] as Daily).heart_rate_data
        .summary.avg_hrv_rmssd
        ? ((appleData.data as any).data[i] as Daily).heart_rate_data.summary
            .avg_hrv_rmssd
        : ((appleData.data as any).data[i] as Daily).heart_rate_data.summary
              .avg_hrv_sdnn
          ? ((appleData.data as any).data[i] as Daily).heart_rate_data.summary
              .avg_hrv_sdnn
          : null;
      const restingHr = ((appleData.data as any).data[i] as Daily)
        .heart_rate_data.summary.resting_hr_bpm;

      const metadata: Metadata = {
        timeAboveLimit: timeAboveLimit,
        maxHr: maxHr,
        minHr: minHr,
        restingHr: restingHr ?? null,
        hrv: hrv ?? null,
      };

      // 3️⃣ get last updated (last data point timestamp)
      const lastUpdated =
        heartRateSamplesToday[heartRateSamplesToday.length - 1].timestamp;

      return {
        heartRateSamplesToday: heartRateSamplesToday,
        metadataIos: metadata,
        lastUpdatedIos: lastUpdated,
      };
    }
  }
};

export default getDailyDataIos;
