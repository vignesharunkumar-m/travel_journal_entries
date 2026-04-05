import { ActivityIndicator, View } from 'react-native';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Loader from './Loader';
import { COLORS } from '../Utility/Colors';
import { useLoader } from '../Utility/StoreData';
import { HOCViewProps } from '../@types/Components';
import CustomHeader from './CustomHeader';
import { useThemeMode } from '../Hooks/useThemeMode';

const HOCView = ({
  children,
  isEnableKeyboardAware = false,
  isEnableScrollView = false,
  keyboardAwareContentContainerStyle = {
    backgroundColor: COLORS.secondary,
    flexGrow: 1,
  },
  scrollViewContentContainerStyle = {
    backgroundColor: COLORS.secondary,
  },
  paddingHorizontal = 10,
  paddingVertical = 0,
  refreshControl,
  isShowHeader = true,
  isListLoading = false,
  headerProps,
  isEnableSafeArea = true,
  keyboardAwareRef: _keyboardAwareRef,
  scrollViewRef,
  renderHeader,
  contentStyle,
  bgColor = COLORS.secondary,
}: HOCViewProps) => {
  const { isLoading, text } = useLoader();
  const { colors } = useThemeMode();
  function MainComponent() {
    return (
      <>
        {isShowHeader && <CustomHeader {...headerProps} />}
        {isLoading && <Loader isVisible={true} text={text} />}
        {renderHeader ? (
          <View
            style={{
              paddingHorizontal: paddingHorizontal,
              marginTop: 5,
            }}
          >
            {renderHeader}
          </View>
        ) : null}
        {isListLoading ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : (
          <>
            {isEnableKeyboardAware ? (
              <KeyboardAwareScrollView
                // ScrollViewComponent={ScrollView}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                bottomOffset={20}
                contentContainerStyle={[
                  keyboardAwareContentContainerStyle,
                  { paddingVertical, paddingHorizontal },
                ]}
              >
                {children}
              </KeyboardAwareScrollView>
            ) : (
              <View
                style={[
                  {
                    flex: 1,
                    paddingHorizontal,
                    paddingVertical,
                  },
                  contentStyle,
                ]}
              >
                {isEnableScrollView ? (
                  <ScrollView
                    bounces={true}
                    ref={scrollViewRef}
                    refreshControl={refreshControl}
                    style={{ flex: 1, backgroundColor: bgColor }}
                    contentContainerStyle={scrollViewContentContainerStyle}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    alwaysBounceVertical={true}
                  >
                    <>{children}</>
                  </ScrollView>
                ) : (
                  <>{children}</>
                )}
              </View>
            )}
          </>
        )}
      </>
    );
  }

  return isEnableSafeArea ? (
    <SafeAreaView
      edges={[]}
      style={{
        flex: 1,
        backgroundColor: bgColor ?? colors.background,
      }}
    >
      {MainComponent()}
    </SafeAreaView>
  ) : (
    <View
      style={{
        flex: 1,
        backgroundColor: bgColor ?? colors.background,
      }}
    >
      {MainComponent()}
    </View>
  );
};

export default HOCView;
