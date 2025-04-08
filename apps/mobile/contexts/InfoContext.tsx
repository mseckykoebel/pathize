import React, {
  ReactNode,
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch,
} from 'react';

export type InfoContext = {
  showInfoSheet: boolean;
  setShowInfoSheet: Dispatch<SetStateAction<boolean>>;
};

const InfoContext = createContext<InfoContext>({
  showInfoSheet: false,
  setShowInfoSheet: () => {},
});

export const useInfoContext = () => useContext(InfoContext);

export const InfoProvider = ({children}: {children: ReactNode}) => {
  const [showInfoSheet, setShowInfoSheet] = useState<boolean>(false);

  return (
    <InfoContext.Provider value={{showInfoSheet, setShowInfoSheet}}>
      {children}
    </InfoContext.Provider>
  );
};
