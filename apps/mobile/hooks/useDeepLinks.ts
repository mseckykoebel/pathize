import {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dynamicLinks, {
  FirebaseDynamicLinksTypes,
} from '@react-native-firebase/dynamic-links';

import {useReferralsContext} from '../contexts';
import {useAuth} from '../CoreNav';

export const useDeepLinks = () => {
  const {userId} = useAuth();
  const {validateNewReferral, createReferralRecord, getPromotions} =
    useReferralsContext();
  const navigation = useNavigation<any>(); // TODO: fix this any type
  const [initialDeepLink, setInitialDeepLink] =
    useState<FirebaseDynamicLinksTypes.DynamicLink | null>(null);
  const handleDynamicLink = async (
    link: FirebaseDynamicLinksTypes.DynamicLink,
  ) => {
    setInitialDeepLink(link);
  };

  /**
   * @description handles the creation of a referral record if the incoming link is valid
   */
  const handleDeepLink = useCallback(
    async (link: FirebaseDynamicLinksTypes.DynamicLink) => {
      const rawLink = link.url.split('link=')[1];
      const deepLink = rawLink.split('&')[0];
      const decodedDeepLink = decodeURIComponent(deepLink);
      const paramsString = decodedDeepLink.split('?')[1];
      const paramsArray = paramsString.split('&');
      const referralParam = paramsArray.find(param =>
        param.startsWith('referralCode='),
      );
      const referralCode = referralParam ? referralParam.split('=')[1] : null;

      if (!referralCode) return;

      try {
        const isReferralValid = await validateNewReferral(referralCode);
        if (
          isReferralValid.success === true &&
          isReferralValid.referrerUserId
        ) {
          // link is valid, create a new referral record crediting the referrer
          const createRecordAndPromotion = await createReferralRecord(
            isReferralValid.referrerUserId,
            userId,
            referralCode,
          );

          if (createRecordAndPromotion.success === true) {
            await getPromotions();
            Alert.alert(
              'Success!',
              "You've successfully claimed a promotion! Navigate to the promotions section to claim your promotion.",
              [
                {
                  text: 'Claim promotion',
                  onPress: () => {
                    navigation.navigate('ProfileScreen', {
                      screen: 'Refer',
                    });
                  },
                },
              ],
            );
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
    [
      createReferralRecord,
      getPromotions,
      navigation,
      userId,
      validateNewReferral,
    ],
  );

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    return () => unsubscribe();
  }, []);

  return {initialDeepLink, handleDeepLink};
};
