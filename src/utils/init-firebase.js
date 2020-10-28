import * as admin from "firebase-admin";

const serviceAccount = require("../credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mkulima-digital-5da90.firebaseio.com",
});
export const db = admin.firestore();

export default admin;
