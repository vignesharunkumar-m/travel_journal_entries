import { Text, View, StyleSheet } from 'react-native';
import React from 'react';
import SvgIcon from './SvgIcon';
import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import { CustomHeaderProps } from '../@types/components';
import { IS_IOS } from '../Utility/Constants';
import { useThemeMode } from '../Hooks/useThemeMode';

const CustomHeader = ({
  title,
  isShowBackArrow = false,
  onBackPress,
  isShowBorder = false,
}: CustomHeaderProps) => {
  const { colors } = useThemeMode();

  return (
    <View
      style={[
        styles.backHeaderConatiner,
        { backgroundColor: colors.background },
        isShowBorder ? styles.headerBorder : null,
        isShowBorder ? { borderBottomColor: colors.border } : null,
      ]}
    >
      <View style={styles.titleRow}>
        {isShowBackArrow && (
          <SvgIcon
            icon="backArrow"
            size={20}
            isButton
            onPress={onBackPress}
            style={styles.backIcon}
          />
        )}
        <Text style={[styles.titleStyle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  titleStyle: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
  },
  headerBorder: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-start',
  },
  backIcon: {
    marginTop: !IS_IOS ? 3 : 0,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHeaderConatiner: {
    height: 50,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
