import React, {
  ReactNode,
  createContext,
  useState,
  useContext,
  SetStateAction,
  Dispatch,
} from 'react';

export type ItemToRecord = 'Crash/PEM' | 'Symptom' | 'Medication' | 'Activity';

export type AddSheetContext = {
  showAddSheet: boolean;
  setShowAddSheet: Dispatch<SetStateAction<boolean>>;
  recordBeingAdded: ItemToRecord;
  setRecordBeingAdded: Dispatch<SetStateAction<ItemToRecord>>;
};

const AddSheetContext = createContext<AddSheetContext>({
  showAddSheet: false,
  setShowAddSheet: () => {},
  recordBeingAdded: 'Crash/PEM',
  setRecordBeingAdded: () => {},
});

export const useAddSheetContext = () => useContext(AddSheetContext);

export const AddSheetProvider = ({children}: {children: ReactNode}) => {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [recordBeingAdded, setRecordBeingAdded] =
    useState<ItemToRecord>('Crash/PEM');

  return (
    <AddSheetContext.Provider
      value={{
        showAddSheet,
        setShowAddSheet,
        recordBeingAdded,
        setRecordBeingAdded,
      }}>
      {children}
    </AddSheetContext.Provider>
  );
};
