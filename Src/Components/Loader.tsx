import { Animated, Easing, Modal, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef } from 'react';

import { Loaderprops } from '../@types/components';
import StyledText from './StyledText';
import { COLORS } from '../Utility/Colors';

const Loader = ({ isVisible = false, text = 'Loading.....' }: Loaderprops) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 360) / 8;
    return (
      <View
        key={i}
        style={[
          styles.ray,
          {
            transform: [{ rotate: `${angle}deg` }, { translateY: -25 }],
          },
        ]}
      />
    );
  });

  return isVisible ? (
    <Modal visible={isVisible} transparent>
      <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
        <View style={styles.subContainer}>
          <View style={styles.iconCenter}>
            {/* <SvgIcon icon="StethoscopeIcon" /> */}
          </View>
          <Animated.View
            style={[styles.loader, { transform: [{ rotate: spin }] }]}
          >
            {rays}
          </Animated.View>
          <StyledText style={[styles.text]}>{text}</StyledText>
        </View>
      </View>
    </Modal>
  ) : null;
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 10000000,
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  loader: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 16,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  text: {
    marginTop: 14,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  iconCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -27 }],
    zIndex: 1,
  },
});
