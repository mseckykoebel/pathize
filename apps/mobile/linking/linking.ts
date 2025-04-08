import {LinkingOptions} from '@react-navigation/native';

type ParamList = {
  Home: undefined;
  HomeScreen: undefined;
  TrendScreen: undefined;
  ProfileScreen: {
    path: 'profile';
    screens: {
      Limits: undefined;
      Notifications: undefined;
      UserSymptoms: undefined;
      UserMedications: undefined;
      UserActivities: undefined;
      Devices: undefined;
      PersonalDetails: undefined;
      ContactUs: undefined;
      Refer: undefined;
    };
  };
};
const config = {
  screens: {
    Home: {
      screens: {
        HomeScreen: 'home:referralCode?',
        TrendScreen: 'trends',
        ProfileScreen: {
          path: 'profile',
          screens: {
            Limits: 'limits',
            Notifications: 'notifications',
            UserSymptoms: 'user-symptoms',
            UserMedications: 'user-medications',
            UserActivities: 'user-activities',
            Devices: 'devices',
            PersonalDetails: 'personal-details',
            ContactUs: 'contact-us',
            Refer: 'refer',
          },
        },
      },
    },
  },
};

const linking: LinkingOptions<ParamList> = {
  prefixes: [
    'jdxms://',
    'https://pathizehealth.com',
    'https://www.pathizehealth.com',
    'https://*.pathizehealth.com/',
  ],
  config,
};

export default linking;
