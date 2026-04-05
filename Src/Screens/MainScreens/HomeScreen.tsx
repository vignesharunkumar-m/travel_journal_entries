import NetInfo from '@react-native-community/netinfo';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MainStackParamsList,
  PostListFilters,
} from '../../@types/NavigationTypes';
import ConfirmationModal from '../../Components/ConfirmationModal';
import GlobalModal from '../../Components/GlobalModal';
import JournalEntryCard from '../../Components/JournalEntryCard';
import StyledText from '../../Components/StyledText';
import SvgIcon from '../../Components/SvgIcon';
import ToastHelper from '../../Components/ToastHelper';
import { useAuth } from '../../Hooks/useAuth';
import { useThemeMode } from '../../Hooks/useThemeMode';
import { useAppDispatch, useAppSelector } from '../../Store/StoreConfig';
import {
  clearJournalState,
  deleteJournalEntry,
  hydrateJournalEntries,
  initializeJournal,
  syncJournalEntries,
} from '../../Store/Slices/journalSlice';
import {
  JournalEntry,
  getCombinedImageTags,
} from '../../features/journal/types';
import { COLORS } from '../../Utility/Colors';
import { FONTS } from '../../Utility/Fonts';
import { FONTSIZES } from '../../Utility/FontSizes';

const EMPTY_FILTERS: PostListFilters = {
  keyword: '',
  label: '',
  startDate: null,
  endDate: null,
};

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useThemeMode();
  const navigation =
    useNavigation<StackNavigationProp<MainStackParamsList, 'HomeScreen'>>();
  const route = useRoute<RouteProp<MainStackParamsList, 'HomeScreen'>>();
  const { user, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const { entries, initialized, isHydrating, error } = useAppSelector(
    state => state.journal,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [appliedFilters, setAppliedFilters] =
    useState<PostListFilters>(EMPTY_FILTERS);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const hasBootstrappedRef = useRef(false);

  const bootstrapJournal = useCallback(async () => {
    if (!user?.uid) {
      dispatch(clearJournalState());
      return;
    }

    try {
      if (!initialized) {
        await dispatch(initializeJournal()).unwrap();
      }

      await dispatch(hydrateJournalEntries(user.uid)).unwrap();
      dispatch(syncJournalEntries(user.uid));
    } catch {
      // Slice state already tracks the surfaced error.
    }
  }, [dispatch, initialized, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      hasBootstrappedRef.current = false;
      dispatch(clearJournalState());
      return;
    }

    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;
    bootstrapJournal();
  }, [bootstrapJournal, dispatch, user?.uid]);

  useEffect(() => {
    if (route.params?.filters) {
      setAppliedFilters(route.params.filters);
    }
  }, [route.params?.filters]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) {
        return;
      }

      dispatch(hydrateJournalEntries(user.uid));
    }, [dispatch, user?.uid]),
  );

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    NetInfo.fetch().then(state => {
      setIsOnline(
        Boolean(state.isConnected && state.isInternetReachable !== false),
      );
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      const nextIsOnline = Boolean(
        state.isConnected && state.isInternetReachable !== false,
      );
      setIsOnline(nextIsOnline);

      if (nextIsOnline) {
        dispatch(syncJournalEntries(user.uid));
      }
    });

    return unsubscribe;
  }, [dispatch, user?.uid]);

  const handleRefresh = useCallback(async () => {
    if (!user?.uid || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await dispatch(hydrateJournalEntries(user.uid)).unwrap();

      if (isOnline) {
        await dispatch(syncJournalEntries(user.uid)).unwrap();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, isOnline, isRefreshing, user?.uid]);

  const openDeleteModal = useCallback((entry: JournalEntry) => {
    setEntryToDelete(entry);
    setIsDeleteModalVisible(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setEntryToDelete(null);
    setIsDeleteModalVisible(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!user?.uid || !entryToDelete) {
      return;
    }

    try {
      await dispatch(
        deleteJournalEntry({ userId: user.uid, entryId: entryToDelete.id }),
      ).unwrap();
      dispatch(syncJournalEntries(user.uid));
      ToastHelper.success('Entry deleted');
    } catch {
      ToastHelper.fail('Unable to remove this entry right now.');
    } finally {
      closeDeleteModal();
    }
  }, [closeDeleteModal, dispatch, entryToDelete, user?.uid]);

  const handleEdit = useCallback(
    (entry: JournalEntry) => navigation.navigate('PostScreen', { entry }),
    [navigation],
  );

  const handleView = useCallback(
    (entry: JournalEntry) =>
      navigation.navigate('PostDetailsScreen', { entry }),
    [navigation],
  );

  const handleCreate = useCallback(
    () => navigation.navigate('PostScreen'),
    [navigation],
  );

  const handleOpenFilters = useCallback(() => {
    navigation.navigate('FilterScreen', { filters: appliedFilters });
  }, [appliedFilters, navigation]);

  const handleResetFilters = useCallback(() => {
    setAppliedFilters(EMPTY_FILTERS);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch {
      ToastHelper.fail('Sign out failed. Please try again in a moment.');
    }
  }, [signOut]);

  const openLogoutModal = useCallback(() => {
    setIsLogoutModalVisible(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalVisible(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    try {
      await handleSignOut();
    } finally {
      closeLogoutModal();
    }
  }, [closeLogoutModal, handleSignOut]);

  const filteredEntries = useMemo(
    () =>
      entries.filter(entry => {
        const keyword = appliedFilters.keyword.trim().toLowerCase();
        const label = appliedFilters.label.trim().toLowerCase();

        if (keyword) {
          const inTitle = entry.title.toLowerCase().includes(keyword);
          const inDescription = entry.description
            .toLowerCase()
            .includes(keyword);

          if (!inTitle && !inDescription) {
            return false;
          }
        }

        if (label) {
          const hasLabel = getCombinedImageTags(entry.imageTags).some(item =>
            item.toLowerCase().includes(label),
          );

          if (!hasLabel) {
            return false;
          }
        }

        if (
          appliedFilters.startDate &&
          entry.timestamp < appliedFilters.startDate
        ) {
          return false;
        }

        if (
          appliedFilters.endDate &&
          entry.timestamp >
            moment(appliedFilters.endDate).endOf('day').valueOf()
        ) {
          return false;
        }

        return true;
      }),
    [appliedFilters, entries],
  );

  const hasActiveFilters = Boolean(
    appliedFilters.keyword ||
      appliedFilters.label ||
      appliedFilters.startDate ||
      appliedFilters.endDate,
  );
  const errorCardStyles = useMemo(
    () => ({
      backgroundColor: isDark ? '#2f1f1d' : '#fff2ef',
      borderColor: isDark ? '#7c4038' : '#f2b8aa',
    }),
    [isDark],
  );
  const errorTextStyles = useMemo(
    () => ({
      color: isDark ? '#ffd0c6' : COLORS.error,
    }),
    [isDark],
  );

  const renderItem = useCallback(
    ({ item }: { item: JournalEntry }) => (
      <JournalEntryCard
        item={item}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
        showLabels={isOnline}
      />
    ),
    [handleEdit, handleView, isOnline, openDeleteModal],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <StyledText style={[styles.headerEyebrow, { color: colors.accent }]}>
            Travel journal
          </StyledText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.iconChip,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
          >
            <SvgIcon
              icon={isDark ? 'theme_sun' : 'theme_moon'}
              size={18}
              fill={colors.accent}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
            onPress={handleOpenFilters}
          >
            <StyledText
              style={[styles.filterChipText, { color: colors.accent }]}
            >
              {hasActiveFilters ? 'Filters on' : 'Filter'}
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.signOutChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={openLogoutModal}
          >
            <StyledText
              style={[styles.signOutText, { color: colors.textPrimary }]}
            >
              Logout
            </StyledText>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={[styles.errorCard, errorCardStyles]}>
          <StyledText style={[styles.errorText, errorTextStyles]}>
            {error}
          </StyledText>
        </View>
      ) : null}

      <FlatList
        data={filteredEntries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          !filteredEntries.length && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          isHydrating ? (
            <View style={styles.emptyState}>
              <StyledText
                style={[styles.emptyTitle, { color: colors.textPrimary }]}
              >
                Loading your journal...
              </StyledText>
              <StyledText
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                We are restoring your local entries first.
              </StyledText>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <StyledText
                style={[styles.emptyTitle, { color: colors.textPrimary }]}
              >
                {entries.length
                  ? 'No posts match these filters'
                  : 'Start your next story'}
              </StyledText>
              <StyledText
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {entries.length
                  ? 'Try a broader keyword, another tag, or a wider date range.'
                  : 'Save a place, a photo, and a moment. Your newest memories will stay pinned at the top.'}
              </StyledText>
              <TouchableOpacity
                style={[
                  styles.inlineAction,
                  { backgroundColor: colors.accent },
                ]}
                onPress={entries.length ? handleResetFilters : handleCreate}
              >
                <StyledText style={styles.inlineActionText}>
                  {entries.length ? 'Reset filters' : 'Create first entry'}
                </StyledText>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={handleCreate}
        activeOpacity={0.9}
      >
        <StyledText style={styles.fabLabel}>+</StyledText>
      </TouchableOpacity>

      <GlobalModal
        isVisible={isDeleteModalVisible}
        setIsVisible={setIsDeleteModalVisible}
        onClose={closeDeleteModal}
        isScrollEnabled={false}
        title=""
        childContainerStyle={[
          styles.deleteModal,
          { backgroundColor: colors.surface },
        ]}
      >
        <ConfirmationModal
          title="Delete entry"
          msg="This will remove the journal entry locally and sync the deletion to Firebase."
          negativeButtonText="Cancel"
          postiveButtonText="Delete"
          onPressNegativeButton={closeDeleteModal}
          onPressPostiveButton={confirmDelete}
          positiveButtonStyle={[{ backgroundColor: colors.destructive }]}
          negativeButtonStyle={[{ backgroundColor: colors.surfaceAlt }]}
        />
      </GlobalModal>

      <GlobalModal
        isVisible={isLogoutModalVisible}
        setIsVisible={setIsLogoutModalVisible}
        onClose={closeLogoutModal}
        isScrollEnabled={false}
        title=""
        childContainerStyle={[
          styles.deleteModal,
          { backgroundColor: colors.surface },
        ]}
      >
        <ConfirmationModal
          title="Logout"
          msg="Are you sure you want to sign out from your travel journal?"
          negativeButtonText="Cancel"
          postiveButtonText="Logout"
          onPressNegativeButton={closeLogoutModal}
          onPressPostiveButton={confirmLogout}
          positiveButtonStyle={[{ backgroundColor: colors.destructive }]}
          negativeButtonStyle={[{ backgroundColor: colors.surfaceAlt }]}
        />
      </GlobalModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTextBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    height: 42,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  headerEyebrow: {
    fontSize: FONTSIZES.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: FONTS.semiBold,
  },
  signOutChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: FONTS.semiBold,
  },
  errorCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: FONTS.medium,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTSIZES.large,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
    lineHeight: 21,
  },
  inlineAction: {
    marginTop: 12,
    minWidth: 190,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  inlineActionText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  deleteModal: {
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabLabel: {
    color: COLORS.white,
    fontSize: 28,
    lineHeight: 30,
    fontFamily: FONTS.medium,
  },
});
