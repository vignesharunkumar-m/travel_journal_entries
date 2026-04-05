import { Platform, PermissionsAndroid } from 'react-native';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

import { IS_IOS } from './Constants';
import ToastHelper from '../Components/ToastHelper';

export async function requestCameraPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

    ToastHelper.fail('Camera permission denied');
    return false;
  } catch (error) {
    console.error('Camera Permission Error:', error);
    return false;
  }
}

export async function requestGalleryPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      return true;
    }

    const androidVersion = Number(Platform.Version);

    let permissionToRequest: any;

    if (androidVersion >= 33) {
      permissionToRequest = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    } else {
      permissionToRequest =
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    }

    const granted = await PermissionsAndroid.request(permissionToRequest, {
      title: 'Gallery Permission',
      message: 'Allow access to gallery to choose images.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    });

    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

    ToastHelper.fail('Gallery permission denied');
    return false;
  } catch (error) {
    console.error('Gallery Permission Error:', error);
    return false;
  }
}

export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Allow location access to attach your current coordinates.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    ToastHelper.fail('Location permission denied');
    return false;
  } catch (error) {
    console.error('Location Permission Error:', error);
    return false;
  }
}

export const requestNotificationPermission = async () => {
  if (IS_IOS) {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('iOS notification permission:', authStatus);
    }
  } else {
    await notifee.requestPermission();
  }
};
