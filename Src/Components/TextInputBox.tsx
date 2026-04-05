import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import StyledText from './StyledText';
import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import { FONTSIZES } from '../Utility/FontSizes';
import { TextInputBoxProps } from '../@types/components';
import { useThemeMode } from '../Hooks/useThemeMode';

const TextInputBox: React.FC<TextInputBoxProps> = ({
  title = '',
  value,
  onChangeText,
  textInputProps,
  errorText,
  customContainerStyle,
  isRequired = false,
  placeHolder = '',
  maxLength = 50,
  borderColor = COLORS.border,
  onSubmit,
  multiline,
  isEnableScrollBar = false,
  inputBg = COLORS.white,
  inputContainerStyle,
  inputFieldStyle,
}) => {
  const { colors } = useThemeMode();

  const getValue = () => {
    return typeof value === 'number' ? value.toString() : value;
  };

  return (
    <View style={[styles.container, customContainerStyle]}>
      {/* TITLE */}
      {title ? (
        <View style={styles.titleRow}>
          <StyledText style={[styles.title, { color: colors.textSecondary }]}>
            {title}
          </StyledText>

          {isRequired && <StyledText style={styles.requiredText}>*</StyledText>}
        </View>
      ) : null}

      {/* INPUT BOX */}
      <View
        style={[
          styles.inputContainer,
          inputContainerStyle,
          {
            borderColor: errorText ? COLORS.error : borderColor,
            backgroundColor: inputBg ?? colors.surface,
          },
        ]}
      >
        <TextInput
          value={getValue()}
          onChangeText={onChangeText}
          style={[
            styles.inputField,
            { color: colors.textPrimary },
            inputFieldStyle,
          ]}
          placeholder={placeHolder}
          placeholderTextColor={colors.textMuted}
          maxLength={maxLength}
          multiline={multiline}
          scrollEnabled={isEnableScrollBar}
          textAlignVertical={multiline ? 'top' : 'center'}
          onSubmitEditing={onSubmit}
          {...textInputProps}
        />
      </View>

      {/* ERROR */}
      {errorText ? (
        <StyledText style={styles.errorText}>{errorText.toString()}</StyledText>
      ) : null}
    </View>
  );
};

export default TextInputBox;

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  titleRow: {
    flexDirection: 'row',
  },

  title: {
    fontSize: FONTSIZES.small,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMid,
    textTransform: 'uppercase',
  },

  requiredText: {
    marginLeft: 5,
    color: COLORS.error,
  },

  inputContainer: {
    height: 47,
    width: '100%',
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    justifyContent: 'center',
  },

  inputField: {
    paddingHorizontal: 10,
    fontSize: FONTSIZES.medium,
    fontFamily: FONTS.medium,
    height: '100%',
  },

  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.tiny,
    color: COLORS.error,
  },
});
