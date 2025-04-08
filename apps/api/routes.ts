import { FastifyInstance } from "fastify";

import {
  deauthenticateTerraUserIdRoute,
  generateAuthTokenRoute,
  generateWidgetSessionRoute,
  getDailyActivityRoute,
  getDailyTimeFrameRoute,
  getTerraUserIdRoute,
  getTerraUserInfoRoute,
  getTerraUserInfoTesting,
  toWebhookRoute,
} from "./terra";
// healthcheck
import { healthCheckRoute } from "./healthcheck";
// users
import {
  createUserRoute,
  getUserRoute,
  getAllUsersRoute,
  updateUserRoute,
  getUserByEmailRoute,
  updateUserTimezoneOffsetRoute,
  createHealthAssessmentRoute,
  updateUserTimezoneRoute,
} from "./users";
// auth
import {
  loginRoute,
  tokenRoute,
  logoutRoute,
  deleteAccountRoute,
  sendPasswordResetEmailRoute,
  validateNewUserRoute,
  passwordResetRoute,
  validatePasswordResetRoute,
} from "./auth";
// devices
import {
  createDeviceConnectionRoute,
  updateDeviceConnectionRoute,
  getConnectedDevicesRoute,
  deleteDeviceRoute,
} from "./devices";
// targets
import {
  getTargetsRoute,
  updateTargetRoute,
  createTargetRoute,
} from "./targets";
// terra data
import {
  getDailyDataRoute,
  getPacingMetadataRoute,
  getTimeAboveLimitRoute,
} from "./data";

// crashes
import {
  createCrashRoute,
  getAllCrashesRoute,
  deleteCrashRoute,
  updateCrashRoute,
} from "./crashes";
// symptoms
import {
  getSymptomsRoute,
  getSymptomsFromDbRoute,
  createSymptomRoute,
  deleteSymptomRoute,
  getSymptomRecordsTimeFrameRoute,
  getUserSymptomsRoute,
  updateUserSymptomRoute,
  deleteUserSymptomRoute,
  updateSymptomRecordRoute,
  createUserSymptomRoute,
  getUserSymptomRoute,
} from "./symptoms";

// fcm
import {
  createFcmTokenRoute,
  getFcmTokensRoute,
  deleteFcmTokenRoute,
} from "./tokens";
// notifications
import {
  createNotificationRoute,
  getNotificationsRoute,
  updateNotificationRoute,
} from "./notifications";
// user preferences
import {
  getUserPreferencesRoute,
  createUserPreferencesRoute,
  updateUserPreferencesRoute,
} from "./preferences";
// logging
import { errorLoggingRoute } from "./logging";
// medications
import {
  createUserMedicationRoute,
  getAllUserMedicationsRoute,
  updateUserMedicationRoute,
  deleteUserMedicationRoute,
  createMedicationRoute,
  getMedicationRecordsRoute,
  deleteMedicationRecordRoute,
  updateMedicationRecordRoute,
  searchMedicationsFromDbRoute,
  getUserMedicationRoute,
} from "./medications";
// trends
import {
  getTrendsTimeFrameRoute,
  getCrashesTimeFrameRoute,
  getSymptomTrendsTimeFrame,
} from "./trends";

// activities
import {
  searchActivitiesFromDbRoute,
  createUserActivityRoute,
  getUserActivitiesRoute,
  updateUserActivityRoute,
  getActivityRecordsRoute,
  createActivityRecordRoute,
  deleteUserActivityRoute,
  updateActivityRecordRoute,
  deleteActivityRecordRoute,
} from "./activities";
// contact us
import { contactUsRoute } from "./contact";
// referral codes
import {
  getReferralCodeRoute,
  createReferralCodeRoute,
  getReferralCodesByRefereeRoute,
  createReferralRecordRoute,
  createPromotionRecordRoute,
  getPromotionRecordsRoute,
  updatePromotionRecordRoute,
  getReferralsByRefereeRoute,
} from "./referrals";
import { updateOrCreateEnergyBudget } from "./energyBudget";
// check-ins
import {
  createCheckInRoute,
  deleteCheckInRoute,
  getCheckInsRecordedOnDayRoute,
  getCheckInsRoute,
  updateCheckInRoute,
} from "./checkIns";
import { getCheckInRoute } from "./checkIns/getCheckIn";
import { updateFcmTokenRoute } from "./tokens/updateFcmToken";

// records generally
// import { getRecordsInRecentOrderRoute } from "./getInOrder";

// records generally
// import { getRecordsInRecentOrderRoute } from "./getInOrder";

// websockets

export function registerRoutes(fastify: FastifyInstance) {
  fastify.route(healthCheckRoute);
  // auth
  fastify.route(loginRoute);
  fastify.route(logoutRoute);
  fastify.route(tokenRoute);
  fastify.route(createUserRoute);
  fastify.route(updateUserTimezoneOffsetRoute);
  fastify.route(updateUserTimezoneRoute);
  fastify.route(getUserRoute);
  fastify.route(getAllUsersRoute);
  fastify.route(updateUserRoute);
  fastify.route(deleteAccountRoute);
  fastify.route(validateNewUserRoute);
  fastify.route(getUserByEmailRoute);
  fastify.route(sendPasswordResetEmailRoute);
  fastify.route(passwordResetRoute);
  fastify.route(validatePasswordResetRoute);
  fastify.route(createHealthAssessmentRoute);
  // data
  fastify.route(getDailyActivityRoute);
  fastify.route(getTerraUserIdRoute);
  fastify.route(getTerraUserInfoRoute);
  fastify.route(deauthenticateTerraUserIdRoute);
  fastify.route(getTerraUserInfoTesting);
  fastify.route(toWebhookRoute);
  fastify.route(getDailyTimeFrameRoute);
  // device connections
  fastify.route(generateWidgetSessionRoute);
  fastify.route(generateAuthTokenRoute);
  fastify.route(createDeviceConnectionRoute);
  fastify.route(updateDeviceConnectionRoute);
  fastify.route(getConnectedDevicesRoute);
  fastify.route(deleteDeviceRoute);
  // targets
  fastify.route(getTargetsRoute);
  fastify.route(updateTargetRoute);
  fastify.route(createTargetRoute);
  // cache
  fastify.route(getDailyDataRoute);
  // crash
  fastify.route(createCrashRoute);
  fastify.route(getAllCrashesRoute);
  fastify.route(deleteCrashRoute);
  fastify.route(updateCrashRoute);
  // pacing metadata
  fastify.route(getPacingMetadataRoute);
  fastify.route(getTimeAboveLimitRoute);
  // symptoms
  fastify.route(getSymptomsRoute);
  fastify.route(getSymptomsFromDbRoute);
  fastify.route(createSymptomRoute);
  fastify.route(updateSymptomRecordRoute);
  fastify.route(deleteSymptomRoute);
  fastify.route(getSymptomRecordsTimeFrameRoute);
  fastify.route(getUserSymptomsRoute);
  fastify.route(getUserSymptomRoute);
  fastify.route(updateUserSymptomRoute);
  fastify.route(deleteUserSymptomRoute);
  fastify.route(createUserSymptomRoute);
  // fcm
  fastify.route(createFcmTokenRoute);
  fastify.route(updateFcmTokenRoute);
  fastify.route(getFcmTokensRoute);
  fastify.route(deleteFcmTokenRoute);
  // notifications
  fastify.route(createNotificationRoute);
  fastify.route(getNotificationsRoute);
  fastify.route(updateNotificationRoute);
  // user preferences
  fastify.route(createUserPreferencesRoute);
  fastify.route(getUserPreferencesRoute);
  fastify.route(updateUserPreferencesRoute);
  // logging
  fastify.route(errorLoggingRoute);
  // medications
  fastify.route(createUserMedicationRoute);
  fastify.route(getAllUserMedicationsRoute);
  fastify.route(getUserMedicationRoute);
  fastify.route(updateUserMedicationRoute);
  fastify.route(deleteUserMedicationRoute);
  fastify.route(createMedicationRoute);
  fastify.route(getMedicationRecordsRoute);
  fastify.route(deleteMedicationRecordRoute);
  fastify.route(updateMedicationRecordRoute);
  fastify.route(searchMedicationsFromDbRoute);
  // trends
  fastify.route(getTrendsTimeFrameRoute);
  fastify.route(getCrashesTimeFrameRoute);
  fastify.route(getSymptomTrendsTimeFrame);
  // activities
  fastify.route(searchActivitiesFromDbRoute);
  fastify.route(createUserActivityRoute);
  fastify.route(getUserActivitiesRoute);
  fastify.route(updateUserActivityRoute);
  fastify.route(deleteUserActivityRoute);
  // activity records
  fastify.route(createActivityRecordRoute);
  fastify.route(getActivityRecordsRoute);
  fastify.route(updateActivityRecordRoute);
  fastify.route(deleteActivityRecordRoute);
  // contact us
  fastify.route(contactUsRoute);
  // referral codes
  fastify.route(getReferralCodeRoute);
  fastify.route(createReferralCodeRoute);
  fastify.route(getReferralCodesByRefereeRoute);
  fastify.route(createReferralRecordRoute);
  fastify.route(createPromotionRecordRoute);
  fastify.route(getPromotionRecordsRoute);
  fastify.route(updatePromotionRecordRoute);
  fastify.route(getReferralsByRefereeRoute);
  // energy budgeting
  fastify.route(updateOrCreateEnergyBudget);
  // check-ins
  fastify.route(createCheckInRoute);
  fastify.route(getCheckInsRoute);
  fastify.route(getCheckInsRecordedOnDayRoute);
  fastify.route(getCheckInRoute);
  fastify.route(updateCheckInRoute);
  fastify.route(deleteCheckInRoute);

  // records generally
  // fastify.route(getRecordsInRecentOrderRoute);
}
