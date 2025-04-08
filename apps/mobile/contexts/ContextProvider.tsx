import React from 'react';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {PortalProvider} from '@gorhom/portal';

import {
  ProfileProvider,
  NotificationsProvider,
  UserPreferencesProvider,
  TerraProvider,
  TodayDataProvider,
  InfoProvider,
  TrendsProvider,
  CrashesProvider,
  SymptomsProvider,
  ActivitiesProvider,
  MedicationsProvider,
  PacingDetailProvider,
  AddSheetProvider,
  AppleWatchProvider,
  PurchasesProvider,
  LimitProvider,
  UserProvider,
  ReferralsProvider,
  CheckInsProvider,
  OverlayContextProvider,
  AskProvider,
  PathizeDataProvider,
} from '.';
import {
  AuthContextNotRegisteredProps,
  AuthContextRegisteredProps,
  AuthContextNotRegistered,
  AuthContextRegistered,
} from '../CoreNav';
import {PathizeSelectedDayContextProvider} from './PathizeSelectedDayContext';
import {EnergyBudgetProvider} from '../features/energyBudget/contexts/EnergyBudgetContext';

/**
 * CONTEXTS AVAILABLE WHEN USER IS SIGNED OUT
 */

interface ContextProviderSignedOutProps {
  children: React.ReactNode;
  authContext: AuthContextNotRegisteredProps;
}

export const ContextProviderNotRegistered: React.FC<
  ContextProviderSignedOutProps
> = ({children, authContext}) => (
  <AuthContextNotRegistered.Provider value={authContext}>
    <BottomSheetModalProvider>
      <PurchasesProvider>
        <InfoProvider>
          <OverlayContextProvider>
            <PortalProvider>{children}</PortalProvider>
          </OverlayContextProvider>
        </InfoProvider>
      </PurchasesProvider>
    </BottomSheetModalProvider>
  </AuthContextNotRegistered.Provider>
);

/**
 * CONTEXTS AVAILABLE WHEN USER IS SIGNED IN
 */

interface ContextProviderSignedInProps {
  children: React.ReactNode;
  authContext: AuthContextRegisteredProps;
}

export const ContextProviderIsRegistered: React.FC<
  ContextProviderSignedInProps
> = ({children, authContext}) => (
  <AuthContextRegistered.Provider value={authContext}>
    <UserProvider>
      <AskProvider>
        <LimitProvider>
          <EnergyBudgetProvider>
            <TodayDataProvider>
              <CrashesProvider>
                <TerraProvider>
                  <PathizeDataProvider>
                    <PathizeSelectedDayContextProvider>
                      <PurchasesProvider>
                        <ActivitiesProvider>
                          <AppleWatchProvider>
                            <ReferralsProvider>
                              <ProfileProvider>
                                <NotificationsProvider>
                                  <UserPreferencesProvider>
                                    <InfoProvider>
                                      <TrendsProvider>
                                        <BottomSheetModalProvider>
                                          <SymptomsProvider>
                                            <MedicationsProvider>
                                              <CheckInsProvider>
                                                <PacingDetailProvider>
                                                  <AddSheetProvider>
                                                    <OverlayContextProvider>
                                                      <PortalProvider>
                                                        {children}
                                                      </PortalProvider>
                                                    </OverlayContextProvider>
                                                  </AddSheetProvider>
                                                </PacingDetailProvider>
                                              </CheckInsProvider>
                                            </MedicationsProvider>
                                          </SymptomsProvider>
                                        </BottomSheetModalProvider>
                                      </TrendsProvider>
                                    </InfoProvider>
                                  </UserPreferencesProvider>
                                </NotificationsProvider>
                              </ProfileProvider>
                            </ReferralsProvider>
                          </AppleWatchProvider>
                        </ActivitiesProvider>
                      </PurchasesProvider>
                    </PathizeSelectedDayContextProvider>
                  </PathizeDataProvider>
                </TerraProvider>
              </CrashesProvider>
            </TodayDataProvider>
          </EnergyBudgetProvider>
        </LimitProvider>
      </AskProvider>
    </UserProvider>
  </AuthContextRegistered.Provider>
);
