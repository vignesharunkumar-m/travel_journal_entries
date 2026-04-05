/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './Src/Hooks/useAuth';
import RootStack from './Src/Stack/RootStack';
import MainStack from './Src/Stack/MainStack';
import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';
import CustomStatusBar from './Src/Components/CustomStatusBar';
import { getMessaging } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { requestNotificationPermission } from './Src/Utility/Permissions';

const HIGH_PRIORITY_CHANNEL_ID = 'high_priority';
const styles = {
  container: { flex: 1 },
};

getMessaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('BG MESSAGE RECEIVED:', remoteMessage);
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('BG NOTIFEE EVENT:', type, detail);
});

const Stack = createStackNavigator();

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      hideSplash();
    }
  }, [loading]);

  useEffect(() => {
    if (loading || !user?.uid) {
      return;
    }

    requestNotificationPermission();
  }, [loading, user?.uid]);

  useEffect(() => {
    notifee.createChannel({
      id: HIGH_PRIORITY_CHANNEL_ID,
      name: 'High Priority',
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
      importance: AndroidImportance.HIGH,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? 'New Notification',
        body: remoteMessage.notification?.body ?? '',
        data: remoteMessage.data ?? {},
        android: {
          channelId: HIGH_PRIORITY_CHANNEL_ID,
          sound: 'default',
          vibrationPattern: [300, 500],
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const sub = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const data = detail.notification?.data;
        console.log('CLICK: Foreground', data);
      }
    });

    return () => sub();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        '[BACKGROUND → OPEN] Notification opened app:',
        remoteMessage,
      );
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(response => {
        console.log(
          '[Kill or Url (Deeplink) → OPEN] Notification opened app:',
          response,
        );
      });
  }, []);

  return (
    <SafeAreaProvider>
      <CustomStatusBar />
      {loading ? null : (
        <View style={styles.container}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {user ? (
                <Stack.Screen
                  key="app"
                  name="MainStack"
                  component={MainStack}
                  options={{ animationTypeForReplace: 'push' }}
                />
              ) : (
                <Stack.Screen
                  key="auth"
                  name="RootStack"
                  component={RootStack}
                  options={{ animationTypeForReplace: 'pop' }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      )}
    </SafeAreaProvider>
  );
}

export default App;
