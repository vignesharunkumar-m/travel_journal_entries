import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

import StyledText from './StyledText';
import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import { FONTSIZES } from '../Utility/FontSizes';
import { ACTIVE_OPACITY } from '../Utility/Constants';
import { CustomDateTimePickerProps } from '../@types/components';
import { useThemeMode } from '../Hooks/useThemeMode';

const CustomDateTimePicker = ({
  onSelect,
  mode = 'date',
  props,
  value,
  title,
  errorText,
  format = 'DD-MM-YYYY HH:mm',
  isRequired = false,
  customContainerStyle,
  borderColor = COLORS.border,
  inputContainerStyle,
  placeHolder = 'Select Date & Time',
}: CustomDateTimePickerProps) => {
  const { colors } = useThemeMode();
  const [isShowDatePicker, setIsShowDatePicker] = useState(false);

  const getValue = () => {
    return value ? value : placeHolder;
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

      {/* INPUT */}
      <TouchableOpacity
        activeOpacity={ACTIVE_OPACITY}
        onPress={() => setIsShowDatePicker(true)}
        style={[
          styles.inputContainer,
          inputContainerStyle,
          {
            borderColor: errorText ? COLORS.error : borderColor,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <StyledText
          style={{
            color: value ? colors.textPrimary : colors.textMuted,
            fontSize: FONTSIZES.medium,
            fontFamily: FONTS.medium,
          }}
        >
          {getValue()}
        </StyledText>
      </TouchableOpacity>

      {/* ERROR */}
      {errorText ? (
        <StyledText style={styles.errorTxt}>{errorText}</StyledText>
      ) : null}

      <DateTimePickerModal
        {...props}
        date={value ? moment(value, format).toDate() : new Date()}
        isVisible={isShowDatePicker}
        mode={mode}
        is24Hour={true}
        display="spinner"
        onConfirm={(dateValue: Date) => {
          onSelect?.(dateValue);
          setIsShowDatePicker(false);
        }}
        onCancel={() => setIsShowDatePicker(false)}
      />
    </View>
  );
};

export default CustomDateTimePicker;
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  titleRow: {
    flexDirection: 'row',
  },
  inputContainer: {
    height: 47,
    width: '100%',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 10,
  },
  errorTxt: {
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.tiny,
    color: COLORS.error,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  inputField: {
    borderRadius: 8,
    fontSize: FONTSIZES.tiny,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  requiredText: {
    marginLeft: 5,
    color: COLORS.error,
  },
  title: {
    fontSize: FONTSIZES.small,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMid,
    textTransform: 'uppercase',
  },
});
