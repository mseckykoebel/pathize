import React, {useRef} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import {Portal, PortalHost} from '@gorhom/portal';
import tw from 'twrnc';

import {useInfoContext} from '../../contexts';
import {getCircular, viewWebPage} from '../../utils';
import {BottomSheetComponent} from '../layouts';
import {SheetNavbar} from './SheetNavbar';
import {Body1, Body1Pressable, Header2} from '@pathize/mobile-ui';

type Props = {
  portalIdentifier: string;
  headerText: string;
  text: string;
  textTwo?: string | null;
  linkText?: string | null;
  startingIndex: 0 | 1;
  onClose?: () => void;
};

const InfoSheet: React.FC<Props> = ({
  portalIdentifier,
  headerText,
  text,
  textTwo = null,
  linkText = null,
  startingIndex,
  onClose,
}) => {
  const navigation = useNavigation<any>(); // TODO: fix type
  const bottomSheetRef = useRef<BottomSheet>(null);
  const {showInfoSheet, setShowInfoSheet} = useInfoContext();

  const handleClose = () => {
    onClose && onClose();
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setShowInfoSheet(false);
    }, 200);
  };

  const openWebpage = () => {
    // if linkText contains the word 'notifications' then open the notifications page
    if (!linkText?.includes('notifications')) {
      viewWebPage('https://longcovid.physio/heart-rate-monitoring');
    } else {
      setShowInfoSheet(false);
      navigation.navigate('Notifications');
    }
  };

  return (
    <>
      <Portal>
        <BottomSheetComponent
          showSheet={showInfoSheet}
          setShowSheet={setShowInfoSheet}
          bottomSheetRef={bottomSheetRef}
          sheetName="InfoSheet"
          screenName="Limits"
          panDownToClose={false}
          startingIndex={startingIndex}>
          <SheetNavbar
            onClose={() => {
              handleClose();
            }}
            style={tw`-mt-5`}
          />
          <View style={tw`px-10 pb-5 z-2`}>
            <Header2
              text={headerText}
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <View style={[tw`flex flex-col mt-3`]}>
              <Body1
                text={text}
                textStyle={[
                  tw`text-sm font-normal text-gray-600 mb-3`,
                  getCircular('Book'),
                ]}
              />
              {textTwo && (
                <Body1
                  text={textTwo}
                  textStyle={[
                    tw`text-sm font-normal text-gray-600 mb-3`,
                    getCircular('Book'),
                  ]}
                />
              )}
              {linkText && (
                <Body1Pressable
                  text={linkText}
                  textStyle={[
                    tw`text-sm font-normal text-gray-600 mb-3 underline`,
                    getCircular('Book'),
                  ]}
                  onPress={openWebpage}
                />
              )}
            </View>
          </View>
        </BottomSheetComponent>
      </Portal>
      <PortalHost name={portalIdentifier} />
    </>
  );
};

export default InfoSheet;
