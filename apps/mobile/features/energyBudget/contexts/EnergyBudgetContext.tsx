import React, {ReactNode, createContext, useCallback} from 'react';
import {useAuth} from '../../../CoreNav';
import {fetcher} from '../../../utils';

export type EnergyBudgetContext = {
  // HANDLE UPDATING ENERGY BUDGET NUMBER ON BACKEND
  updateEnergyBudget: (energyBudget: number) => Promise<void>;
};

export const EnergyBudgetContext = createContext<
  EnergyBudgetContext | undefined
>(undefined);

export const useEnergyBudgetContext = () => {
  const context = React.useContext(EnergyBudgetContext);
  if (context === undefined) {
    throw new Error(
      'useEnergyBudgetContext must be used within a EnergyBudgetProvider',
    );
  }
  return context;
};

export const EnergyBudgetProvider = ({children}: {children: ReactNode}) => {
  const {accessToken, userId} = useAuth();

  /**
   * @description - update the user's energy budget from the UI - only done from the front-end, so a patch request is all we need for this
   */
  const updateEnergyBudget = useCallback(
    async (energyBudget: number) => {
      try {
        const result = await fetcher('api/v1/updateOrCreateEnergyBudget', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({userId, energyBudget}),
        });

        console.log('Result: ', result);
      } catch (err) {
        console.log('Error updating energy budget: ', err);
      } finally {
        return;
      }
    },
    [accessToken, userId],
  );

  const value = {
    updateEnergyBudget,
  };

  return (
    <EnergyBudgetContext.Provider value={value}>
      {children}
    </EnergyBudgetContext.Provider>
  );
};
