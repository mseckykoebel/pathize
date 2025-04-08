import React, {useState} from 'react';
import {View} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {CrashNavigatorParamList} from '../../../screens/crashes/CrashNavigator';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {AppBodyLayout, SwipeDownScrollView} from '../../../components/layouts';
import {SheetNavbar} from '../../../components/sheets';
import {
  DarkButton,
  H2Text,
  InputText,
  LightButton,
  SeverityInput,
} from '../../../components/elements';

type Props = StackScreenProps<
  CrashNavigatorParamList,
  'EditCrashRecordSeverity'
>;

const EditCrashRecordSeverity: React.FC<Props> = ({route}) => {
  const {severity} = route.params.crash;
  const [crashSeverity, setCrashSeverity] = useState<number>(severity ?? 0);
  const homeNavigation =
    useNavigation<StackNavigationProp<HomeStackScreenParamList, 'Crashes'>>();
  const crashNavigation =
    useNavigation<
      StackNavigationProp<CrashNavigatorParamList, 'EditCrashRecordSeverity'>
    >();
  const posthog = usePostHog();

  return (
    <AppBodyLayout dismissKeyboardOnTouch={true}>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        navigation={homeNavigation}
        posthogEventName="Edit crash record sheet closed"
      />
      <SwipeDownScrollView navigator={homeNavigation} route={'Home'}>
        <View style={tw`px-4 pb-5`}>
          <H2Text text="Select how severe your PEM was on a scale of 1-5" />
          {/* SEVERITY PICKER */}
          <View style={tw`pt-1`}>
            <InputText
              text={
                "How would you rank this crash's severity on a scale of 1-5?"
              }
            />
            <SeverityInput
              severity={crashSeverity ?? 0}
              setSeverity={setCrashSeverity}
              lowerBoundText="Most minimal"
              upperBoundText="Most severe"
            />
          </View>
          {/* SOMETHING */}
        </View>
      </SwipeDownScrollView>
      <View style={tw`bottom-0 mb-12 items-center bg-white`}>
        <View style={tw`pt-5 w-50 mx-auto`}>
          <DarkButton
            onPress={() => {
              trigger('impactLight');
              posthog?.capture('Save crash severity button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Confirm',
              });
              crashNavigation.navigate('EditCrashRecord', {
                crash: {...route.params.crash, severity: crashSeverity},
              });
            }}
            text={'Confirm'}
            style={tw`mb-4`}
          />
          <LightButton
            onPress={() => {
              trigger('impactLight');
              posthog?.capture('Cancel crash severity time button pressed', {
                $screen_name: 'Home',
                component: 'DarkButton',
                buttonText: 'Cancel',
              });
              crashNavigation.goBack();
            }}
            text={'Cancel'}
          />
        </View>
      </View>
    </AppBodyLayout>
  );
};

export default EditCrashRecordSeverity;
