import NetInfo from '@react-native-community/netinfo';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getApp } from '@react-native-firebase/app';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from '@react-native-firebase/firestore';
import {
  CreateJournalEntryInput,
  JournalEntry,
  JournalState,
  UpdateJournalEntryInput,
  hasMissingImageTags,
  normalizeImageTags,
} from '../../features/journal/types';
import {
  clearSyncedJournalMutations,
  fetchAllJournalEntries,
  getPendingJournalMutations,
  initializeJournalDatabase,
  markJournalMutationSynced,
  queueJournalMutation,
  replaceLocalJournalCache,
  updateJournalSyncStatus,
  upsertJournalEntry,
  deleteJournalEntryFromLocal,
} from '../../features/journal/database';
import { reverseGeocodeLocation } from '../../services/geocodingService';
import { detectImageLabels } from '../../services/imageLabelService';
import { uuid } from '../../Utility/uuid';

const initialState: JournalState = {
  entries: [],
  isHydrating: false,
  isSyncing: false,
  initialized: false,
  error: null,
};

function getFirestoreDb() {
  return getFirestore(getApp());
}

function getPostsCollection() {
  return collection(getFirestoreDb(), 'posts');
}

function getEntryDocument(userId: string, entryId: string) {
  return doc(getPostsCollection(), entryId);
}

function getUserPostsQuery(userId: string) {
  return query(getPostsCollection(), where('userId', '==', userId));
}

function normalizeJournalError(
  error: any,
  fallback = 'Something went wrong. Please try again later.',
) {
  const message = String(error?.message ?? '').toLowerCase();
  const code = String(error?.code ?? '').toLowerCase();

  if (
    code.includes('failed-precondition') ||
    message.includes('requires an index') ||
    code.includes('firestore/')
  ) {
    return 'Something went wrong. Please try again later.';
  }

  return error?.message ?? fallback;
}

async function isOnline() {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function pushPendingMutations(userId: string) {
  const pendingMutations = await getPendingJournalMutations(userId);

  for (const mutation of pendingMutations) {
    const docRef = getEntryDocument(userId, mutation.recordId);

    if (mutation.operation === 'DELETE') {
      await deleteDoc(docRef);
      await markJournalMutationSynced(mutation.id);
      continue;
    }

    if (!mutation.payload) {
      continue;
    }

    const payload = JSON.parse(mutation.payload) as JournalEntry;
    let resolvedPlace = payload.place;
    const resolvedImageTags = { ...payload.imageTags };

    if (!resolvedPlace && payload.location) {
      try {
        resolvedPlace = await reverseGeocodeLocation(payload.location);
      } catch {
        resolvedPlace = payload.place;
      }
    }

    for (const photo of payload.photos) {
      if (resolvedImageTags[photo]?.length) {
        continue;
      }

      try {
        const nextTags = await detectImageLabels(photo);
        if (nextTags.length) {
          resolvedImageTags[photo] = nextTags;
        }
      } catch {
        // Keep sync simple: if tagging fails for an image, skip it for now.
      }
    }

    const syncedPayload: JournalEntry = {
      ...payload,
      place: resolvedPlace,
      imageTags: normalizeImageTags(payload.photos, resolvedImageTags),
      syncStatus: 'synced',
      updatedAt: Math.max(Date.now(), payload.updatedAt),
    };

    await setDoc(
      docRef,
      {
        ...syncedPayload,
        userId,
        syncStatus: 'synced',
        labels: deleteField(),
        tags: deleteField(),
      },
      { merge: true },
    );

    await upsertJournalEntry(syncedPayload);
    await updateJournalSyncStatus(userId, payload.id, 'synced');
    await markJournalMutationSynced(mutation.id);
  }

  await clearSyncedJournalMutations(userId);
}

async function backfillMissingPlaces(userId: string) {
  const localEntries = await fetchAllJournalEntries(userId);
  let changedCount = 0;

  for (const entry of localEntries) {
    if (entry.place || !entry.location) {
      continue;
    }

    const resolvedPlace = await reverseGeocodeLocation(entry.location);

    if (!resolvedPlace) {
      continue;
    }

    const updatedEntry: JournalEntry = {
      ...entry,
      place: resolvedPlace,
      updatedAt: Math.max(Date.now(), entry.updatedAt),
      syncStatus: 'synced',
    };

    await setDoc(
      getEntryDocument(userId, entry.id),
      {
        ...updatedEntry,
        userId,
        tags: deleteField(),
      },
      { merge: true },
    );
    await upsertJournalEntry(updatedEntry);
    changedCount += 1;
  }

  return changedCount;
}

async function backfillMissingLabels(userId: string) {
  const localEntries = await fetchAllJournalEntries(userId);
  let changedCount = 0;

  for (const entry of localEntries) {
    if (!entry.photos.length || !hasMissingImageTags(entry.photos, entry.imageTags)) {
      continue;
    }

    const nextImageTags = { ...entry.imageTags };

    for (const photo of entry.photos) {
      if (nextImageTags[photo]?.length) {
        continue;
      }

      try {
        const nextTags = await detectImageLabels(photo);
        if (nextTags.length) {
          nextImageTags[photo] = nextTags;
        }
      } catch {
        // Skip failed photos and continue with the rest.
      }
    }

    const normalizedImageTags = normalizeImageTags(entry.photos, nextImageTags);

    if (Object.keys(normalizedImageTags).length === Object.keys(entry.imageTags).length) {
      continue;
    }

    const updatedEntry: JournalEntry = {
      ...entry,
      imageTags: normalizedImageTags,
      updatedAt: Math.max(Date.now(), entry.updatedAt),
      syncStatus: 'synced',
    };

    await setDoc(
      getEntryDocument(userId, entry.id),
      {
        ...updatedEntry,
        userId,
        labels: deleteField(),
        tags: deleteField(),
      },
      { merge: true },
    );
    await upsertJournalEntry(updatedEntry);
    changedCount += 1;
  }

  return changedCount;
}

async function pullRemoteEntries(userId: string) {
  const pendingMutations = await getPendingJournalMutations(userId);
  const pendingRecordIds = Array.from(
    new Set(pendingMutations.map(item => item.recordId)),
  );
  const snapshot = await getDocs(getUserPostsQuery(userId));

  const remoteEntries: JournalEntry[] = snapshot.docs.map((docSnapshot: any) => {
    const data = docSnapshot.data() as Partial<JournalEntry> & {
      labels?: string[];
      imageTags?: Record<string, string[]>;
    };

    return {
      id: docSnapshot.id,
      userId,
      title: data.title ?? '',
      description: data.description ?? '',
      photos: Array.isArray(data.photos) ? data.photos : [],
      imageTags: normalizeImageTags(
        Array.isArray(data.photos) ? data.photos : [],
        data.imageTags,
        Array.isArray(data.labels) ? data.labels : [],
      ),
      location:
        data.location &&
        typeof data.location.lat === 'number' &&
        typeof data.location.lng === 'number'
          ? {
              lat: data.location.lat,
              lng: data.location.lng,
            }
          : null,
      place: typeof data.place === 'string' ? data.place : null,
      timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
      syncStatus: 'synced',
      createdAt:
        typeof data.createdAt === 'number'
          ? data.createdAt
          : data.updatedAt ?? Date.now(),
      updatedAt:
        typeof data.updatedAt === 'number'
          ? data.updatedAt
          : data.timestamp ?? Date.now(),
    };
  });

  remoteEntries.sort((a, b) => b.updatedAt - a.updatedAt || b.timestamp - a.timestamp);

  await replaceLocalJournalCache(userId, remoteEntries, pendingRecordIds);
}

export const initializeJournal = createAsyncThunk(
  'journal/initialize',
  async () => {
    await initializeJournalDatabase();
  },
);

export const hydrateJournalEntries = createAsyncThunk<JournalEntry[], string>(
  'journal/hydrateJournalEntries',
  async userId => fetchAllJournalEntries(userId),
);

export const syncJournalEntries = createAsyncThunk<JournalEntry[], string>(
  'journal/syncJournalEntries',
  async (userId, { dispatch, rejectWithValue }) => {
    if (!(await isOnline())) {
      return fetchAllJournalEntries(userId);
    }

    try {
      await pushPendingMutations(userId);
      await pullRemoteEntries(userId);
      const latestEntries = await fetchAllJournalEntries(userId);

      Promise.allSettled([
        backfillMissingPlaces(userId),
        backfillMissingLabels(userId),
      ])
        .then(async results => {
          const updatedEntries = await fetchAllJournalEntries(userId);
          const hasEnrichmentChanges = results.some(
            result => result.status === 'fulfilled' && result.value > 0,
          );

          if (hasEnrichmentChanges) {
            dispatch(hydrateJournalEntries.fulfilled(updatedEntries, '', userId));
          }
        })
        .catch(() => {
          // Background enrichment is best-effort and should not break sync.
        });

      return latestEntries;
    } catch (error: any) {
      return rejectWithValue(normalizeJournalError(error));
    }
  },
);

export const createJournalEntry = createAsyncThunk<
  JournalEntry,
  { userId: string; input: CreateJournalEntryInput }
>('journal/createJournalEntry', async ({ userId, input }) => {
  const now = Date.now();
  const entry: JournalEntry = {
    id: uuid(),
    userId,
    title: input.title.trim(),
    description: input.description.trim(),
    photos: input.photos,
    imageTags: normalizeImageTags(input.photos, input.imageTags),
    location: input.location,
    place: input.place,
    timestamp: input.timestamp,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await upsertJournalEntry(entry);
  await queueJournalMutation({
    userId,
    recordId: entry.id,
    operation: 'CREATE',
    payload: entry,
  });

  return entry;
});

export const updateJournalEntry = createAsyncThunk<
  JournalEntry,
  { userId: string; input: UpdateJournalEntryInput }
>('journal/updateJournalEntry', async ({ userId, input }) => {
  const now = Date.now();
  const existingEntries = await fetchAllJournalEntries(userId);
  const existingEntry = existingEntries.find(item => item.id === input.id);
  const entry: JournalEntry = {
    id: input.id,
    userId,
    title: input.title.trim(),
    description: input.description.trim(),
    photos: input.photos,
    imageTags: normalizeImageTags(input.photos, input.imageTags),
    location: input.location,
    place: input.place,
    timestamp: input.timestamp,
    syncStatus: 'pending',
    createdAt: existingEntry?.createdAt ?? now,
    updatedAt: now,
  };

  await upsertJournalEntry(entry);
  await queueJournalMutation({
    userId,
    recordId: entry.id,
    operation: 'UPDATE',
    payload: entry,
  });

  return entry;
});

export const deleteJournalEntry = createAsyncThunk<
  string,
  { userId: string; entryId: string }
>('journal/deleteJournalEntry', async ({ userId, entryId }) => {
  await deleteJournalEntryFromLocal(userId, entryId);
  await queueJournalMutation({
    userId,
    recordId: entryId,
    operation: 'DELETE',
  });

  return entryId;
});

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearJournalState: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(initializeJournal.fulfilled, state => {
        state.initialized = true;
      })
      .addCase(hydrateJournalEntries.pending, state => {
        state.isHydrating = true;
        state.error = null;
      })
      .addCase(
        hydrateJournalEntries.fulfilled,
        (state, action: PayloadAction<JournalEntry[]>) => {
          state.entries = action.payload;
          state.isHydrating = false;
        },
      )
      .addCase(hydrateJournalEntries.rejected, (state, action) => {
        state.isHydrating = false;
        state.error = action.error.message ?? 'Unable to load journal entries.';
      })
      .addCase(syncJournalEntries.pending, state => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(
        syncJournalEntries.fulfilled,
        (state, action: PayloadAction<JournalEntry[]>) => {
          state.entries = action.payload;
          state.isSyncing = false;
        },
      )
      .addCase(syncJournalEntries.rejected, (state, action: any) => {
        state.isSyncing = false;
        state.error =
          action.payload ??
          normalizeJournalError(action.error) ??
          'Something went wrong. Please try again later.';
      })
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        state.entries = [
          action.payload,
          ...state.entries.filter(item => item.id !== action.payload.id),
        ].sort((a, b) => b.updatedAt - a.updatedAt || b.timestamp - a.timestamp);
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        state.entries = state.entries
          .map(item => (item.id === action.payload.id ? action.payload : item))
          .sort((a, b) => b.updatedAt - a.updatedAt || b.timestamp - a.timestamp);
      })
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(item => item.id !== action.payload);
      })
      .addMatcher(
        action =>
          action.type === createJournalEntry.rejected.type ||
          action.type === updateJournalEntry.rejected.type ||
          action.type === deleteJournalEntry.rejected.type,
        (state, action: any) => {
          state.error =
            action.payload ??
            normalizeJournalError(action.error) ??
            'Something went wrong. Please try again later.';
        },
      );
  },
});

export const { clearJournalState } = journalSlice.actions;
export default journalSlice.reducer;
