import React, {useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Share from 'react-native-share';
import tw from 'twrnc';

import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {
  Divider,
  Header1,
  Header3,
  InputField,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {usePurchasesContext, useReferralsContext} from '../../contexts';
import {useAuth} from '../../CoreNav';
import {useAnalytics} from '../../hooks';

function isCodeValid(code: string) {
  const normalizedCode = code.toUpperCase();
  if (normalizedCode === 'PH1M2023' || normalizedCode === 'PH3M2023')
    return true;
  return false;
}

async function generateLink() {
  try {
    const link = await dynamicLinks().buildShortLink({
      link: 'https://pathizehealth.page.link/?link=https://pathizehealth.com?isi=1665320917&ibi=com.jupiterdx.jupiter-mobile',
      domainUriPrefix: 'https://pathizehealth.page.link',
      ios: {
        bundleId: 'com.jupiterdx.jupiter-mobile',
        appStoreId: '1665320917',
        fallbackUrl: 'https://apps.apple.com/app/id1665320917',
      },
      social: {
        title: "You've been invited to try Pathize!",
        descriptionText: 'Click the link below to download.',
        imageUrl: 'https://jupiter-dx.github.io/assets/pathize_app_preview.png',
      },
    });

    return link;
  } catch (err) {
    console.log(err);
    return null;
  }
}

type Props = StackScreenProps<ProfileScreenParamList, 'Refer'>;

const ReferScreen: React.FC<Props> = () => {
  const {userId} = useAuth();
  const {
    getOfferings,
    getPromotionalOfferings,
    makeDiscountedPurchase,
    makeDiscountedPurchaseLoading: loading,
  } = usePurchasesContext();
  const {interactionEvent} = useAnalytics();
  const {promotions, getPromotions, createPromotion} = useReferralsContext();
  const [referLink, setReferLink] = useState<string | null>(null);
  const [promoCode, onPromoCodeChange] = useState<string>('');
  const [promoIsValid, setPromoIsValid] = useState<boolean>(false);

  const showPromotionsArea = promotions === null || promotions.length === 0;

  useEffect(() => {
    const setup = async () => {
      const link = await generateLink();
      setReferLink(link);
    };

    if (!promotions) getPromotions();
    if (!referLink) setup();
  }, [getPromotions, promotions, referLink]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        dismissKeyboardOnTouch={true}>
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text={'Invite your friends to Pathize, or apply a discount code'}
            style={[
              tw`text-slate-900 text-2xl font-bold leading-snug`,
              getCircular('Bold'),
            ]}
          />
          <Subheader
            text="Discounts are applied via a discount code, and can only be applied once."
            padding={true}
            style={[tw``, getCircular('Book')]}
          />
          {/* SEND INVITE BUTTON */}
          <PrimaryButton
            onPress={async () => {
              if (!referLink) throw new Error('Refer link is null');
              try {
                return await Share.open({
                  title: 'Join Pathize',
                  url: referLink,
                });
              } catch (err) {
                console.log(err);
              }
            }}
            text={
              referLink === null
                ? 'Generating invite link...'
                : 'Copy your unique invitation link'
            }
            rounded={'small'}
            style={[tw`mt-5`]}
            disabled={referLink === null}
            textStyle={[tw``, getCircular('Book')]}
          />

          {/* IF PROMOTION FOR ONE MONTH IS AVAILABLE, SHOW A DIVIDER AND A NEW BUTTON */}
          {showPromotionsArea && (
            <>
              <Divider padding={true} />
              {/* PROMOTION AVAILABLE */}
              <Header3
                text="Apply discount code"
                padding={true}
                textStyle={[tw``, getCircular('Book')]}
              />
              <Subheader
                text={
                  !promoIsValid
                    ? 'If you have a discount code, enter it here to apply it.'
                    : 'Thank you for being a TestFlight beta tester! Your one month discount has been applied. When you accept this discount, your current trial will be extended to one month.'
                }
                paddingBottom={promoIsValid ? false : true}
                style={[tw``, getCircular('Book')]}
              />
              {/* BUTTON */}
              {!promoIsValid && (
                <>
                  {/* INPUT AREA FOR PROMO CODE */}
                  <InputField
                    paddingBottom={false}
                    value={promoCode}
                    onChangeText={onPromoCodeChange}
                    inputBackgroundColor="bg-white"
                    onFocus={() => {
                      interactionEvent('Input', 'Focused', {
                        $screen_name: 'Refer',
                        value: promoCode,
                      });
                    }}
                  />
                  <PrimaryButton
                    text="Apply code"
                    padding={true}
                    rounded={'small'}
                    onPress={() => {
                      interactionEvent('Button', 'Pressed', {
                        $screen_name: 'Refer',
                        value: 'Apply code: ' + promoCode,
                      });
                      if (isCodeValid(promoCode)) {
                        Alert.alert(
                          'Code applied!',
                          'Your code has been accepted!',
                        );
                        setPromoIsValid(true);
                        // set it to be PH1M2023 if contains a 1, and PH3M2023 if contains a 3 (TODO: kind of shitty one-line fix)
                        if (promoCode.includes('1')) {
                          onPromoCodeChange('PH1M2023');
                        } else {
                          onPromoCodeChange('PH3M2023');
                        }
                      } else {
                        setPromoIsValid(false);
                        Alert.alert(
                          'Invalid code',
                          'The code you entered is invalid. Please try again.',
                        );
                      }
                    }}
                    style={[tw`mt-5`]}
                    textStyle={[tw``, getCircular('Book')]}
                  />
                </>
              )}

              {/* CLAIM PROMOTION BUTTON */}
              {promoIsValid && (
                <PrimaryButton
                  text={
                    promoCode === 'PH1M2023'
                      ? 'Claim 1 month'
                      : 'Claim 3 months'
                  }
                  loading={loading}
                  padding={true}
                  rounded={'small'}
                  onPress={async () => {
                    // get the discount
                    const discounts = await getPromotionalOfferings();
                    if (!discounts.success || !discounts.packages) {
                      return Alert.alert(
                        'Issue getting promotions',
                        'We ran into an issue getting our list of promotions. This is likely a mistake, so if this persists, please contact us',
                      );
                    }

                    let discount;
                    if (promoCode === 'PH1M2023') {
                      discount = discounts.packages.find(
                        d => d.identifier === 'p_free_1m_v1',
                      );
                    } else {
                      discount = discounts.packages.find(
                        d => d.identifier === 'p_free_3m_v1',
                      );
                    }

                    if (!discount) {
                      return Alert.alert(
                        'Issue getting discount',
                        'We ran into an issue getting your discount. This is likely a mistake, so if this persists, please contact us',
                      );
                    }

                    // get the promotional offering
                    const offerings = await getOfferings();
                    // if undefined, throw the same error
                    if (!offerings.packages) {
                      return Alert.alert(
                        'Issue getting specific offering',
                        'We ran into an issue getting the 1-month offering. This is likely a mistake, so if this persists, please contact us',
                      );
                    }

                    // 1) Need to claim the promotion in revenuecat
                    const discountedPurchaseResponse =
                      await makeDiscountedPurchase(
                        offerings.packages[0],
                        discount,
                      );

                    // if not successful, show an error
                    if (!discountedPurchaseResponse.success) {
                      return Alert.alert(
                        'Issue claiming promotion',
                        'We ran into an issue claiming your promotion. This is likely a mistake, so if this persists, please contact us',
                      );
                    }

                    // 2) Update the promotion in the database
                    const cPromo = await createPromotion(
                      userId,
                      promoCode === 'PH1M2023'
                        ? 'p_free_1m_v1'
                        : 'p_free_3m_v1',
                      true,
                    );
                    if (cPromo.success) {
                      await getPromotions();
                      return Alert.alert(
                        "You're all set!",
                        'Your promotion has been applied, and your subscription has been modified.',
                      );
                    } else {
                      return Alert.alert(
                        'Promotion might not have applied',
                        'We ran into an issue creating your promotion. But, your promotion might have applied anyway. Check your subscription status in your settings to make sure.',
                      );
                    }
                  }}
                  style={[tw`mt-5`]}
                  textStyle={[tw``, getCircular('Book')]}
                />
              )}
            </>
          )}
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default ReferScreen;

// LINK:
// https://apps.apple.com/app/id1665320917?mt=8

/**
 * EVERYTHING BEFORE!!!
 */

// async function generateLink(referralCode: string) {
//   try {
//     const link = await dynamicLinks().buildShortLink({
//       link: `https://jdxms.page.link/?link=https://pathizehealth.com?referralCode=${referralCode}&isi=1665320917&ibi=com.jupiterdx.jupiter-mobile`,
//       domainUriPrefix: 'https://jdxms.page.link',
//       ios: {
//         bundleId: 'com.jupiterdx.jupiter-mobile',
//         appStoreId: '1665320917',
//         fallbackUrl: 'https://apps.apple.com/app/id1665320917',
//       },
//       social: {
//         title:
//           "You've been invited to try Pathize! Click the link below to download.",
//         descriptionText:
//           'You must have Pathize installed and have either an active subscription or trail to claim your free month. If you have Pathize ins',
//         imageUrl: 'https://jupiter-dx.github.io/assets/pathize_app_preview.png',
//       },
//     });

//     return link;
//   } catch (error) {
//     return null;
//   }
// }

// function isPromotionAvailable(promotion: Promotion) {
//   if (promotion.applied === true) return false;
//   return true;
// }

// type Props = StackScreenProps<ProfileScreenParamList, 'Refer'>;

// const ReferScreen: React.FC<Props> = () => {
//   const {
//     getOfferings,
//     getPromotionalOfferings,
//     makeDiscountedPurchase,
//     makeDiscountedPurchaseLoading: loading,
//   } = usePurchasesContext();
//   const {
//     usersThisUserHasReferred,
//     referralCode,
//     promotions,
//     getReferralCode,
//     updatePromotion,
//   } = useReferralsContext();
//   const [referLink, setReferLink] = useState<string | null>(null);

//   // can the user claim the one month promotion
//   const isOneMonthPromotionAvailable =
//     promotions &&
//     promotions.find(p => p.promotionIdentifier === 'p_free_1m_v1') &&
//     isPromotionAvailable(
//       promotions.find(
//         p => p.promotionIdentifier === 'p_free_1m_v1',
//       ) as Promotion,
//     );

//   // can the user claim the three month promotion
//   const isThreeMonthPromotionAvailable =
//     promotions &&
//     promotions.find(p => p.promotionIdentifier === 'p_free_3m_v1') &&
//     isPromotionAvailable(
//       promotions.find(
//         p => p.promotionIdentifier === 'p_free_3m_v1',
//       ) as Promotion,
//     );

//   // has the user applied the three month promotion? if so, change the UI to hide the 3-month referral option
//   const isThreeMonthPromotionApplied =
//     promotions &&
//     promotions.find(p => p.promotionIdentifier === 'p_free_3m_v1') &&
//     promotions.find(p => p.promotionIdentifier === 'p_free_3m_v1')?.applied;

//   useEffect(() => {
//     const setupCode = async () => {
//       if (!referralCode) {
//         // DISABLED FOR TESTING, COMMENT ALL ELSE BUT THIS LINE IN OTHER CASES
//         getReferralCode();
//         // const link = await generateLink('AB7H009O');
//         // console.log('THIS IS THE GENERATED LINK: ', link);
//         // setReferLink(link);
//       } else {
//         const link = await generateLink(referralCode.code);
//         console.log('THIS IS THE GENERATED LINK: ', link);
//         setReferLink(link);
//       }
//     };

//     setupCode();
//   }, [getReferralCode, referralCode]);

//   return (
//     <MainAppLayout statusBarStyle="light-content">
//       <AppBodyLayout
//         scrollable={true}
//         avoidKeyboard={false}
//         dismissKeyboardOnTouch={false}>
//         <View>
//           {/* HEADER (MODIFIED) */}
//           <Header1
//             text={
//               !isThreeMonthPromotionApplied
//                 ? 'Save on your subscription when friends join Pathize'
//                 : 'Invite your friends to Pathize'
//             }
//             style={[
//               tw`text-slate-900 text-2xl font-bold leading-snug`,
//               getCircular('Bold'),
//             ]}
//           />
//           {/* SUBHEADER */}
//           <Subheader
//             padding={true}
//             text={
//               !isThreeMonthPromotionApplied
//                 ? "Invite a friend who's new to Pathize and they'll get the first month free. Invite three friends and you'll get Pathize free for three months."
//                 : "Invite a friend who's new to Pathize and they'll get the first month free."
//             }
//             style={[tw``, getCircular('Book')]}
//           />
//           {/* SEE MORE DETAILS BUTTON */}
//           <Subheader
//             text="To claim your invite, who you refer must have Pathize installed and be logged in with an active subscription or trial. Then, they can open your referral link to claim it."
//             padding={false}
//             style={[tw``, getCircular('Book')]}
//           />
//           {/* SEND INVITE BUTTON */}
//           <PrimaryButton
//             onPress={async () => {
//               if (!referLink) throw new Error('Refer link is null');
//               try {
//                 return await Share.open({
//                   title: 'Join Pathize',
//                   url: referLink,
//                 });
//               } catch (err) {
//                 console.log(err);
//               }
//             }}
//             text={
//               referLink === null
//                 ? 'Generating invite...'
//                 : 'Copy your unique invitation link'
//             }
//             padding={true}
//             rounded={'small'}
//             style={[tw`mt-5`]}
//             disabled={referLink === null}
//             textStyle={[tw``, getCircular('Book')]}
//           />
//           {/* DIVIDER */}
//           <Divider padding={true} />

//           <View style={tw`flex flex-row justify-between items-center`}>
//             {/* RIGHT NUMBER */}
//             {/* REWARD STATUS */}
//             <Header3
//               text="Friends who've joined"
//               padding={true}
//               textStyle={[tw``, getCircular('Book')]}
//             />
//             <Subheader
//               text={`${
//                 usersThisUserHasReferred ? usersThisUserHasReferred : 'N/A'
//               }`}
//               padding={true}
//               style={[tw``, getCircular('Book')]}
//             />
//           </View>
//           {/* IF LESS THAN 3 REFERRED, SHOW COUNTDOWN SUBHEADER */}
//           {usersThisUserHasReferred !== null && usersThisUserHasReferred < 3 ? (
//             <Subheader
//               text={`Invite ${
//                 3 - usersThisUserHasReferred
//               } more friends to get one month for free.`}
//               style={[tw`text-base leading-tight`, getCircular('Book')]}
//             />
//           ) : null}
//           {/* IF PROMOTION FOR ONE MONTH IS AVAILABLE, SHOW A DIVIDER AND A NEW BUTTON */}
//           {isOneMonthPromotionAvailable && (
//             <>
//               <Divider padding={true} />
//               {/* PROMOTION AVAILABLE */}
//               <Header3
//                 text="Claim 1 month promotion"
//                 padding={true}
//                 textStyle={[tw``, getCircular('Book')]}
//               />
//               <Subheader
//                 text="You were referred to Pathize and are eligible for a free month! By claiming this promotion, your current subscription will be replaced by one with a free month, and one that renews monthly on this date."
//                 padding={true}
//                 style={[tw``, getCircular('Book')]}
//               />
//               {/* CLAIM PROMOTION BUTTON */}
//               <PrimaryButton
//                 text="Claim promotion"
//                 loading={loading}
//                 padding={true}
//                 rounded={'small'}
//                 onPress={async () => {
//                   // will be defined based on isOneMonthPromotionAvailable
//                   const oneMonthPromotion = promotions.find(
//                     p => p.promotionIdentifier === 'p_free_1m_v1',
//                   ) as Promotion;
//                   const discounts = await getPromotionalOfferings();
//                   if (!discounts.success || !discounts.packages) {
//                     return Alert.alert(
//                       'Issue getting promotions',
//                       'We ran into an issue getting our list of promotions. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   // get the discount where discount.identifier === promotion.promotionId
//                   const discount = discounts.packages.find(
//                     d => d.identifier === oneMonthPromotion.promotionIdentifier,
//                   );

//                   // if undefined, throw the same error
//                   if (!discount) {
//                     return Alert.alert(
//                       'Issue getting specific discount',
//                       'We ran into an issue getting the 1-month discount. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   const offerings = await getOfferings();
//                   if (!offerings.packages) {
//                     return Alert.alert(
//                       'Issue getting offerings',
//                       'We ran into an issue getting our list of offerings. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   // 1) Need to claim the promotion in revenuecat
//                   const discountedPurchaseResponse =
//                     await makeDiscountedPurchase(
//                       offerings.packages[0],
//                       discount,
//                     );

//                   // if not successful, show an error
//                   if (!discountedPurchaseResponse.success) {
//                     return Alert.alert(
//                       'Issue claiming promotion',
//                       'We ran into an issue claiming your promotion. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   // 2) Update the promotion in the database
//                   await updatePromotion(oneMonthPromotion.id, true);
//                   return Alert.alert(
//                     "You're all set!",
//                     'Your promotion has been applied, and your subscription has been modified.',
//                   );
//                 }}
//                 style={[tw`mt-5`]}
//                 textStyle={[tw``, getCircular('Book')]}
//               />
//             </>
//           )}
//           {/* IF PROMOTION FOR THREE MONTHS IS AVAILABLE */}
//           {/* TODO: CLEAN UP INTO HELPER FUNCTION */}
//           {isThreeMonthPromotionAvailable && (
//             <>
//               <Divider padding={true} />
//               {/* PROMOTION AVAILABLE */}
//               <Header3
//                 text="Claim 1 month promotion"
//                 padding={true}
//                 textStyle={[tw``, getCircular('Book')]}
//               />
//               <Subheader
//                 text="By referring three people, you've earned three free months of Pathize. By claiming this promotion, your current subscription will be replaced by one with three free months up-front, and one that will then renew monthly on this date."
//                 padding={true}
//                 style={[tw``, getCircular('Book')]}
//               />
//               {/* CLAIM PROMOTION BUTTON */}
//               <PrimaryButton
//                 text="Claim promotion"
//                 loading={loading}
//                 padding={true}
//                 rounded={'small'}
//                 onPress={async () => {
//                   const threeMonthPromotion = promotions.find(
//                     p => p.promotionIdentifier === 'p_free_3m_v1',
//                   ) as Promotion;
//                   const discounts = await getPromotionalOfferings();
//                   if (!discounts.success || !discounts.packages) {
//                     return Alert.alert(
//                       'Issue getting promotions - promotion not applied',
//                       'We ran into an issue getting our list of promotions. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   // get the discount where discount.identifier === promotion.promotionId
//                   const discount = discounts.packages.find(
//                     d =>
//                       d.identifier === threeMonthPromotion.promotionIdentifier,
//                   );

//                   // if undefined, throw the same error
//                   if (!discount) {
//                     return Alert.alert(
//                       'Issue getting discount - promotion not applied',
//                       'We ran into an issue getting our list of discounts. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   const offerings = await getOfferings();
//                   if (!offerings.packages) {
//                     return Alert.alert(
//                       'Issue getting offerings - promotion not applied',
//                       'We ran into an issue getting our list of offerings. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   // 1) Need to claim the promotion in revenuecat
//                   const discountedPurchaseResponse =
//                     await makeDiscountedPurchase(
//                       offerings.packages[0],
//                       discount,
//                     );

//                   // if not successful, show an error
//                   if (!discountedPurchaseResponse.success) {
//                     return Alert.alert(
//                       'Issue claiming promotion - promotion not applied',
//                       'We ran into an issue claiming your promotion. This is likely a mistake, so if this persists, please contact us',
//                     );
//                   }

//                   // 2) Update the promotion in the database
//                   await updatePromotion(threeMonthPromotion.id, true);
//                   return Alert.alert(
//                     "You're all set!",
//                     'Your promotion has been applied, and your subscription has been modified.',
//                   );
//                 }}
//                 style={[tw`mt-5`]}
//                 textStyle={[tw``, getCircular('Book')]}
//               />
//             </>
//           )}
//         </View>
//       </AppBodyLayout>
//     </MainAppLayout>
//   );
// };

// export default ReferScreen;
