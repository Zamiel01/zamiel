import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export const cloudinaryCloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
export const cloudinaryUploadPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export const hasCloudinaryConfig = Boolean(
  cloudinaryCloudName && cloudinaryUploadPreset
);

export function getMemoriesDb(): Firestore {
  if (!hasFirebaseConfig) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID."
    );
  }

  const existingApp = getApps().find(
    (app) =>
      app.options.projectId === firebaseConfig.projectId &&
      app.options.apiKey === firebaseConfig.apiKey
  );
  const app =
    existingApp ??
    initializeApp(
      firebaseConfig,
      `memories-${firebaseConfig.projectId}`
    );

  return getFirestore(app);
}

export function isCloudinaryImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      /^\/[a-zA-Z0-9_-]+\/image\/upload\//.test(url.pathname)
    );
  } catch {
    return false;
  }
}
