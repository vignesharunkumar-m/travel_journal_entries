import React, { memo, useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import StyledText from './StyledText';
import { COLORS } from '../Utility/Colors';
import { useThemeMode } from '../Hooks/useThemeMode';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 48;
const IMAGE_HEIGHT = 228;

type JournalImageCarouselProps = {
  photos: string[];
};

const JournalImageCarousel = ({ photos }: JournalImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { colors } = useThemeMode();

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH,
      );

      if (nextIndex !== activeIndex) {
        setActiveIndex(nextIndex);
      }
    },
    [activeIndex],
  );

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
    ),
    [],
  );

  if (!photos.length) {
    return (
      <View
        style={[
          styles.shell,
          styles.emptyState,
          { backgroundColor: colors.surfaceAlt },
        ]}
      >
        <StyledText style={[styles.emptyText, { color: colors.textSecondary }]}>
          No media attached for this memory yet.
        </StyledText>
      </View>
    );
  }

  return (
    <View style={[styles.shell, { backgroundColor: colors.surfaceAlt }]}>
      <FlatList
        data={photos}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: CAROUSEL_WIDTH,
          offset: CAROUSEL_WIDTH * index,
          index,
        })}
      />
      {photos.length > 1 ? (
        <View style={styles.dotsRow}>
          {photos.map((_, index) => (
            <View
              key={`${index}`}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default memo(JournalImageCarousel);

const styles = StyleSheet.create({
  shell: {
    width: CAROUSEL_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: '#eadfce',
  },
  image: {
    width: CAROUSEL_WIDTH,
    height: IMAGE_HEIGHT,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: COLORS.textMid,
    textAlign: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.white,
  },
});
