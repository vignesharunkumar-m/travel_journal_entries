/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';
import ToastContainer from 'react-native-toast-message';
import ToastConfig from './Src/Components/ToastConfig';
import store from './Src/Store/StoreConfig';
import { AuthProvider } from './Src/Hooks/useAuth';
import { ThemeModeProvider } from './Src/Hooks/useThemeMode';

const styles = {
  root: { flex: 1 },
};

const Main = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <Provider store={store}>
          <ThemeModeProvider>
            <AuthProvider>
              <App />
              <ToastContainer
                visibilityTime={3000}
                config={ToastConfig}
                topOffset={40}
                bottomOffset={60}
              />
            </AuthProvider>
          </ThemeModeProvider>
        </Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};
AppRegistry.registerComponent(appName, () => Main);
