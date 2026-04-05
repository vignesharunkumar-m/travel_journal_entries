import React from 'react';
import { StyleSheet, View } from 'react-native';

import StyledText from './StyledText';
import { FONTS } from '../Utility/Fonts';
import CustomButton from './CustomButton';
import { FONTSIZES } from '../Utility/FontSizes';
import { ConfirmationModalProps } from '../@types/Components';

const ConfirmationModal = ({
  title = '',
  msg = '',
  negativeButtonText = 'Cancel',
  onPressNegativeButton,
  onPressPostiveButton,
  postiveButtonText = 'Yes',
  positiveButtonStyle,
  positiveButtonTitleStyle,
  negativeButtonStyle,
  negativeButtonTitleStyle,
}: ConfirmationModalProps) => {
  return (
    <>
      {title ? <StyledText style={styles.title}>{title}</StyledText> : null}
      <StyledText style={styles.msg}>{msg}</StyledText>
      <View style={styles.buttonContainer}>
        {onPressNegativeButton && (
          <CustomButton
            customButtonStyle={[styles.button, negativeButtonStyle]}
            titleStyle={negativeButtonTitleStyle}
            title={negativeButtonText}
            onPress={onPressNegativeButton}
          />
        )}
        {onPressPostiveButton && (
          <CustomButton
            customButtonStyle={[styles.button, positiveButtonStyle]}
            titleStyle={positiveButtonTitleStyle}
            title={postiveButtonText}
            onPress={onPressPostiveButton}
          />
        )}
      </View>
    </>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
    fontFamily: FONTS.semiBold,
    fontSize: FONTSIZES.big,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  msg: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.small,
  },
  button: {
    width: 100,
  },
});
