import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  MainStackParamsList,
  PostListFilters,
} from '../../@types/NavigationTypes';
import CustomButton from '../../Components/CustomButton';
import CustomDateTimePicker from '../../Components/CustomDateTimePicker';
import HOCView from '../../Components/HOCView';
import StyledText from '../../Components/StyledText';
import TextInputBox from '../../Components/TextInputBox';
import { FONTS } from '../../Utility/Fonts';
import { FONTSIZES } from '../../Utility/FontSizes';
import { useThemeMode } from '../../Hooks/useThemeMode';

const DATE_FILTER_FORMAT = 'DD-MM-YYYY';
const EMPTY_FILTERS: PostListFilters = {
  keyword: '',
  label: '',
  startDate: null,
  endDate: null,
};

export default function FilterScreen() {
  const { colors } = useThemeMode();
  const navigation =
    useNavigation<StackNavigationProp<MainStackParamsList, 'FilterScreen'>>();
  const route = useRoute<any>();
  const initialFilters = useMemo<PostListFilters>(
    () => route.params?.filters ?? EMPTY_FILTERS,
    [route.params?.filters],
  );
  const [filters, setFilters] = useState<PostListFilters>(initialFilters);

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    navigation.navigate('HomeScreen', { filters: EMPTY_FILTERS });
  };

  const handleApply = () => {
    navigation.navigate('HomeScreen', { filters });
  };

  return (
    <HOCView
      isEnableScrollView
      isShowHeader
      scrollViewContentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      headerProps={{
        isShowBorder: true,
        title: 'Filter posts',
        onBackPress: () => navigation.goBack(),
        isShowBackArrow: true,
      }}
      bgColor={colors.background}
    >
      <View
        style={[
          styles.introCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <StyledText style={[styles.introTitle, { color: colors.textPrimary }]}>
          Find the right memory faster
        </StyledText>
        <StyledText style={[styles.introText, { color: colors.textSecondary }]}>
          Narrow the journal by keywords, AI-generated tags, or a date range,
          then apply everything at once.
        </StyledText>
      </View>

      <TextInputBox
        title="Keywords"
        value={filters.keyword}
        onChangeText={text =>
          setFilters(previous => ({ ...previous, keyword: text }))
        }
        placeHolder="Search title or description"
      />

      <TextInputBox
        title="Tags"
        value={filters.label}
        onChangeText={text =>
          setFilters(previous => ({ ...previous, label: text }))
        }
        placeHolder="Search AI-generated tags"
      />

      <CustomDateTimePicker
        title="From date"
        mode="date"
        placeHolder={'Select Date'}
        format={DATE_FILTER_FORMAT}
        value={
          filters.startDate
            ? moment(filters.startDate).format(DATE_FILTER_FORMAT)
            : null
        }
        onSelect={date =>
          setFilters(previous => ({
            ...previous,
            startDate: moment(date).startOf('day').valueOf(),
          }))
        }
      />

      <CustomDateTimePicker
        title="To date"
        mode="date"
        placeHolder={'Select Date'}
        format={DATE_FILTER_FORMAT}
        value={
          filters.endDate
            ? moment(filters.endDate).format(DATE_FILTER_FORMAT)
            : null
        }
        onSelect={date =>
          setFilters(previous => ({
            ...previous,
            endDate: moment(date).startOf('day').valueOf(),
          }))
        }
      />

      <View style={styles.actions}>
        <CustomButton
          title="Reset"
          onPress={handleReset}
          customButtonStyle={[
            styles.primaryButton,
            { backgroundColor: colors.surfaceAlt },
          ]}
        />
        <CustomButton
          title="Search"
          onPress={handleApply}
          customButtonStyle={[
            styles.primaryButton,
            { backgroundColor: colors.accent },
          ]}
        />
      </View>
    </HOCView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 32,
    gap: 8,
  },
  introCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 6,
    marginTop: 10,
  },
  introTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTSIZES.big,
    marginBottom: 6,
  },
  introText: {
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
  },
});
