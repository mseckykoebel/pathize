import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {DrawerScreenProps} from '@react-navigation/drawer';
import tw from 'twrnc';

import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {useTerraContext} from '../../contexts';
import {
  Body1,
  DangerButton,
  FadeInFadeOut,
  PrimaryButtonCard,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';

type Props = DrawerScreenProps<ProfileScreenParamList, 'Devices'>;

const DevicesScreen: React.FC<Props> = (): JSX.Element => {
  const {
    terraDevice,
    getTerraDevice,
    disconnectTerraDevice,
    terraDeviceLoading: loading,
    deleteDeviceLoading,
    connectTerraDevice,
    error,
    getUserGrantedPermissions,
    userGrantedPermissions,
  } = useTerraContext();
  const {interfaceEvent, interactionEvent} = useAnalytics();

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'Devices',
    });

    const init = async () => {
      if (!userGrantedPermissions) {
        getUserGrantedPermissions();
      }
      if (!terraDevice) {
        await getTerraDevice();
      }
    };
    init();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={false}
        scrollable={true}
        dismissKeyboardOnTouch={false}
        absoluteBottomChild={
          terraDevice ? (
            <FadeInFadeOut duration={200} watchValue={terraDevice !== null}>
              <View style={tw`flex-1 justify-end`}>
                <DangerButton
                  text="Disconnect"
                  padding={true}
                  rounded="small"
                  width="half"
                  onPress={() => {
                    interactionEvent('Button', 'Pressed', {
                      $screen_name: 'Devices',
                      value: 'Disconnect button pressed',
                    });
                    disconnectTerraDevice(terraDevice.id, terraDevice.userId);
                  }}
                  loading={deleteDeviceLoading}
                  textStyle={[getCircular('Bold'), tw``]}
                />
              </View>
            </FadeInFadeOut>
          ) : undefined
        }>
        <View style={tw`flex-1`}>
          {/* ADD NEW BUTTON IF NO DEVICE */}
          {!terraDevice && (
            <FadeInFadeOut duration={200} watchValue={terraDevice === null}>
              <PrimaryButtonCard
                onPress={async () => {
                  interactionEvent('Button', 'Pressed', {
                    $screen_name: 'Devices',
                    value: 'Connect with Apple',
                  });

                  return await connectTerraDevice();
                }}
                headerText="Connect to Apple Health"
                textChild="Pathize works best when you're connected to Apple Health. If you don't have an Apple Watch, you can still connect to Apple Health to track data from other sources."
                padding={false}
                bodyTextStyle={[tw`text-black text-sm`, getCircular('Book')]}
                headerTextStyle={[tw`text-xl`, getCircular('Book')]}
                buttonStyle={[tw`w-full m-0`, getCircular('Book')]}
                buttonText="Connect with Apple"
                buttonLoading={loading}
                backgroundColor="bg-white"
              />
            </FadeInFadeOut>
          )}
          {/* LIST DEVICE HERE */}
          {terraDevice && (
            <FadeInFadeOut duration={200} watchValue={terraDevice !== null}>
              <Subheader
                text={`You're connected to Apple Health!${
                  userGrantedPermissions
                    ? ' You can manage the data Pathize has access to, and to grant and revoke permissions, inside of your Apple Health settings.'
                    : null
                } `}
                style={[tw``, getCircular('Book')]}
              />
              {userGrantedPermissions &&
                userGrantedPermissions.map((permission, index) => (
                  <Body1
                    key={index}
                    text={String(permission)}
                    textStyle={[tw``, getCircular('Book')]}
                  />
                ))}
              {/* LIST OF PERMISSIONS */}
            </FadeInFadeOut>
          )}
          <View style={[tw`my-9 items-center`]}>
            {/* ERROR AREA */}
            {error && <Text>{error}</Text>}
          </View>
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default DevicesScreen;
