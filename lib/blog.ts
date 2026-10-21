import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const hasBlogFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

function getBlogApp() {
  if (!hasBlogFirebaseConfig) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_APP_ID variables."
    );
  }

  const existingApp = getApps().find(
    (app) =>
      app.options.projectId === firebaseConfig.projectId &&
      app.options.apiKey === firebaseConfig.apiKey
  );

  return (
    existingApp ??
    initializeApp(firebaseConfig, `blog-${firebaseConfig.projectId}`)
  );
}

export function getBlogFirebase(): { auth: Auth; db: Firestore } {
  const app = getBlogApp();
  return { auth: getAuth(app), db: getFirestore(app) };
}
