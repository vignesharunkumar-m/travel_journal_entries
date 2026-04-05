import moment from 'moment';
import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { JournalEntry, getCombinedImageTags } from '../features/journal/types';
import { COLORS } from '../Utility/Colors';
import { FONTS } from '../Utility/Fonts';
import { FONTSIZES } from '../Utility/FontSizes';
import { useThemeMode } from '../Hooks/useThemeMode';
import CustomButton from './CustomButton';
import StyledText from './StyledText';
import JournalImageCarousel from './JournalImageCarousel';

type JournalEntryCardProps = {
  item: JournalEntry;
  onView: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  showLabels?: boolean;
};

const formatEntryDate = (timestamp: number) =>
  moment(timestamp).format('DD-MM-YYYY HH:mm');

const SyncBadge = memo(
  ({ syncStatus }: { syncStatus: JournalEntry['syncStatus'] }) => (
    <View
      style={[
        styles.syncBadge,
        syncStatus === 'synced' ? styles.syncedBadge : styles.pendingBadge,
      ]}
    >
      <StyledText
        style={[
          styles.syncBadgeText,
          syncStatus === 'synced' ? styles.syncedText : styles.pendingText,
        ]}
      >
        {syncStatus === 'synced' ? 'Synced' : 'Pending sync'}
      </StyledText>
    </View>
  ),
);

function JournalEntryCard({
  item,
  onView,
  onEdit,
  onDelete,
  showLabels = true,
}: JournalEntryCardProps) {
  const { colors, isDark } = useThemeMode();
  const combinedTags = getCombinedImageTags(item.imageTags);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <JournalImageCarousel photos={item?.photos} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleBlock}>
            <StyledText
              style={[styles.cardTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {item.title}
            </StyledText>
          </View>
          <SyncBadge syncStatus={item.syncStatus} />
        </View>

        <StyledText
          style={[styles.cardDescription, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.description}
        </StyledText>

        {showLabels && item.syncStatus === 'synced' && combinedTags.length ? (
          <View style={styles.labelRow}>
            {combinedTags.map(label => (
              <View
                key={`${item.id}-${label}`}
                style={[styles.labelChip, { backgroundColor: colors.chip }]}
              >
                <StyledText
                  style={[styles.labelText, { color: colors.chipText }]}
                >
                  {label}
                </StyledText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <StyledText style={[styles.metaText, { color: colors.textMuted }]}>
            {item.place
              ? item.place
              : item.location
              ? 'Location name updating...'
              : 'Location not available'}
          </StyledText>
          <StyledText style={[styles.metaText, { color: colors.textMuted }]}>
            Created {formatEntryDate(item.createdAt)}
          </StyledText>
        </View>

        <View style={styles.actionRow}>
          <CustomButton
            title="View"
            onPress={() => onView(item)}
            customButtonStyle={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? colors.accentMuted
                  : colors.surfaceAlt,
              },
            ]}
          />
          <CustomButton
            title="Delete"
            onPress={() => onDelete(item)}
            customButtonStyle={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? colors.accentMuted
                  : colors.surfaceAlt,
              },
            ]}
          />
          <CustomButton
            title="Edit"
            onPress={() => onEdit(item)}
            customButtonStyle={[
              styles.actionButton,
              { backgroundColor: colors.accent },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default memo(JournalEntryCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTSIZES.big,
    marginBottom: 4,
  },
  syncBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  syncedBadge: {
    backgroundColor: '#e8f7ef',
  },
  pendingBadge: {
    backgroundColor: '#fff1df',
  },
  syncBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONTSIZES.extraSmall,
  },
  syncedText: {
    color: '#1b8f52',
  },
  pendingText: {
    color: '#c87514',
  },
  cardDescription: {
    fontFamily: FONTS.medium,
    lineHeight: 21,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  labelText: {
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.extraSmall,
  },
  metaRow: {
    gap: 6,
  },
  metaText: {
    fontFamily: FONTS.medium,
    fontSize: FONTSIZES.extraSmall,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    minWidth: 90,
  },
});
