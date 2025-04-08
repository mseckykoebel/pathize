import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Purchases, {
  CustomerInfo,
  INTRO_ELIGIBILITY_STATUS,
  PurchasesEntitlementInfo,
  PurchasesPackage,
  PurchasesPromotionalOffer,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MONTHLY_SUBSCRIPTION_IDENTIFIER,
  YEARLY_PROMOTION_IDENTIFIER,
} from '../config';

type PurchasePackageMessage = 'Successful' | 'Cancelled' | 'Error';
type IsSubscribed = 'Subscribed' | 'NotSubscribed' | 'Error';

export type PurchasesContext = {
  // STATE VARIABLES
  appUserId: string | null;
  setAppUserId: Dispatch<SetStateAction<string | null>>;
  isAnonymous: boolean;
  setIsAnonymous: Dispatch<SetStateAction<boolean>>;
  subscriptionActive: boolean;
  setSubscriptionActive: Dispatch<SetStateAction<boolean>>;
  customerInfo: CustomerInfo | null;
  setCustomerInfo: Dispatch<SetStateAction<CustomerInfo | null>>;
  // HELPER FUNCTIONS
  getOfferings: () => Promise<{
    success: boolean;
    packages: PurchasesPackage[] | null;
  }>;
  // MAKE PURCHASE
  makePurchaseLoading: boolean;
  setMakePurchaseLoading: Dispatch<SetStateAction<boolean>>;
  makePurchaseError: string | null;
  setMakePurchaseError: Dispatch<SetStateAction<string | null>>;
  makePurchase: (purchasePackage: PurchasesPackage) => Promise<{
    success: boolean;
    message: PurchasePackageMessage;
  }>;
  checkSubscriptionStatus: () => Promise<{
    success: boolean;
    message: IsSubscribed;
  }>;
  restorePurchase: () => Promise<{
    success: boolean;
    message: PurchasePackageMessage;
  }>;
  // PROMOTIONAL OFFERINGS
  getPromotionalOfferings: () => Promise<{
    success: boolean;
    packages: PurchasesPromotionalOffer[] | null;
  }>;
  // DISCOUNTED PURCHASE
  makeDiscountedPurchase: (
    aPackage: PurchasesPackage,
    discount: PurchasesPromotionalOffer,
  ) => Promise<{
    success: boolean;
    message: PurchasePackageMessage;
  }>;
  makeDiscountedPurchaseLoading: boolean;
  setMakeDiscountedPurchaseLoading: Dispatch<SetStateAction<boolean>>;
  // TRIAL
  isEligibleForTrial: () => Promise<boolean>;
};

const PurchasesContext = createContext<PurchasesContext | undefined>(undefined);

export const usePurchasesContext = () => {
  const context = useContext(PurchasesContext);
  if (context === undefined) {
    throw new Error(
      'usePurchasesContext must be used within a PurchasesProvider',
    );
  }
  return context;
};

export const PurchasesProvider = ({children}: {children: ReactNode}) => {
  // STATE VARIABLES
  const [appUserId, setAppUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  ////
  // HELPER FUNCTIONS
  ////

  /**
   * @description Get the initial list of product offerings. For use on the paywall screen.
   *
   */
  const getOfferings = useCallback(async (): Promise<{
    success: boolean;
    packages: PurchasesPackage[] | null;
  }> => {
    try {
      const offerings = await Purchases.getOfferings();
      console.log('OFFERINGS: ', offerings);
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        console.log('OFFERINGS: ', offerings.current.availablePackages);
        return {
          success: true,
          packages: offerings.current.availablePackages,
        };
      } else {
        return {
          success: true,
          packages: null,
        };
      }
    } catch (e) {
      return {
        success: false,
        packages: null,
      };
    }
  }, []);

  const [makePurchaseLoading, setMakePurchaseLoading] =
    useState<boolean>(false);
  const [makePurchaseError, setMakePurchaseError] = useState<string | null>(
    null,
  );

  /**
   * @description Get list of promotional offerings
   */
  const getPromotionalOfferings = useCallback(async () => {
    try {
      const product = await Purchases.getProducts([
        MONTHLY_SUBSCRIPTION_IDENTIFIER,
      ]);

      if (product.length === 0) {
        return {
          success: false,
          packages: null,
        };
      }

      if (!product[0].discounts) {
        return {
          success: false,
          packages: null,
        };
      }

      let purchasesPromotionalOffer: PurchasesPromotionalOffer[] = [];
      for (const discount of product[0].discounts) {
        console.log('DISCOUNT: ', discount);
        const promotionalOffer = await Purchases.getPromotionalOffer(
          product[0],
          discount,
        );
        console.log('PROMOTIONAL OFFER ITEM: ', promotionalOffer);
        if (!promotionalOffer) continue;
        purchasesPromotionalOffer.push(promotionalOffer);
      }

      console.log('PROMOTIONAL OFFERINGS: ', purchasesPromotionalOffer);

      return {
        success: true,
        packages: purchasesPromotionalOffer,
      };
    } catch (e) {
      console.log('getOfferings error: ', e);
      return {
        success: false,
        packages: null,
      };
    }
  }, []);

  /**
   * @description Make a purchase. For use on the paywall screen, or the restore screen.
   */
  const makePurchase = async (
    purchasePackage: PurchasesPackage,
  ): Promise<{
    success: boolean;
    message: PurchasePackageMessage;
  }> => {
    setMakePurchaseLoading(true);
    try {
      const purchaseMade = await Purchases.purchasePackage(purchasePackage);
      console.log('PURCHASE MADE LOG: ', purchaseMade);
      console.log(
        'THIS IS WHAT WE ARE CHECKING FOR: ',
        purchaseMade.customerInfo.entitlements.active,
      );
      if (
        Object.values(purchaseMade.customerInfo.entitlements.active).some(
          (entitlement: PurchasesEntitlementInfo) =>
            entitlement.productIdentifier === MONTHLY_SUBSCRIPTION_IDENTIFIER &&
            entitlement.isActive === true,
        )
      ) {
        // Purchase was successful
        setMakePurchaseLoading(false);
        return {success: true, message: 'Successful'};
      } else {
        setMakePurchaseLoading(false);
        return {success: false, message: 'Error'};
      }
      // TODO: shitty any, docs are here: https://www.revenuecat.com/docs/getting-started#%EF%B8%8F-make-a-purchase
    } catch (e: any) {
      // Cancelled
      if (!e.userCancelled) {
        console.log(e);
        setMakePurchaseLoading(false);
        return {success: false, message: 'Cancelled'};
      }

      // There was an error
      setMakePurchaseLoading(false);
      return {success: false, message: 'Error'};
    }
  };

  const [makeDiscountedPurchaseLoading, setMakeDiscountedPurchaseLoading] =
    useState<boolean>(false);

  /**
   * @description Make a discounted purchase
   */
  const makeDiscountedPurchase = async (
    aPackage: PurchasesPackage,
    discount: PurchasesPromotionalOffer,
  ): Promise<{
    success: boolean;
    message: PurchasePackageMessage;
  }> => {
    setMakeDiscountedPurchaseLoading(true);

    try {
      const purchaseMade = await Purchases.purchaseDiscountedPackage(
        aPackage,
        discount,
      );
      console.log('PURCHASE MADE LOG: ', purchaseMade);
      console.log(
        'THIS IS WHAT WE ARE CHECKING FOR: ',
        purchaseMade.customerInfo.entitlements.active,
      );
      if (
        Object.values(purchaseMade.customerInfo.entitlements.active).some(
          (entitlement: PurchasesEntitlementInfo) =>
            entitlement.productIdentifier === MONTHLY_SUBSCRIPTION_IDENTIFIER &&
            entitlement.isActive === true,
        )
      ) {
        // Purchase was successful
        setMakeDiscountedPurchaseLoading(false);
        return {success: true, message: 'Successful'};
      } else {
        setMakeDiscountedPurchaseLoading(false);
        return {success: false, message: 'Error'};
      }
    } catch (e: any) {
      // Cancelled
      if (!e.userCancelled) {
        console.log(e);
        setMakeDiscountedPurchaseLoading(false);
        return {success: false, message: 'Cancelled'};
      }

      // There was an error
      setMakeDiscountedPurchaseLoading(false);
      return {success: false, message: 'Error'};
    }
  };

  /**
   * @description Check the subscription status of the user. For use when app is first opened.
   */
  const checkSubscriptionStatus = async (): Promise<{
    success: boolean;
    message: IsSubscribed;
  }> => {
    try {
      const cInfo = await Purchases.getCustomerInfo();

      if (
        Object.values(cInfo.entitlements.active).some(
          (entitlement: PurchasesEntitlementInfo) =>
            (entitlement.productIdentifier ===
              MONTHLY_SUBSCRIPTION_IDENTIFIER ||
              entitlement.productIdentifier === YEARLY_PROMOTION_IDENTIFIER) &&
            entitlement.isActive === true,
        )
      ) {
        // User is a subscriber
        return {success: true, message: 'Subscribed'};
      }

      // User is not a subscriber, and we need the paywall
      return {success: true, message: 'NotSubscribed'};
    } catch (e) {
      console.log('ERROR WITH CHECKING SUBSCRIPTION STATUS: ', e);
      return {success: false, message: 'Error'};
    }
  };

  /**
   * @description Restore/reactivate a purchase. Probably good to use this on the paywall screen as well.
   */
  const restorePurchase = async (): Promise<{
    success: boolean;
    message: PurchasePackageMessage;
  }> => {
    try {
      await Purchases.restorePurchases();
      return {success: true, message: 'Successful'};
    } catch (e) {
      return {success: false, message: 'Error'};
    }
  };

  /**
   * @description check and see if the user is eligible for a trial
   */
  const isEligibleForTrial = useCallback(async (): Promise<boolean> => {
    try {
      const response = await Purchases.checkTrialOrIntroductoryPriceEligibility(
        [MONTHLY_SUBSCRIPTION_IDENTIFIER],
      );
      const isEligible = response[MONTHLY_SUBSCRIPTION_IDENTIFIER].status;

      if (isEligible === (2 as INTRO_ELIGIBILITY_STATUS)) return true;
      return false;
    } catch (e) {
      console.log('CHECK IS ELIGIBLE ERROR: ', e);
      return false;
    }
  }, []);

  /**
   * @description Get the user details from RevenueCat. For use when the subscription status changes.
   */
  const getUserDetails = async () => {
    try {
      setIsAnonymous(await Purchases.isAnonymous());
      setAppUserId(await Purchases.getAppUserID());

      const cInfo = await Purchases.getCustomerInfo();
      setCustomerInfo(cInfo);
      setSubscriptionActive(
        typeof cInfo.entitlements.active[MONTHLY_SUBSCRIPTION_IDENTIFIER] !==
          'undefined',
      );
    } catch (e) {
      console.log('getUserDetails error: ', e);
    }
  };

  /**
   * @description Initial configuration of the Purchases SDK - MUST be called first for everything else to work
   */
  const configurePurchases = async () => {
    const userId = await AsyncStorage.getItem('userId');

    // if there is no userId, the user is technically anonymous
    if (userId) {
      Purchases.configure({
        apiKey: 'appl_pgcipvohtOebDhzHHtJVQyLHxfr',
        appUserID: userId,
      });
      try {
        const loginResult = await Purchases.logIn(userId);
        console.log('💰 LOGIN RESULT: ', loginResult);
      } catch (e) {
        console.log('🚨 PURCHASES LOGIN ERROR: ', e);
      }
    } else {
      Purchases.configure({apiKey: 'appl_pgcipvohtOebDhzHHtJVQyLHxfr'});
    }
  };

  /**
   * @description respond to changes in the subscription status of a user
   * likely can be handled with subscription status onInit, amd updating user preferences on backend
   * but this is here for now.
   */
  useEffect(() => {
    const init = async () => {
      await configurePurchases();
      await getUserDetails();
    };

    init();
    Purchases.addCustomerInfoUpdateListener(getUserDetails);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(getUserDetails);
    };
  }, []);

  return (
    <PurchasesContext.Provider
      value={{
        appUserId,
        setAppUserId,
        isAnonymous,
        setIsAnonymous,
        subscriptionActive,
        setSubscriptionActive,
        getOfferings,
        customerInfo,
        setCustomerInfo,
        // MAKE PURCHASE
        makePurchaseLoading,
        setMakePurchaseLoading,
        makePurchaseError,
        setMakePurchaseError,
        makePurchase,
        checkSubscriptionStatus,
        restorePurchase,
        // PROMOTIONAL OFFERS
        getPromotionalOfferings,
        // DISCOUNTED PURCHASE
        makeDiscountedPurchase,
        makeDiscountedPurchaseLoading,
        setMakeDiscountedPurchaseLoading,
        // TRIAL
        isEligibleForTrial,
      }}>
      {children}
    </PurchasesContext.Provider>
  );
};
