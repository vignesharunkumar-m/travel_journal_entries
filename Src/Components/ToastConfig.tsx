import { StyleSheet, View } from 'react-native';

import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import SvgIcon from '../Components/SvgIcon';
import { FONTSIZES } from '../Utility/FontSizes';
import StyledText from '../Components/StyledText';
import { CustomToastProps, TomatoToastprops } from '../@types/Components';

const CustomToast = ({ text = '', toastType }: CustomToastProps) => {
  return (
    <View style={styles.container}>
      {(toastType === 'success' || toastType === 'fail') && (
        <SvgIcon
          icon={toastType === 'success' ? 'toastTickIcon' : 'toastUnTickIcon'}
          fill={COLORS.white}
        />
      )}
      <StyledText
        style={{
          fontFamily: FONTS.medium,
          fontSize: FONTSIZES.moderate,
          color: COLORS.white,
        }}
      >
        {text}
      </StyledText>
    </View>
  );
};

const ToastConfig = {
  tomatoToast: ({ text1, props }: TomatoToastprops) => (
    <CustomToast text={text1} toastType={props.toastType} />
  ),
};

export default ToastConfig;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 12,
    gap: 5,
  },
});
