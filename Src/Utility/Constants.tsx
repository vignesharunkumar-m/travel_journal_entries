import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { LoadingTextKey } from '../@types/StaticTypes';

export const LOGINDATAKEY = 'ACHIRA_LOGIN';
export const PROFILEDETAILS = 'ACHIRA_PROFILE';

export const DOWNLOAD_FOLDER_NAME = 'Achira';

export const WINDOW_HEIGHT = Dimensions.get('window').height;
export const WINDOW_WIDTH = Dimensions.get('window').width;

export const IS_IOS = Platform.OS === 'ios';
export const DEVICE_ID = DeviceInfo.getDeviceId();

export const ACTIVE_OPACITY = 0.8;

export const BOX_SHADOW = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
};

export const LOADING_TEXT: { [key in LoadingTextKey]: string } = {
  EMPTY: '',
  LOGIN: 'Signing In...',
  LOGOUT: 'Logout...',
};
