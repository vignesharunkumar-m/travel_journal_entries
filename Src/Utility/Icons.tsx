import signout_icon from '../Assets/Svg/signout_icon.svg';
import toastTickIcon from '../Assets/Svg/toast_tick.svg';
import toastUnTickIcon from '../Assets/Svg/toast_untick.svg';
import google_icon from '../Assets/Svg/google_icon.svg';
import cancelIcon from '../Assets/Svg/cancel_icon.svg';
import backArrow from '../Assets/Svg/backArrow.svg';
import dummyProfile from '../Assets/Svg/dummyProfile.svg';
import photos from '../Assets/Svg/photos.svg';
import camera from '../Assets/Svg/camera.svg';
import mic from '../Assets/Svg/mic.svg';
import calendar from '../Assets/Svg/calendar.svg';
import crop from '../Assets/Svg/crop.svg';
import settingsIcon from '../Assets/Svg/settings.svg';
import cameraBlackIcon from '../Assets/Svg/camera_black.svg';
import downArrowBlackIcon from '../Assets/Svg/down_arrow_black.svg';
import tickIcon from '../Assets/Svg/tick.svg';
import close_white from '../Assets/Svg/close_white.svg';
import theme_sun from '../Assets/Svg/theme_sun.svg';
import theme_moon from '../Assets/Svg/theme_moon.svg';

export type IconType =
  | 'signout_icon'
  | 'toastTickIcon'
  | 'toastUnTickIcon'
  | 'google_icon'
  | 'cancelIcon'
  | 'backArrow'
  | 'dummyProfile'
  | 'photos'
  | 'camera'
  | 'mic'
  | 'calendar'
  | 'crop'
  | 'settingsIcon'
  | 'cameraBlackIcon'
  | 'downArrowBlackIcon'
  | 'tickIcon'
  | 'close_white'
  | 'theme_sun'
  | 'theme_moon';

export const ICONS = {
  signout_icon,
  toastTickIcon,
  toastUnTickIcon,
  google_icon,
  cancelIcon,
  backArrow,
  dummyProfile,
  photos,
  camera,
  mic,
  calendar,
  crop,
  settingsIcon,
  cameraBlackIcon,
  downArrowBlackIcon,
  tickIcon,
  close_white,
  theme_sun,
  theme_moon,
} as Record<IconType, React.FC<any>>;
