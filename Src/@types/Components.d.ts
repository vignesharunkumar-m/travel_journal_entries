import {
  ScrollView,
  StyleProp,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { IconType } from '../Utility/Icons';
import { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';
import { ReactNode } from 'react';
import { FormikErrors } from 'formik';
import { ReactNativeModalDateTimePickerProps } from 'react-native-modal-datetime-picker';

export type Loaderprops = {
  text?: string;
  isVisible?: boolean;
};

export type StyledTextProps = {
  children: JSX.Element | JSX.Element[] | ReactNode | any;
  style?: StyleProp<TextStyle>;
  textProps?: TextProps;
  numberOfLines?: number;
};

export type SVGIconProps = {
  size?: number;
  icon: IconType;
  isButton?: boolean;
  onPress?: () => void;
  fill?: string;
  iconStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export type CustomToastProps = {
  text?: string;
  toastType: 'success' | 'fail';
};

export type TomatoToastprops = {
  text1?: string;
  props?: any;
};

export type CustomButtonProps = {
  title: string;
  onPress: () => void;
  buttonProps?: TouchableOpacityProps;
  isDisabled?: boolean;
  customButtonStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  opacity?: number;
  paddingHorizontal?: number;
  rightIconColor?: string;
  rightIcon?: IconType;
  titleColor?: string;
  leftIcon?: IconType;
};

export interface CustomHeaderProps {
  isShowBackArrow?: boolean;
  onBackPress?: () => void;
  title?: string;
  onPressNotification?: () => void;
  isShowBorder?: boolean;
  onPressProfile?: () => void;
  onPressSearch?: () => void;
}

export interface HOCViewProps extends CustomHeaderProps {
  children: JSX.Element | JSX.Element[] | ReactNode;
  isEnableKeyboardAware?: boolean;
  isEnableScrollView?: boolean;
  keyboardAwareContentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewContentContainerStyle?: StyleProp<ViewStyle>;
  paddingHorizontal?: number;
  paddingVertical?: number;
  refreshControl?: ScrollViewProps | undefined | any;
  isShowHeader?: boolean;
  isListLoading?: boolean;
  headerProps?: CustomHeaderProps;
  isEnableSafeArea?: boolean;
  keyboardAwareRef?: React.LegacyRef<KeyboardAwareScrollViewProps>;
  scrollViewRef?: React.LegacyRef<ScrollView> | undefined;
  renderHeader?: JSX.Element | JSX.Element[] | ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  bgColor?: string;
}

export type GlobalModalProps = {
  children: JSX.Element | JSX.Element[] | ReactNode;
  isVisible: boolean;
  setIsVisible?: (val: boolean) => void;
  childContainerStyle?: StyleProp<ViewStyle>;
  onClose?: () => void;
  isHeaderEnable?: boolean;
  title?: string;
  isEnableCloseIcon?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  isScrollEnabled?: boolean;
  headerContainerStyle?: StyleProp<ViewStyle>;
  isLoading?: boolean;
  transparent?: boolean;
};

export type ConfirmationModalProps = {
  title?: string;
  msg?: string;
  onPressPostiveButton?: () => void;
  onPressNegativeButton?: () => void;
  postiveButtonText?: string;
  negativeButtonText?: string;
  positiveButtonStyle?: StyleProp<ViewStyle>;
  positiveButtonTitleStyle?: StyleProp<TextStyle>;
  negativeButtonStyle?: StyleProp<ViewStyle>;
  negativeButtonTitleStyle?: StyleProp<TextStyle>;
};

export interface TextInputBoxProps {
  title?: string;
  value?: string | number;
  onChangeText?: (text: string) => void;
  textInputProps?: TextInputProps;
  errorText?:
    | string
    | string[]
    | FormikErrors<any>
    | FormikErrors<any>[]
    | undefined;
  customContainerStyle?: StyleProp<ViewStyle>;
  placeHolder?: string;
  isRequired?: boolean;
  maxLength?: number;
  borderColor?: string;
  onSubmit?: () => void;
  multiline?: boolean;
  isEnableScrollBar?: boolean;
  inputBg?: string;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputFieldStyle?: StyleProp<ViewStyle>;
}

export type CustomDateTimePickerProps = {
  props?: ReactNativeModalDateTimePickerProps;
  mode?: 'date' | 'time' | 'datetime' | undefined;
  onSelect?: (val: Date) => void;
  value: string | null;
  title?: string;
  errorText?:
    | string
    | string[]
    | FormikErrors<any>
    | FormikErrors<any>[]
    | undefined
    | any;
  icon?: IconType;
  format?: string;
  isRequired?: boolean;
  customContainerStyle?: StyleProp<ViewStyle>;
  customInputFieldStyle?: StyleProp<ViewStyle>;
  customIconContainerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  borderColor?: string;
  inputContainerStyle?: StyleProp<TextStyle>;
  onPressCloseIcon?: () => void;
  placeHolder?: string;
};
