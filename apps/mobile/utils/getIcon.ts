import {faApple} from '@fortawesome/free-brands-svg-icons';
import {faFaceSmileBeam, faHand} from '@fortawesome/free-regular-svg-icons';
import {
  IconDefinition,
  faBed,
  faBrain,
  faCarCrash,
  faHeartPulse,
  faLungs,
  faMeh,
  faPerson,
  faPersonBurst,
  faPersonCircleExclamation,
  faSquarePersonConfined,
  faWalking,
  faPills,
  faBookMedical,
  faLink,
  faWarning,
  faMessage,
  faShoppingBag,
  faUserFriends,
  faPersonWalking,
  faUserEdit,
  faHandsWash,
  faPaw,
  faHeartCircleCheck,
  faKitchenSet,
  faHouse,
  faCouch,
  faCar,
  faBriefcase,
  faSchoolCircleCheck,
  faPhone,
  faMailBulk,
  faGift,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';

export const getIcon = (category: string): IconDefinition => {
  switch (category) {
    case 'Crash':
      return faCarCrash;
    case 'Symptom':
      return faBookMedical;
    case 'UserSymptoms':
      return faBookMedical;
    case 'Medication':
      return faPills;
    case 'Sleep':
      return faBed;
    case 'Physical':
      return faWalking;
    case 'Respiratory':
      return faLungs;
    case 'Heart':
      return faHeartPulse;
    case 'Neurological':
      return faBrain;
    case 'Immune':
      return faSquarePersonConfined;
    case 'Endocrine':
      return faPersonCircleExclamation;
    case 'Pain':
      return faPersonBurst;
    case 'Gastrointestinal':
      return faPerson;
    case 'Orthostatic':
      return faPerson;
    case 'Medication':
      return faPills;
    case 'Devices':
      return faLink;
    case 'Limits':
      return faWarning;
    case 'Notifications':
      return faMessage;
    case 'Medications':
      return faPills;
    case 'UserMedications':
      return faPills;
    case 'PersonalDetails':
      return faUserEdit;
    case 'Activities':
      return faPersonWalking;
    case 'UserActivities':
      return faPersonWalking;
    case 'Activity':
      return faPersonWalking;
    case 'Hygiene':
      return faHandsWash;
    case 'Physical health and wellness':
      return faWalking;
    case 'Mental and emotional wellness':
      return faFaceSmileBeam;
    case 'Pet care':
      return faPaw;
    case 'Health management':
      return faHeartCircleCheck;
    case 'Meal preparation and consumption':
      return faKitchenSet;
    case 'Household chores':
      return faHouse;
    case 'Leisure and entertainment':
      return faCouch;
    case 'Transportation':
      return faCar;
    case 'Work-related activities':
      return faBriefcase;
    case 'Shopping':
      return faShoppingBag;
    case 'Social activities':
      return faUserFriends;
    case 'Educational activities':
      return faSchoolCircleCheck;
    case 'Resting':
      return faBed;
    case 'Digital media use':
      return faPhone;
    case 'ContactUs':
      return faMailBulk;
    case 'Crashes':
      return faCarCrash;
    case 'Symptoms':
      return faBookMedical;
    case 'Test':
      return faApple;
    case 'Refer':
      return faGift;
    case 'FAQ':
      return faHand;
    case 'UserCheckIns':
      return faListCheck;
    default:
      return faMeh;
  }
};
