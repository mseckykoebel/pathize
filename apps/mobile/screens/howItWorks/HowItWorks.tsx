import React, {useState, Dispatch, SetStateAction, useEffect} from 'react';
import {Dimensions, Text, View} from 'react-native';
import Video, {OnLoadData, ResizeMode} from 'react-native-video';
import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {
  FadeIn,
  Loading,
  PrimaryButton,
  SecondaryButton,
  Subheader,
  WalkthroughCard,
} from '@pathize/mobile-ui';
import {ClinicalSurvey} from '@pathize/db';
import {AppBodyLayout, MainAppLayout} from '../../components';
import {getCircular} from '../../utils';
import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {useTerraContext} from '../../contexts';
import {
  useAnalytics,
  useNotificationsStatus,
  useHealthAssessment,
} from '../../hooks';

type VideoLoadingProps = {
  setVideoLoading: Dispatch<SetStateAction<boolean>>;
  videoLoading: boolean;
  paused: boolean;
};

const VideoPlayer: React.FC<VideoLoadingProps> = ({
  setVideoLoading,
  videoLoading,
  paused,
}) => {
  const videoSource = require('../../assets/videos/pathize_product_tour.mp4');
  const [videoHeight, setVideoHeight] = useState(200);
  const [videoError, setVideoError] = useState(false);
  const [source, setSource] = useState<any | null>(null); // starts video loading on mount (for sanity)

  useEffect(() => {
    if (!source) {
      setSource(videoSource);
    }
  }, [source, videoSource]);

  const onVideoLoad = (data: OnLoadData) => {
    setVideoError(false);
    setVideoLoading(false);
    const {width, height} = data.naturalSize;
    const screenWidth = Dimensions.get('window').width; // Assuming you want it to fit the screen width
    const aspectRatio = height / width;

    setVideoHeight(screenWidth * aspectRatio);
  };
  return (
    <View style={tw``}>
      {/* VIDEO COMPONENT */}
      {source !== null && (
        <Video
          source={source}
          paused={paused}
          muted={false}
          controls={true}
          resizeMode={ResizeMode.CONTAIN}
          style={{width: '100%', height: videoHeight}}
          onLoadStart={() => {
            setVideoLoading(true);
          }}
          onLoad={onVideoLoad}
          onError={error => {
            console.error('Video error', error);
            setVideoLoading(false);
            setVideoError(true);
          }}
        />
      )}
      {/* VIDEO LOADING */}
      {videoLoading && (
        <Loading
          loading={videoLoading}
          style={tw`absolute inset-0 bg-transparent`}
        />
      )}
      {/* VIDEO ERROR */}
      {videoError && (
        <View style={tw`flex flex-row items-center justify-center`}>
          <Subheader text="Error playing video" />
        </View>
      )}
    </View>
  );
};

const Step: React.FC<{number: string}> = ({number}) => {
  return (
    <Text style={tw`text-center text-zinc-900 text-xs font-medium`}>
      {number}
    </Text>
  );
};

const BaselineAssessment: React.FC = () => {
  return (
    <Text style={[tw`text-black text-sm`, getCircular('Book')]}>
      We need to ask you a few questions about your health
      <Text style={[tw`text-black text-sm font-bold`]}> as of today</Text>. It
      should take less than 1 minute to complete.
    </Text>
  );
};

const ConnectWearable: React.FC = () => {
  return (
    <Text style={[tw`text-black text-sm`, getCircular('Book')]}>
      Pathize works by connecting to your wearable account. We use a service
      called Terra to do this.
    </Text>
  );
};

const ContinueToPathize: React.FC = () => {
  return (
    <Text style={[tw`text-black text-sm`, getCircular('Book')]}>
      Track everyday activities, symptoms, crashes/PEM, medications, & gain
      insights on managing your condition. We're excited to have you join us.
    </Text>
  );
};

const EnableNotifications: React.FC = () => {
  return (
    <Text style={[tw`text-black text-sm`, getCircular('Book')]}>
      Our Apple Watch app provides real-time exertion feedback to help you learn
      your limits and prevent crashes. Enable notifications to receive alerts,
      and configure a morning and evening reminder.
    </Text>
  );
};

const StepOne: React.FC<{
  disabled: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  routeParams: any;
}> = ({disabled, setPaused, routeParams}) => {
  const navigation = useNavigation<any>(); //TODO: Fix this any type
  return (
    <WalkthroughCard
      headerText="Establish Baseline"
      textChild={<BaselineAssessment />}
      alertChild={<Step number="1" />}
      bottomChild={
        disabled ? (
          <PrimaryButton
            textStyle={[getCircular('Book'), tw``]}
            padding={false}
            text={'Complete health assessment'}
            onPress={() => {
              setPaused(true);
              navigation.navigate('HealthAssessment', {});
            }}
            rounded="small"
            disabled={false}
          />
        ) : (
          <SecondaryButton
            textStyle={[getCircular('Book'), tw``]}
            padding={false}
            text={'Edit Health Assessment'}
            onPress={() => {
              navigation.navigate('HealthAssessment', {
                buttons: routeParams.buttons,
                healthAssessment: routeParams.healthAssessment,
              });
            }}
            rounded="small"
            disabled={false}
          />
        )
      }
    />
  );
};

const StepTwo: React.FC<{
  disabled: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}> = ({disabled, setPaused}) => {
  const {terraDevice, terraDeviceLoading: loading, error} = useTerraContext();
  const {connectTerraDevice} = useTerraContext();

  return (
    <WalkthroughCard
      headerText="Connect Wearable"
      textChild={<ConnectWearable />}
      alertChild={<Step number="2" />}
      bottomChild={
        !terraDevice ? (
          <PrimaryButton
            textStyle={[getCircular('Book'), tw``]}
            padding={false}
            text={'Connect wearable'}
            onPress={() => {
              connectTerraDevice();
              setPaused(true);
            }}
            rounded="small"
            loading={loading}
            disabled={disabled}
          />
        ) : error ? (
          <PrimaryButton
            textStyle={[getCircular('Book'), tw``]}
            padding={false}
            text={'There was an issue, please try this later'}
            onPress={() => {}}
            rounded="small"
            disabled={true}
          />
        ) : (
          <SecondaryButton
            textStyle={[getCircular('Book'), tw``]}
            padding={false}
            text={'Connection successful!'}
            onPress={() => {}}
            disabled={true}
            rounded="small"
          />
        )
      }
    />
  );
};

const StepThree: React.FC<{
  disabled: boolean;
}> = ({disabled}) => {
  const {isAuthorized, requestPermission} = useNotificationsStatus();
  const [triedAuthorizing, setTriedAuthorizing] = useState(false);

  return (
    <WalkthroughCard
      headerText="Real-time Alerts"
      textChild={<EnableNotifications />}
      alertChild={<Step number="3" />}
      bottomChild={
        <PrimaryButton
          padding={false}
          text={
            isAuthorized
              ? 'Notifications enabled!'
              : !isAuthorized && !triedAuthorizing
                ? 'Enable notifications'
                : 'Saved for later'
          }
          onPress={() => {
            if (!isAuthorized && !triedAuthorizing) {
              setTriedAuthorizing(true);
              requestPermission();
              return;
            }
          }}
          rounded="small"
          disabled={
            disabled
              ? true
              : isAuthorized
                ? true
                : !isAuthorized && triedAuthorizing
                  ? true
                  : false
          }
        />
      }
    />
  );
};

const StepFour: React.FC<{
  healthAssessment: ClinicalSurvey | undefined;
  disabled: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}> = ({healthAssessment, disabled, setPaused}) => {
  const {createHealthAssessment, loading} = useHealthAssessment();
  const navigation = useNavigation<any>(); //TODO: Fix this any type

  // create a new health assessment, error quietly if it does not save
  const createNewHealthAssessment = async () => {
    if (!healthAssessment) {
      console.log('Health assessment undefined, something went wrong');
      return;
    }
    return await createHealthAssessment(healthAssessment);
  };

  return (
    <WalkthroughCard
      headerText="Welcome to the Pathize Open Beta"
      textChild={<ContinueToPathize />}
      alertChild={<Step number="4" />}
      bottomChild={
        <PrimaryButton
          textStyle={[getCircular('Book'), tw``]}
          padding={false}
          text={'Continue to Pathize'}
          onPress={() => {
            setPaused(true);
            createNewHealthAssessment();
            navigation.navigate('Payments');
          }}
          rounded="small"
          loading={loading}
          disabled={disabled ? true : false}
        />
      }
    />
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'HowItWorks'
>;

const HowItWorksScreen: React.FC<Props> = ({route}) => {
  const {params} = route;
  const {interfaceEvent} = useAnalytics();
  const [paused, setPaused] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'HowItWorks'});
  }, [interfaceEvent]);

  return (
    <MainAppLayout statusBarStyle="light-content" backgroundColor="bg-white">
      {/* VIDEO PLAYER AREA */}
      <VideoPlayer
        setVideoLoading={setVideoLoading}
        videoLoading={videoLoading}
        paused={paused}
      />
      <Subheader
        style={[getCircular('Book'), tw`my-3 text-center text-xs`]}
        padding={false}
        text="Click to play welcome video"
      />
      <AppBodyLayout
        style={[tw``]}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}
        scrollable={true}
        backgroundColor="bg-white">
        {/* LIST AREA */}
        <FadeIn duration={2000}>
          <Subheader
            textType="medium"
            textColor="black"
            style={[getCircular('Medium'), tw``]}
            padding={false}
            text="Getting Started"
          />
          {/* WALKTHROUGH CARD ESTABLISH BASELINE (PARAMS INITIALLY UNDEFINED - SORRY THIS IS SHITTY)*/}
          <StepOne
            disabled={
              params === undefined || params.healthAssessment === undefined
            }
            setPaused={setPaused}
            routeParams={params}
          />
          <StepTwo
            disabled={
              params === undefined || params.healthAssessment === undefined
            }
            setPaused={setPaused}
          />
          <StepThree
            disabled={
              params === undefined || params.healthAssessment === undefined
            }
          />
          <StepFour
            healthAssessment={
              params && params.healthAssessment
                ? params.healthAssessment
                : undefined
            }
            disabled={
              params === undefined || params.healthAssessment === undefined
            }
            setPaused={setPaused}
          />
        </FadeIn>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default HowItWorksScreen;
