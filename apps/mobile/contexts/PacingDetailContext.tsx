import React, {
  ReactNode,
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch,
} from 'react';

export type PacingDetailContext = {
  pacingDetailSheetVisible: boolean;
  setPacingDetailSheetVisible: Dispatch<SetStateAction<boolean>>;
};

const PacingDetailContext = createContext<PacingDetailContext>({
  pacingDetailSheetVisible: false,
  setPacingDetailSheetVisible: () => {},
});

export const usePacingDetailContext = () => useContext(PacingDetailContext);

export const PacingDetailProvider = ({children}: {children: ReactNode}) => {
  const [pacingDetailSheetVisible, setPacingDetailSheetVisible] =
    useState<boolean>(false);

  return (
    <PacingDetailContext.Provider
      value={{pacingDetailSheetVisible, setPacingDetailSheetVisible}}>
      {children}
    </PacingDetailContext.Provider>
  );
};
