import React from 'react';
import {Image, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {Badge, Body1, Body1Pressable, Header2} from '@pathize/mobile-ui';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {SheetNavbar} from '../../../components/sheets';
import {AppBodyLayout} from '../../../components/layouts';
import {getCircular} from '../../../utils';

// images
const budget_0 = require('../../../assets/budget_0.png');
const budget_1 = require('../../../assets/budget_1.png');
const budget_2 = require('../../../assets/budget_2.png');
const budget_3 = require('../../../assets/budget_3.png');
const budget_4 = require('../../../assets/budget_4.png');
const budget_5 = require('../../../assets/budget_5.png');

export const EnergyBudgetHelpSheet: React.FC = () => {
  const posthog = usePostHog();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'ExertionGuidanceHelp'>
    >();
  const navigation = useNavigation<any>();

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="Home"
        backgroundColor="bg-white">
        <View style={tw`flex flex-row justify-start items-center`}>
          <Header2
            padding={false}
            text="What is my energy budget?"
            textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
          />
          <Badge
            text="Beta"
            textSize="xs"
            badgeBackgroundColor="bg-sky-200"
            textColor="text-sky-900"
            rounded="large"
            style={tw`ml-2`}
          />
        </View>
        <Body1
          padding={false}
          text="Energy budget is a recommended maximum time you should spend above your limit (anaerobic threshold) to avoid overexerting and potentially triggering PEM/crashing."
          textStyle={[tw`text-sm text-gray-600`, getCircular('Book')]}
        />
        <Header2
          paddingTop={true}
          text="How do you determine what my budget is? How does my budget change?"
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Body1
          padding={false}
          text="Your energy budget is determined by determining the average time you spend above your limit when you record crashes/PEM. When you record a crash, your budget will either decrease or increase based on how long you spent above your limit for that given period."
          textStyle={[tw`text-sm text-gray-600`, getCircular('Book')]}
        />
        {/* IS DISABLED - WHY */}
        <Header2
          paddingTop={true}
          text="Why is my energy budget disabled?"
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Body1
          padding={false}
          text="The energy budget feature requires that you record at least three crashes across three different days. This is to help maintain accuracy."
          textStyle={[tw`text-sm text-gray-600`, getCircular('Book')]}
        />
        {/* COLORED BAR */}
        {/* COLORED BAR */}
        {/* COLORED BAR */}
        <Header2
          paddingTop={true}
          text="What does the colored bar signify?"
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Body1
          padding={false}
          text="As you spend energy through the day, the colored bar fills up tp show how much of your budget you've used up. The bar stars empty, and progresses to red when you've neared or exceeded your budget."
          textStyle={[tw`text-sm text-gray-600`, getCircular('Book')]}
        />
        <View
          style={tw`flex flex-col justify-center items-center flex-1 -my-3`}>
          <Image
            source={budget_0}
            style={[tw`w-full -mb-14`, {resizeMode: 'contain'}]}
          />
          <Image
            source={budget_1}
            style={[tw`w-full -mb-14`, {resizeMode: 'contain'}]}
          />
          <Image
            source={budget_2}
            style={[tw`w-full -mb-14`, {resizeMode: 'contain'}]}
          />
          <Image
            source={budget_3}
            style={[tw`w-full -mb-14`, {resizeMode: 'contain'}]}
          />
          <Image
            source={budget_4}
            style={[tw`w-full -mb-14`, {resizeMode: 'contain'}]}
          />
          <Image
            source={budget_5}
            style={[tw`w-full`, {resizeMode: 'contain'}]}
          />
        </View>
        <Header2
          paddingTop={true}
          text="How will the energy budget feature change as time goes on?"
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Body1
          padding={false}
          text=" While in beta, your budget is purely determined by when you record crashes. In the future, energy budget will grow more and more accurate and consider more factors such as crash severity, symptom severity, and your bodies signals. We'll frequently make announcements about how energy budget is changing and improving."
          textStyle={[tw`text-sm text-gray-600`, getCircular('Book')]}
        />
        <Header2
          paddingTop={true}
          text="I get alerts for energy guidance but want to turn them off. How can I do this?"
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Body1Pressable
          padding={false}
          text="You can manage energy guidance alerts in notification settings."
          textStyle={[tw`text-sm text-gray-600`, getCircular('Book')]}
          onPress={() => {
            navigation.navigate('ProfileScreen', {
              screen: 'Notifications',
            });
          }}
        />
      </AppBodyLayout>
    </>
  );
};
