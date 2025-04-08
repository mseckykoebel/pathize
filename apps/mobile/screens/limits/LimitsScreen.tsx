import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {DrawerScreenProps} from '@react-navigation/drawer';
import tw from 'twrnc';

import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {
  useInfoContext,
  useLimitContext,
  useOverlayContext,
} from '../../contexts';
import InfoSheet from '../../components/sheets/InfoSheet';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {
  Alert,
  ChevronDown,
  FadeInFadeOut,
  InputFieldReadOnly,
} from '@pathize/mobile-ui';
import {InputOverlaySheet} from '../../components/sheets';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';

type Props = DrawerScreenProps<ProfileScreenParamList, 'Limits'>;

const LimitsScreen: React.FC<Props> = () => {
  const [faq, setFaq] = useState<string>('limit');

  const {
    limitRecord,
    updateLimitLoading: loading,
    updateLimitError: error,
    getLimit,
    updateLimit,
  } = useLimitContext();
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const {pickerVisible, setPickerVisible} = useOverlayContext();
  const {showInfoSheet, setShowInfoSheet} = useInfoContext();

  useEffect(() => {
    if (!limitRecord) {
      getLimit();
    }
  }, [getLimit, limitRecord]);

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'Limits',
    });
  }, [interfaceEvent]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={false}
        scrollable={false}
        dismissKeyboardOnTouch={false}>
        <View style={tw`flex-1`}>
          {/* ERROR IF NO LIMIT */}
          {!limitRecord && (
            <FadeInFadeOut duration={200} watchValue={limitRecord === null}>
              <Alert
                headerText="There was an issue fetching your Limit"
                textChild="We had an issue on our end getting your Limit. Please try again in a few minutes."
                alertChild={'!'}
              />
            </FadeInFadeOut>
          )}
          {/* INPUT AREA FOR CHOOSING LIMIT */}
          {limitRecord && (
            <InputFieldReadOnly
              style={[tw``, getCircular('Book')]}
              inputBackgroundColor="bg-white"
              borderAlways={true}
              padding={false}
              onFocus={() => {
                trigger('impactLight');
                setPickerVisible(true);
              }}
              headerText="Limit (bpm)"
              placeholderText="Limit not set. Tap to select and set a limit"
              value={limitRecord ? String(limitRecord.target) : ''}
              rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
            />
          )}
          {/* PICKER IS VISIBLE */}
          {pickerVisible && limitRecord && (
            <InputOverlaySheet
              inputHeader="Editing limit"
              initialValue={limitRecord ? limitRecord.target : ''}
              loading={loading}
              error={error}
              onUpdate={updateLimit}
              recordId={limitRecord.id}
              disabledWhenEmpty={true}
            />
          )}
        </View>
        <View style={tw`flex-1 justify-end`}>
          <View style={tw`mt-1 rounded-md h-auto`}>
            <TouchableOpacity
              onPress={() => {
                trigger('impactLight');
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'Limits',
                  value: 'What is my limit?',
                });
                setFaq('limit');
                setShowInfoSheet(true);
              }}
              style={tw`flex flex-row justify-between items-center py-4`}>
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-700`,
                  getCircular('Book'),
                ]}>
                What is my limit?
              </Text>
              <FontAwesomeIcon
                icon={faChevronRight}
                size={20}
                color="#d1d5db"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                trigger('impactLight');
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'Limits',
                  value: 'How does this limit benefit me?',
                });
                setFaq('benefit');
                setShowInfoSheet(true);
              }}
              style={tw`flex flex-row justify-between items-center py-4`}>
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-700`,
                  getCircular('Book'),
                ]}>
                How does this limit benefit me?
              </Text>
              <FontAwesomeIcon
                icon={faChevronRight}
                size={20}
                color="#d1d5db"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                trigger('impactLight');

                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'Limits',
                  value: 'How does Pathize determine my limit?',
                });

                setFaq('determine');
                setShowInfoSheet(true);
              }}
              style={tw`flex flex-row justify-between items-center py-4`}>
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-700`,
                  getCircular('Book'),
                ]}>
                How does Pathize determine my limit?
              </Text>
              <FontAwesomeIcon
                icon={faChevronRight}
                size={20}
                color="#d1d5db"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                trigger('impactLight');
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'Limits',
                  value: 'When should I change my limit?',
                });
                setFaq('change');
                setShowInfoSheet(true);
              }}
              style={tw`flex flex-row justify-between items-center py-4 border-gray-300`}>
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-700`,
                  getCircular('Book'),
                ]}>
                When should I change my limit?
              </Text>
              <FontAwesomeIcon
                icon={faChevronRight}
                size={20}
                color="#d1d5db"
              />
            </TouchableOpacity>
          </View>
        </View>
      </AppBodyLayout>
      {/* SHOWING THE POP-UP INFO SHEET */}
      {showInfoSheet && faq === 'limit' && (
        <InfoSheet
          portalIdentifier="whatsMyLimit"
          headerText={'What is my limit?'}
          text={
            'The limit, or your anaerobic threshold, is the heart rate beyond which you draw on energy reserves, potentially triggering post-exertional malaise (PEM). This limit is different for every person.'
          }
          startingIndex={0}
        />
      )}
      {showInfoSheet && faq === 'benefit' && (
        <InfoSheet
          portalIdentifier="howDoesThisLimitBenefitMe"
          headerText={'How does this limit benefit me?'}
          text={
            'By determining a safe heart rate limit, you can begin to determine your current energy threshold. As you use Pathize, you can identify how long you can spend over your limit without triggering PEM.'
          }
          startingIndex={0}
        />
      )}
      {showInfoSheet && faq === 'determine' && (
        <InfoSheet
          portalIdentifier="howDoesPathizeDetermineMyLimit"
          headerText={'How does Pathize determine my limit?'}
          text={
            'As a starting point, we determine your limit, AKA, your estimated anaerobic threshold, using a simple formula: (220 - your age) * .55 bpm.'
          }
          textTwo={
            'While determining your limit is not an exact science, and involves some trial and error, our mission is to put you on the right path as quickly as possible. As a reminder, always consult with a doctor, medical professional, or other resources to make the most informed decision on how to guide your health.'
          }
          linkText={
            'More information on determining your limit with this method can be found here.'
          }
          startingIndex={1}
        />
      )}
      {showInfoSheet && faq === 'change' && (
        <InfoSheet
          portalIdentifier="whenShouldIChangeMyLimit"
          headerText={'When should I change my limit?'}
          text={
            'You should consider either increasing or decreasing your limit to balance daily activities, and your energy levels/symptom severity.'
          }
          textTwo={
            "For example, if you're spending too much time over your limit, and experiencing symptom exacerbation, you may want to consider lowering your limit to compensate. If you're not experiencing exacerbation, you may want to consider increasing it."
          }
          startingIndex={1}
        />
      )}
    </MainAppLayout>
  );
};

export default LimitsScreen;
