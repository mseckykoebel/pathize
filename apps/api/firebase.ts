import admin, { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("FIREBASE_PRIVATE_KEY is not defined!");
}

const serviceAccount = {
  type: "service_account",
  project_id: "jupiterdx-mobile",
  private_key_id: "92340c454356ab042c94e3b728282406086f4a3c",
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
  client_email:
    "firebase-adminsdk-4iknq@jupiterdx-mobile.iam.gserviceaccount.com",
  client_id: "111801066208792419839",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4iknq%40jupiterdx-mobile.iam.gserviceaccount.com",
} as ServiceAccount;

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
