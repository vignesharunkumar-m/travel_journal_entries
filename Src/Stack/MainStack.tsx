import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamsList } from '../@types/NavigationTypes';
import HomeScreen from '../Screens/MainScreens/HomeScreen';
import FilterScreen from '../Screens/MainScreens/FilterScreen';
import PostScreen from '../Screens/MainScreens/PostScreen';
import PostDetailsScreen from '../Screens/MainScreens/PostDetailsScreen';

const Stack = createStackNavigator<MainStackParamsList>();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="HomeScreen"
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PostScreen" component={PostScreen} />
      <Stack.Screen name="PostDetailsScreen" component={PostDetailsScreen} />
      <Stack.Screen name="FilterScreen" component={FilterScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
