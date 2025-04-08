import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  ReferralCode,
  Promotion,
  PromotionIdentifier,
  Referrals,
} from '@pathize/db';
import {useAuth} from '../CoreNav';
import {GetResponse} from '@pathize/api';
import {fetcher} from '../utils';

export type ReferralsContext = {
  // REFERRAL CODE FOR THE CURRENT USER
  referralCode: ReferralCode | null;
  setReferralCode: Dispatch<SetStateAction<ReferralCode | null>>;
  // GET REFERRAL CODE
  getReferralCode: () => Promise<void>;
  getReferralCodeLoading: boolean;
  setGetReferralCodeLoading: Dispatch<SetStateAction<boolean>>;
  getReferralCodeError: string | null;
  setGetReferralCodeError: Dispatch<SetStateAction<string | null>>;
  // CREATE REFERRAL CODE
  createReferralCode: () => Promise<void>;
  createReferralCodeLoading: boolean;
  setCreateReferralCodeLoading: Dispatch<SetStateAction<boolean>>;
  createReferralCodeError: string | null;
  setCreateReferralCodeError: Dispatch<SetStateAction<string | null>>;
  // VALIDATE INCOMING REFERRAL CODE
  validateNewReferral: (code: string) => Promise<{
    success: boolean;
    referrerUserId: string | null;
  }>;
  validateIncomingReferralCodeLoading: boolean;
  setValidateIncomingReferralCodeLoading: Dispatch<SetStateAction<boolean>>;
  validateIncomingReferralCodeError: string | null;
  setValidateIncomingReferralCodeError: Dispatch<SetStateAction<string | null>>;
  // CREATE REFERRAL RECORD
  createReferralRecord: (
    referrerUserId: string,
    refereeUserId: string,
    referrerReferralCode: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  createReferralRecordLoading: boolean;
  setCreateReferralRecordLoading: Dispatch<SetStateAction<boolean>>;
  createReferralRecordError: string | null;
  setCreateReferralRecordError: Dispatch<SetStateAction<string | null>>;
  ////
  // PROMOTIONS
  ////
  // PROMOTION, AND GET PROMOTION
  promotions: Promotion[] | null;
  getPromotions: () => Promise<void>;
  getPromotionsLoading: boolean;
  setGetPromotionsLoading: Dispatch<SetStateAction<boolean>>;
  getPromotionsError: string | null;
  setGetPromotionsError: Dispatch<SetStateAction<string | null>>;
  // UPDATE PROMOTION
  updatePromotion: (id: string, applied: boolean) => Promise<void>;
  updatePromotionLoading: boolean;
  setUpdatePromotionLoading: Dispatch<SetStateAction<boolean>>;
  updatePromotionError: string | null;
  setUpdatePromotionError: Dispatch<SetStateAction<string | null>>;
  // CREATE PROMOTION
  createPromotion: (
    uId: string,
    promotionIdentifier: PromotionIdentifier,
    applied?: boolean,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  createPromotionLoading: boolean;
  setCreatePromotionLoading: Dispatch<SetStateAction<boolean>>;
  createPromotionError: string | null;
  setCreatePromotionError: Dispatch<SetStateAction<string | null>>;
  // REFERRED USER COUNT FOR SOMEONE WHO REFERS LOTS OF PEOPLE
  getReferredUserCountAndCheckPromotion: () => Promise<void>;
  getReferredUserCountAndCheckPromotionLoading: boolean;
  setGetReferredUserCountAndCheckPromotionLoading: Dispatch<
    SetStateAction<boolean>
  >;
  getReferredUserCountAndCheckPromotionError: string | null;
  setGetReferredUserCountAndCheckPromotionError: Dispatch<
    SetStateAction<string | null>
  >;
  // USERS THIS USER HAS REFERRED
  usersThisUserHasReferred: number | null;
  setUsersThisUserHasReferred: Dispatch<SetStateAction<number | null>>;
};

const ReferralsContext = createContext<ReferralsContext | undefined>(undefined);

export const useReferralsContext = () => {
  const context = useContext(ReferralsContext);
  if (context === undefined) {
    throw new Error(
      'useReferralsContext must be used within a ReferralsProvider',
    );
  }
  return context;
};

export const ReferralsProvider = ({children}: {children: ReactNode}) => {
  const {userId, accessToken} = useAuth();

  // codes
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);

  // create code
  const [createReferralCodeLoading, setCreateReferralCodeLoading] =
    useState<boolean>(false);
  const [createReferralCodeError, setCreateReferralCodeError] = useState<
    string | null
  >(null);

  /**
   * @description Create referral code for the current user
   */
  const createReferralCode = useCallback(async () => {
    setCreateReferralCodeLoading(true);

    try {
      const response: GetResponse<ReferralCode> = await fetcher(
        `api/v1/createReferralCode?userId=${userId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200 && !Array.isArray(response.data)) {
        setReferralCode(response.data || null);
      } else {
        setReferralCode(null);
      }
    } catch (err) {
      setCreateReferralCodeError(
        'Unable to create referral code. Please try again in a few minutes.',
      );
    } finally {
      setCreateReferralCodeLoading(false);
      setTimeout(() => setCreateReferralCodeError(null), 50);
    }
  }, [userId, accessToken]);

  const [getReferralCodeLoading, setGetReferralCodeLoading] =
    useState<boolean>(false);
  const [getReferralCodeError, setGetReferralCodeError] = useState<
    string | null
  >(null);

  /**
   * @description Get referral code for the current user
   */

  const getReferralCode = useCallback(async () => {
    setGetReferralCodeLoading(true);

    try {
      const response: GetResponse<ReferralCode> = await fetcher(
        `api/v1/getReferralCode?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200 && !Array.isArray(response.data)) {
        setReferralCode(response.data || null);
      } else if (response.status === 404) {
        createReferralCode();
      } else {
        setReferralCode(null);
      }
    } catch (err) {
      setGetReferralCodeError(
        'Unable to get referral code. Please try again in a few minutes.',
      );
    } finally {
      setGetReferralCodeLoading(false);
      setTimeout(() => setGetReferralCodeError(null), 50);
    }
  }, [userId, accessToken, createReferralCode]);

  const [
    validateIncomingReferralCodeLoading,
    setValidateIncomingReferralCodeLoading,
  ] = useState<boolean>(false);
  const [
    validateIncomingReferralCodeError,
    setValidateIncomingReferralCodeError,
  ] = useState<string | null>(null);

  /**
   * @description validate a referee using a referral code - has it been used before, etc.
   */
  const validateNewReferral = useCallback(
    async (code: string) => {
      setValidateIncomingReferralCodeLoading(true);

      try {
        const hasUserBeenReferredBefore: GetResponse<ReferralCode> =
          await fetcher(
            `api/v1/getReferralCodesByReferee?userId=${userId}&referralCode=${code}}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

        // if this is a 200, return true
        if (
          hasUserBeenReferredBefore.status === 200 &&
          !Array.isArray(hasUserBeenReferredBefore.data)
        ) {
          return {
            success: true,
            referrerUserId: hasUserBeenReferredBefore.data!.userId,
          };
        }

        return {
          success: false,
          referrerUserId: null,
        };
      } catch (err) {
        setValidateIncomingReferralCodeError(
          'Unable to validate referral code. Please try again in a few minutes.',
        );
        return {
          success: false,
          referrerUserId: null,
        };
      } finally {
        setValidateIncomingReferralCodeLoading(false);
        setTimeout(() => setValidateIncomingReferralCodeError(null), 50);
      }
    },
    [userId, accessToken],
  );

  const [createReferralRecordLoading, setCreateReferralRecordLoading] =
    useState<boolean>(false);
  const [createReferralRecordError, setCreateReferralRecordError] = useState<
    string | null
  >(null);

  /**
   * @description create a referral record
   */
  const createReferralRecord = useCallback(
    async (
      referrerUserId: string,
      refereeUserId: string,
      referrerReferralCode: string,
    ) => {
      setCreateReferralRecordLoading(true);

      try {
        // create new referral record
        await fetcher(
          `api/v1/createReferralRecord?referrerUserId=${referrerUserId}&refereeUserId=${refereeUserId}&referrerReferralCode=${referrerReferralCode}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        // create new promotion record to match this
        await fetcher(
          `api/v1/createPromotionRecord?userId=${refereeUserId}&promotionType=PROMOTIONAL_OFFER&promotionIdentifier=p_free_1m_v1`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        return {
          success: true,
          message: 'Referral record created successfully',
        };
      } catch (err) {
        setCreateReferralRecordError(
          'Unable to create referral record. Please try again in a few minutes.',
        );
        return {
          success: false,
          message:
            'Unable to create referral record. Please try again in a few minutes.',
        };
      } finally {
        setCreateReferralRecordLoading(false);
        setTimeout(() => setCreateReferralRecordError(null), 50);
      }
    },
    [accessToken],
  );

  const [promotions, setPromotions] = useState<null | Promotion[]>(null);
  const [getPromotionsLoading, setGetPromotionsLoading] =
    useState<boolean>(false);
  const [getPromotionsError, setGetPromotionsError] = useState<string | null>(
    null,
  );

  /**
   * @description get current promotion status for the user
   */
  const getPromotions = useCallback(async () => {
    setGetPromotionsLoading(true);

    try {
      const response: GetResponse<Promotion> = await fetcher(
        `api/v1/getPromotionRecords?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        setPromotions(response.data || null);
      } else {
        console.log('No promotion found');
        setPromotions(null);
      }
    } catch (err) {
      setGetPromotionsError(
        'Unable to get promotions. Please try again in a few minutes.',
      );
    } finally {
      setGetPromotionsLoading(false);
      setTimeout(() => setGetPromotionsError(null), 50);
    }
  }, [userId, accessToken]);

  const [updatePromotionLoading, setUpdatePromotionLoading] =
    useState<boolean>(false);
  const [updatePromotionError, setUpdatePromotionError] = useState<
    string | null
  >(null);

  /**
   * @description update promotion status for the user
   */
  const updatePromotion = useCallback(
    async (id: string, applied: boolean) => {
      setUpdatePromotionLoading(true);

      const body = JSON.stringify({
        id: id,
        applied: applied,
      });

      try {
        await fetcher('api/v1/updatePromotionRecord', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: body,
        });
      } catch (err) {
        setUpdatePromotionError(
          'Unable to update promotion status. Please try again in a few minutes.',
        );
      } finally {
        setUpdatePromotionLoading(false);
        setTimeout(() => setUpdatePromotionError(null), 50);
      }
    },
    [accessToken],
  );

  const [createPromotionLoading, setCreatePromotionLoading] =
    useState<boolean>(false);
  const [createPromotionError, setCreatePromotionError] = useState<
    string | null
  >(null);

  /**
   * @description create promotion record, useful for checking to see if someone has claimed an offer or not
   */
  const createPromotion = useCallback(
    async (
      uId: string,
      promotionIdentifier: PromotionIdentifier,
      applied?: boolean,
    ) => {
      setCreatePromotionLoading(true);

      try {
        await fetcher(
          `api/v1/createPromotionRecord?userId=${uId}&promotionType=PROMOTIONAL_OFFER&promotionIdentifier=${promotionIdentifier}&applied=${
            applied ?? false
          }`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        return {
          success: true,
          message: 'Promotion record created successfully',
        };
      } catch (err) {
        setCreatePromotionError(
          'Unable to create promotion record. Please try again in a few minutes.',
        );
        return {
          success: false,
          message: 'Unable to create promotion record.',
        };
      } finally {
        setCreatePromotionLoading(false);
        setTimeout(() => setCreatePromotionError(null), 50);
      }
    },
    [accessToken],
  );

  const [
    getReferredUserCountAndCheckPromotionLoading,
    setGetReferredUserCountAndCheckPromotionLoading,
  ] = useState<boolean>(false);
  const [
    getReferredUserCountAndCheckPromotionError,
    setGetReferredUserCountAndCheckPromotionError,
  ] = useState<string | null>(null);
  const [usersThisUserHasReferred, setUsersThisUserHasReferred] = useState<
    number | null
  >(null);

  /**
   * @description update/set the number of users this userId has referred,
   * and create a new promotion if the user has referred 3 or more people
   * and no promotion record exists
   */
  const getReferredUserCountAndCheckPromotion = useCallback(async () => {
    setGetReferredUserCountAndCheckPromotionLoading(true);

    try {
      const referralRecords: GetResponse<Referrals> = await fetcher(
        `api/v1/getReferralsByReferrer?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log('referralRecords: ', referralRecords);

      const promotionRecords: GetResponse<Promotion> = await fetcher(
        `api/v1/getPromotionRecord?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log('promotionRecords: ', promotionRecords);

      // user has referred >0 people
      if (
        referralRecords.status === 200 &&
        Array.isArray(referralRecords.data)
      ) {
        setUsersThisUserHasReferred(referralRecords.data.length);
        // is there a promotion record that has been created for p_free_3m_v1
        const promotionRecordWithThreeMonthTrial = Array.isArray(
          promotionRecords.data,
        )
          ? promotionRecords.data.find(
              p => p.promotionIdentifier === 'p_free_3m_v1',
            )
            ? true
            : false
          : false;
        // if the user has referred 3 or more people, and no promotion record exists, create one and alert the user
        if (
          referralRecords.data.length >= 3 &&
          !promotionRecordWithThreeMonthTrial
        ) {
          const makeNewPromotion = await createPromotion(
            userId,
            'p_free_3m_v1',
          );
          if (makeNewPromotion.success) {
            console.log(
              'New promotion created - we can navigate to the profile screen and show this promotion',
            );
          } else {
            // Fail silently for now
            console.log('Unable to create new promotion');
          }
        }
      } else if (referralRecords.status === 404) {
        console.log('No referral records found');
        setUsersThisUserHasReferred(0);
      }
    } catch (err) {
      setGetReferredUserCountAndCheckPromotionError(
        'Unable to get referred user count. Please try again in a few minutes.',
      );
    } finally {
      setGetReferredUserCountAndCheckPromotionLoading(false);
      setTimeout(() => setGetReferredUserCountAndCheckPromotionError(null), 50);
    }
  }, [userId, accessToken, createPromotion]);

  /**
   * @description get referral code on init of context
   */
  useEffect(() => {
    getPromotions();
    getReferralCode();
  }, [getPromotions, getReferralCode]);

  return (
    <ReferralsContext.Provider
      value={{
        referralCode,
        setReferralCode,
        // GET REFERRAL CODE
        getReferralCode,
        getReferralCodeLoading,
        setGetReferralCodeLoading,
        getReferralCodeError,
        setGetReferralCodeError,
        // CREATE REFERRAL CODE
        createReferralCode,
        createReferralCodeLoading,
        setCreateReferralCodeLoading,
        createReferralCodeError,
        setCreateReferralCodeError,
        // VALIDATE INCOMING REFERRAL CODE
        validateNewReferral,
        validateIncomingReferralCodeLoading,
        setValidateIncomingReferralCodeLoading,
        validateIncomingReferralCodeError,
        setValidateIncomingReferralCodeError,
        // CREATE REFERRAL RECORD
        createReferralRecord,
        createReferralRecordLoading,
        setCreateReferralRecordLoading,
        createReferralRecordError,
        setCreateReferralRecordError,
        ////
        // PROMOTIONS
        ////
        // PROMOTION, AND GET PROMOTION
        promotions,
        getPromotions,
        getPromotionsLoading,
        setGetPromotionsLoading,
        getPromotionsError,
        setGetPromotionsError,
        // UPDATE PROMOTION
        updatePromotion,
        updatePromotionLoading,
        setUpdatePromotionLoading,
        updatePromotionError,
        setUpdatePromotionError,
        // CREATE PROMOTION
        createPromotion,
        createPromotionLoading,
        setCreatePromotionLoading,
        createPromotionError,
        setCreatePromotionError,
        // REFERRED USER COUNT FOR SOMEONE WHO REFERS LOTS OF PEOPLE
        getReferredUserCountAndCheckPromotion,
        getReferredUserCountAndCheckPromotionLoading,
        setGetReferredUserCountAndCheckPromotionLoading,
        getReferredUserCountAndCheckPromotionError,
        setGetReferredUserCountAndCheckPromotionError,
        // USERS THIS USER HAS REFERRED
        usersThisUserHasReferred,
        setUsersThisUserHasReferred,
      }}>
      {children}
    </ReferralsContext.Provider>
  );
};
