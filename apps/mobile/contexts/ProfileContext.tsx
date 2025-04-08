import React, {
  ReactNode,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
} from 'react';

import {UserTarget} from '@pathize/db';

export type ProfileContext = {
  baseline: UserTarget | null;
  setBaseline: Dispatch<SetStateAction<UserTarget | null>>;
};

const ProfileContext = React.createContext<ProfileContext>({
  baseline: null,
  setBaseline: () => {},
});

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({children}: {children: ReactNode}) => {
  const [baseline, setBaseline] = useState<UserTarget | null>(null);

  return (
    <ProfileContext.Provider value={{baseline, setBaseline}}>
      {children}
    </ProfileContext.Provider>
  );
};
