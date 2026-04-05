import React from 'react';
import { StyleSheet, Modal, View } from 'react-native';
import ToastContainer from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import Loader from './Loader';
import SvgIcon from './SvgIcon';
import StyledText from './StyledText';
import ToastConfig from './ToastConfig';
import { FONTS } from '../Utility/Fonts';
import { COLORS } from '../Utility/Colors';
import { FONTSIZES } from '../Utility/FontSizes';
import { WINDOW_WIDTH } from '../Utility/Constants';
import { GlobalModalProps } from '../@types/Components';

const GlobalModal = ({
  children,
  isVisible,
  setIsVisible,
  onClose,
  isHeaderEnable = true,
  title = '',
  isEnableCloseIcon = true,
  childContainerStyle,
  titleStyle,
  iconSize = 25,
  isScrollEnabled = true,
  headerContainerStyle,
  isLoading = false,
  transparent = true,
}: GlobalModalProps) => {
  const HeaderComponent = () => (
    <View style={[styles.headerContainer, headerContainerStyle]}>
      {title ? (
        <StyledText style={[styles.title, titleStyle]}>{title}</StyledText>
      ) : (
        <View />
      )}

      {isEnableCloseIcon && (
        <SvgIcon onPress={onClose} isButton icon="cancelIcon" size={iconSize} />
      )}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={transparent}
      animationType="fade"
      onRequestClose={() => setIsVisible?.(false)}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {isLoading && <Loader isVisible />}

        <ToastContainer
          visibilityTime={3000}
          config={ToastConfig}
          topOffset={40}
        />

        <View style={styles.centeredView}>
          <View style={[styles.modalView, childContainerStyle]}>
            {isHeaderEnable && <HeaderComponent />}
            {isScrollEnabled ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={{ width: '100%' }}>{children}</View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GlobalModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxWidth: WINDOW_WIDTH - 40,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONTSIZES.big,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
});
