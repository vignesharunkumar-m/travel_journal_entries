import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MainStackParamsList } from '../../@types/NavigationTypes';
import CustomButton from '../../Components/CustomButton';
import HOCView from '../../Components/HOCView';
import StyledText from '../../Components/StyledText';
import { useThemeMode } from '../../Hooks/useThemeMode';
import { JournalEntry } from '../../features/journal/types';
import { FONTS } from '../../Utility/Fonts';
import { FONTSIZES } from '../../Utility/FontSizes';

export default function PostDetailsScreen() {
  const { colors } = useThemeMode();
  const navigation =
    useNavigation<
      StackNavigationProp<MainStackParamsList, 'PostDetailsScreen'>
    >();
  const route = useRoute<any>();
  const entry = route.params?.entry as JournalEntry;

  const formatEntryDate = (timestamp: number) =>
    moment(timestamp).format('DD-MM-YYYY HH:mm');
  return (
    <HOCView
      isEnableScrollView
      isShowHeader
      bgColor={colors.background}
      scrollViewContentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      headerProps={{
        isShowBorder: true,
        title: 'Post details',
        onBackPress: () => navigation.goBack(),
        isShowBackArrow: true,
      }}
    >
      <View
        style={[
          styles.titleCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <StyledText style={[styles.title, { color: colors.textPrimary }]}>
          {entry.title}
        </StyledText>
      </View>

      <View style={styles.imagesSection}>
        {entry.photos.map((photo, index) => (
          <View
            key={`${entry.id}-${photo}-${index}`}
            style={[
              styles.imageCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Image
              source={{ uri: photo }}
              style={styles.image}
              resizeMode="cover"
            />
            {entry.imageTags[photo]?.length ? (
              <View style={styles.imageTagRow}>
                {entry.imageTags[photo].map(tag => (
                  <View
                    key={`${entry.id}-${photo}-${tag}`}
                    style={[
                      styles.imageTagChip,
                      { backgroundColor: colors.chip },
                    ]}
                  >
                    <StyledText
                      style={[styles.imageTagText, { color: colors.chipText }]}
                    >
                      {tag}
                    </StyledText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <StyledText
          style={[styles.sectionTitle, { color: colors.textPrimary }]}
        >
          Date & time
        </StyledText>
        <StyledText style={[styles.metaText, { color: colors.textSecondary }]}>
          {formatEntryDate(entry.createdAt)}
        </StyledText>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <StyledText
          style={[styles.sectionTitle, { color: colors.textPrimary }]}
        >
          Description
        </StyledText>
        <StyledText
          style={[styles.descriptionText, { color: colors.textSecondary }]}
        >
          {entry.description}
        </StyledText>
      </View>

      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <StyledText
          style={[styles.sectionTitle, { color: colors.textPrimary }]}
        >
          Place
        </StyledText>
        <StyledText style={[styles.metaText, { color: colors.textSecondary }]}>
          {entry.place ?? 'Location not available'}
        </StyledText>
      </View>

      <CustomButton
        title="Back"
        onPress={() => navigation.goBack()}
        customButtonStyle={[
          styles.backButton,
          { backgroundColor: colors.accent },
        ]}
      />
    </HOCView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 36,
    gap: 14,
  },
  titleCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONTSIZES.extraLarge,
  },
  imagesSection: {
    gap: 12,
  },
  imageCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  image: {
    width: '100%',
    height: 240,
  },
  imageTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  imageTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  imageTagText: {
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.extraSmall,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONTSIZES.big,
  },
  descriptionText: {
    fontFamily: FONTS.medium,
    lineHeight: 22,
  },
  metaText: {
    fontFamily: FONTS.medium,
    lineHeight: 21,
  },
  backButton: {
    marginTop: 8,
  },
});
