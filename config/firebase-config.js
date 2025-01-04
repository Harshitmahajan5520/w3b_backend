import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.Firebase_apiKey,
    authDomain: process.env.Firebase_authDomain,
    projectId: process.env.Firebase_projectId,
    storageBucket: process.env.Firebase_storageBucket,
    messagingSenderId: process.env.Firebase_messagingSenderId,
    appId: process.env.Firebase_appId,
    measurementId: process.env.Firebase_measurementId,
    databaseUrl: process.env.Firebase_databaseUrl
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export {database}
