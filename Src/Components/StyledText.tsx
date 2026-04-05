import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import { FONTSIZES } from '../Utility/FontSizes';
import { StyledTextProps } from '../@types/Components';

const StyledText = ({
  children,
  textProps,
  style,
  numberOfLines = 0,
}: StyledTextProps) => {
  return (
    <Text
      {...textProps}
      style={[styles.defaultTextStyle, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

export default StyledText;

const styles = StyleSheet.create({
  defaultTextStyle: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textMid,
    fontSize: FONTSIZES.small,
    textAlign: 'left',
    includeFontPadding: false,
  },
});
