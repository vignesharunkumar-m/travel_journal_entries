import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import SvgIcon from './SvgIcon';
import StyledText from './StyledText';
import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import { FONTSIZES } from '../Utility/FontSizes';
import { ACTIVE_OPACITY } from '../Utility/Constants';
import { CustomButtonProps } from '../@types/components';

const CustomButton = ({
  title,
  onPress,
  buttonProps,
  isDisabled = false,
  customButtonStyle,
  titleStyle,
  opacity = ACTIVE_OPACITY,
  paddingHorizontal = 15,
  rightIcon,
  leftIcon,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      {...buttonProps}
      onPress={onPress}
      activeOpacity={opacity}
      disabled={isDisabled}
      style={[
        styles.buttonContainer,
        customButtonStyle,
        {
          flexDirection: rightIcon || leftIcon ? 'row' : 'column',
          justifyContent: 'center',
          backgroundColor: isDisabled ? COLORS.disableColour : COLORS.primary,
          opacity: isDisabled ? 0.8 : 1,
          paddingHorizontal,
        },
      ]}
    >
      {leftIcon && <SvgIcon icon={leftIcon} size={15} />}
      <StyledText style={[styles.buttonText, titleStyle]}>{title}</StyledText>
      {rightIcon && <SvgIcon icon={rightIcon} />}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 50,
    gap: 5,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: FONTSIZES.medium,
    color: COLORS.white,
  },
});
