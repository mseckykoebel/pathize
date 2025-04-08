import React, {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {Alert, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {Portal, PortalHost} from '@gorhom/portal';
import tw from 'twrnc';

import {CustomSheetBackdrop, Handle as CustomSheetHandle} from '../layouts';
import {useOverlayContext} from '../../contexts';
import {InputField, PrimaryButton} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';

type DatePickerProps = {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

export const DatePickerOverlaySheet: React.FC<DatePickerProps> = ({
  selectedDate,
  setSelectedDate,
}) => {
  const {setPickerVisible} = useOverlayContext();
  const [selectedPickerDate, setSelectedPickerDate] =
    useState<Date>(selectedDate);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(async () => {
    setSelectedDate(selectedPickerDate); // set parent state hook only on close
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setPickerVisible(false);
    }, 100);
  }, [selectedPickerDate, setPickerVisible, setSelectedDate]);

  return (
    <>
      <Portal>
        <BottomSheet
          handleComponent={CustomSheetHandle}
          backdropComponent={CustomSheetBackdrop}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          onClose={handleClosePress}>
          <BottomSheetView style={tw`flex-1`}>
            <View>
              <DateTimePicker
                mode="date"
                value={selectedPickerDate ?? new Date(2000, 0, 1)}
                maximumDate={
                  new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                }
                minimumDate={
                  new Date(
                    new Date().getTime() - 100 * 365 * 24 * 60 * 60 * 1000,
                  )
                }
                display="spinner"
                onChange={(
                  _event: DateTimePickerEvent,
                  date: Date | undefined,
                ) => {
                  if (date) setSelectedPickerDate(date);
                }}
              />
            </View>
            <View style={tw`flex-1 justify-end pl-10 pr-10 pb-10`}>
              <PrimaryButton
                text="Confirm"
                onPress={() => {
                  handleClosePress();
                }}
                width="half"
                rounded="small"
                textStyle={[getCircular('Bold'), tw``]}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <PortalHost name="datePickerOverlay" />
    </>
  );
};

// type transformer - picker can take any generic item, so long as
// it has an ID and that ID is a string
export type ItemWithId<T> = T & {id: string};

const isString = (value: any): value is string => {
  return typeof value === 'string';
};

type PickerProps<T> = {
  items: ItemWithId<T>[];
  selectedItem: ItemWithId<T> | null;
  setSelectedItem: Dispatch<SetStateAction<ItemWithId<T> | null>>;
  labelKey: keyof T;
  portalHost?: string;
};

/**
 * @description this component is a generic picker overlay sheet that can be used for any single picker
 */
export const PickerOverlaySheet = <T,>({
  items,
  selectedItem,
  setSelectedItem,
  labelKey,
  portalHost,
}: PickerProps<T>) => {
  const {setPickerVisible, setPickerSource} = useOverlayContext();
  const [selectedPickerItem, setSelectedPickerItem] =
    useState<ItemWithId<T> | null>(selectedItem);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  const handleClosePress = useCallback(async () => {
    setSelectedItem(selectedPickerItem ?? items[0]); // set parent state hook only on close, default to first item in list if not changed
    setPickerSource('');
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setPickerVisible(false);
    }, 100);
  }, [
    items,
    selectedPickerItem,
    setPickerSource,
    setPickerVisible,
    setSelectedItem,
  ]);

  return (
    <>
      <Portal>
        <BottomSheet
          handleComponent={CustomSheetHandle}
          backdropComponent={CustomSheetBackdrop}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          onClose={handleClosePress}>
          <BottomSheetView style={tw`flex-1`}>
            <View>
              <Picker
                style={tw``}
                selectedValue={selectedPickerItem?.id ?? items[0]}
                onValueChange={itemValue => {
                  const foundItem = items.find(item => item.id === itemValue);
                  if (foundItem) {
                    setSelectedPickerItem(foundItem); // update state of picker, not the parent's state hook
                  }
                }}>
                {items.map((item, index) => {
                  const labelValue = item[labelKey as keyof typeof item];
                  const label = isString(labelValue)
                    ? labelValue
                    : labelValue?.toString() || 'Unknown';
                  return (
                    <Picker.Item key={index} label={label} value={item.id} />
                  );
                })}
              </Picker>
            </View>
            <View style={tw`flex-1 justify-end pl-10 pr-10 pb-10`}>
              <PrimaryButton
                text="Confirm"
                onPress={() => {
                  handleClosePress();
                }}
                width="half"
                rounded="small"
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <PortalHost name={portalHost ?? 'pickerOverlay'} />
    </>
  );
};

type InputOverlaySheetProps<T> = {
  inputHeader: string;
  initialValue: T;
  recordId?: string;
  loading: boolean;
  error: string | null;
  disabledWhenEmpty?: boolean;
  onUpdate: (...args: any[]) => void; // TODO: passes in any sort of update function - type better?
};

/**
 * @description this component is a generic input overlay sheet that can be used for any single input (non-picker, this is an input area)
 */
export const InputOverlaySheet = <T,>({
  inputHeader,
  recordId,
  initialValue,
  loading,
  error,
  disabledWhenEmpty = false,
  onUpdate,
}: InputOverlaySheetProps<T>) => {
  const {setPickerVisible} = useOverlayContext();
  const [editedValue, onEditedValueChange] = useState<string>(
    String(initialValue),
  ); // cast initial value as string
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const isEmpty = useMemo(() => editedValue === '', [editedValue]);

  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  const handleClosePress = useCallback(async () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setPickerVisible(false);
    }, 100);
  }, [setPickerVisible]);

  // useEffect to respond to error state
  useEffect(() => {
    if (error) {
      Alert.alert('Issue updating', error);
    }
  }, [error]);

  // useEffect to watch loading and error states
  const [prevLoading, setPrevLoading] = useState(false);
  useEffect(() => {
    if (prevLoading && !loading && error === null) {
      handleClosePress();
    }

    if (error) {
      setPrevLoading(false);
    }
    setPrevLoading(loading);
  }, [loading, error, handleClosePress, prevLoading]);

  return (
    <>
      <Portal>
        <BottomSheet
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
          }}
          handleComponent={CustomSheetHandle}
          backdropComponent={CustomSheetBackdrop}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          onClose={handleClosePress}>
          <BottomSheetView style={tw`flex-1`}>
            <View style={[tw`p-10`]}>
              <InputField
                padding={false}
                animations={false}
                headerText={inputHeader}
                value={String(editedValue)}
                onChangeText={onEditedValueChange}
                shouldHandleKeyboardEvents={true}
                inputBackgroundColor="bg-white"
                style={[tw``, getCircular('Book')]}
              />
            </View>
            <View style={tw`flex-1 justify-end pl-10 pr-10 pb-10`}>
              <PrimaryButton
                disabled={(disabledWhenEmpty && isEmpty) || loading}
                loading={loading}
                text="Update"
                onPress={() => {
                  onUpdate(recordId, editedValue);
                }}
                width="half"
                rounded="small"
                textStyle={[getCircular('Bold'), tw``]}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <PortalHost name="standardInputOverlay" />
    </>
  );
};
