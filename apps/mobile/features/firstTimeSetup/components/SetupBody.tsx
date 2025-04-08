import React from 'react';
import {StyleProp, TextStyle, View} from 'react-native';
import {faClose} from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {
  Body1,
  FadeIn,
  RoundedButtonWithIcon,
  Header1,
} from '@pathize/mobile-ui';
import {useUserContext} from '../../../contexts';
import {useAsyncStorage} from '../../../hooks';
import {SetupItemsList} from './SetupItemsList';
import {getCooper} from '../../../utils';

type Props = {
  horizontalPadding?: boolean;
  verticalPadding?: boolean;
  headerStyle?: StyleProp<TextStyle>;
  bodyStyle?: StyleProp<TextStyle>;
};

export const SetupBody: React.FC<Props> = ({
  horizontalPadding = true,
  verticalPadding = true,
  bodyStyle = {},
}) => {
  const [isSetupDisabled, setIsSetupDisabled] = useAsyncStorage(
    'isSetupDisabled',
    false,
  );
  const {user} = useUserContext();
  if (!user) return null;

  // has the user created an account in the last 14 days?
  // this ignores if they have logged out and then logged back in again
  const isUserRelativelyNew = dayjs(user.createdAt).isAfter(
    dayjs().subtract(14, 'day'),
  );
  if (!isUserRelativelyNew) return null;

  const updateIsSetupDisabled = async (val: boolean) => {
    return await setIsSetupDisabled(val);
  };

  // const resetIsSetup = async () => {
  //   return await resetSetup();
  // };
  // resetIsSetup();

  if (isSetupDisabled) return null;

  const header = `Welcome to Pathize, ${user.firstName}!`;

  const subheader1 =
    "We're excited for you to get started with us, and for the chance to make Pathize an important part of your regimen.";
  const subheader2 =
    "Below, you'll find a list of helpful items to help get you set everything up, how to start to get insights, and how to get any additional support.";

  // padding is same as other elements on the home screen
  return (
    <FadeIn
      duration={250}
      style={[
        tw`flex-1 ${horizontalPadding ? 'px-8 mt-4' : ''} ${
          verticalPadding ? 'py-6' : ''
        }`,
      ]}>
      <View style={[tw`flex flex-col justify-start`]}>
        {/* TOP AREA */}
        <View style={[tw`flex flex-row justify-between items-start`]}>
          {/* TEXT ON RIGHT */}
          <View style={[tw`flex flex-col items-start w-60`]}>
            <Header1
              text={header}
              padding={false}
              style={[getCooper(), tw`mb-3`]}
            />
            <Body1 text={subheader1} textStyle={[tw``, bodyStyle]} />
          </View>
          {/* BUTTON ON LEFT */}
          <RoundedButtonWithIcon
            icon={faClose}
            hapticFeedback={true}
            iconSize={18}
            iconColor="#111827"
            iconBackgroundColor="bg-gray-200"
            style={tw``}
            onPress={() => updateIsSetupDisabled(!isSetupDisabled)}
          />
        </View>
        {/* BOTTOM LIST */}
        <Body1 text={subheader2} textStyle={[tw``, bodyStyle]} padding={true} />
        <SetupItemsList />
      </View>
    </FadeIn>
  );
};
