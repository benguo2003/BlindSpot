// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getStorage, ref} from "firebase/storage";
import { initializeAuth, getAuth, getReactNativePersistence, GoogleAuthProvider,signInWithPopup} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import axios from 'axios';


import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  OPENAI_API_KEY,
  OPENAI_PROJECT_ID,
} from '@env';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
};


// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
const auth = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const STORAGE = getStorage(FIREBASE_APP);

module.exports = { FIREBASE_DB, chatGPTRequest };

//console.log(FIREBASE_API_KEY);

export async function chatGPTRequest(system_prompt, question) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Openai-Project': OPENAI_PROJECT_ID,
  };

  const data = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: question }
      ]
  };
  try {
      //   console.log(OPENAI_API_KEY, OPENAI_PROJECT_ID);
      const response = await axios.post(url, data, { headers });
      //console.log('Response:', response.data);
      console.log(response.data.choices[0].message.content);
  } catch (error) {
      console.error('Error:', error);
  }
}

// question = "What is the best time to have breakfast?";
// chatGPTRequest(question);
