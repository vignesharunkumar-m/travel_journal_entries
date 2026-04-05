import ToastMessage from 'react-native-toast-message';

const toastMessage = (
  message?: string | any,
  toastType?: 'success' | 'fail',
  visibilityTime?: number,
) => {
  ToastMessage.show({
    type: 'tomatoToast',
    text1: message,
    visibilityTime: visibilityTime ?? 3000,
    props: { toastType },
  });
};

const ToastHelper = {
  success: (message = '', visibilityTime = 3000) =>
    toastMessage(message, 'success', visibilityTime),
  fail: (message = '', visibilityTime = 3000) =>
    toastMessage(message, 'fail', visibilityTime),
};

export default ToastHelper;
