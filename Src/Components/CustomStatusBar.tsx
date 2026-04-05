import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../Utility/Colors';
import { StoreInsetsData } from '../Store/Slices/UtilitySlice';
import { useThemeMode } from '../Hooks/useThemeMode';

const CustomStatusBar = ({ backgroundColor = COLORS.secondary }) => {
  const dispatch = useDispatch();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const { colors, isDark } = useThemeMode();

  useEffect(() => {
    dispatch(
      StoreInsetsData({
        top,
        bottom: bottom || 20,
        left,
        right,
      }),
    );
  }, [bottom, dispatch, left, right, top]);
  return (
    <View
      style={{
        height: top,
        backgroundColor: colors.background ?? backgroundColor,
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
    </View>
  );
};

export default CustomStatusBar;
