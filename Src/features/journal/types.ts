export type SyncStatus = 'synced' | 'pending';

export type JournalLocation = {
  lat: number;
  lng: number;
} | null;

export type ImageTagsMap = Record<string, string[]>;

export type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  description: string;
  photos: string[];
  imageTags: ImageTagsMap;
  location: JournalLocation;
  place: string | null;
  timestamp: number;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
};

export type CreateJournalEntryInput = {
  title: string;
  description: string;
  photos: string[];
  imageTags?: ImageTagsMap;
  location: JournalLocation;
  place: string | null;
  timestamp: number;
};

export type UpdateJournalEntryInput = CreateJournalEntryInput & {
  id: string;
};

export type JournalState = {
  entries: JournalEntry[];
  isHydrating: boolean;
  isSyncing: boolean;
  initialized: boolean;
  error: string | null;
};

export type JournalOutboxItem = {
  id: string;
  userId: string;
  recordId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: string | null;
  createdAt: number;
};

export function normalizeImageTags(
  photos: string[],
  imageTags?: ImageTagsMap | null,
  legacyLabels: string[] = [],
) {
  const nextTags: ImageTagsMap = {};

  for (const photo of photos) {
    const tags = imageTags?.[photo]?.filter(Boolean) ?? [];
    if (tags.length) {
      nextTags[photo] = Array.from(new Set(tags)).slice(0, 2);
    }
  }

  if (!Object.keys(nextTags).length && photos[0] && legacyLabels.length) {
    nextTags[photos[0]] = Array.from(new Set(legacyLabels)).slice(0, 2);
  }

  return nextTags;
}

export function getCombinedImageTags(imageTags: ImageTagsMap) {
  return Array.from(
    new Set(Object.values(imageTags).flat().filter(Boolean)),
  );
}

export function hasMissingImageTags(photos: string[], imageTags: ImageTagsMap) {
  return photos.some(photo => !imageTags[photo]?.length);
}
