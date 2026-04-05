import { getApp } from '@react-native-firebase/app';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';

function getDb() {
  return getFirestore(getApp());
}

export async function syncUserProfile(user: FirebaseAuthTypes.User) {
  const userRef = doc(getDb(), 'users', user.uid);
  const existingSnapshot = await getDoc(userRef);

  await setDoc(
    userRef,
    {
      userId: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? '',
      profileImage: user.photoURL ?? '',
      createdAt: existingSnapshot.exists()
        ? existingSnapshot.data()?.createdAt ?? Date.now()
        : Date.now(),
    },
    { merge: true },
  );
}
