import { db } from '../../db/client';
import { uuid } from '../../Utility/uuid';
import {
  JournalEntry,
  JournalOutboxItem,
  SyncStatus,
  normalizeImageTags,
} from './types';

const JOURNAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photos TEXT NOT NULL,
  imageTags TEXT NOT NULL,
  labels TEXT NOT NULL,
  locationLat REAL,
  locationLng REAL,
  place TEXT,
  timestamp INTEGER NOT NULL,
  syncStatus TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_userId
ON journal_entries(userId, updatedAt DESC);

CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  tableName TEXT NOT NULL,
  recordId TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT,
  createdAt INTEGER NOT NULL,
  synced INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_user_pending
ON outbox(userId, tableName, synced, createdAt);
`;

const JOURNAL_TABLE = 'journal_entries';

type SqliteRow = {
  id: string;
  userId: string;
  title: string;
  description: string;
  photos: string;
  imageTags: string;
  labels: string;
  locationLat: number | null;
  locationLng: number | null;
  place: string | null;
  timestamp: number;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
};

type OutboxRow = {
  id: string;
  userId: string;
  recordId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: string | null;
  createdAt: number;
};

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: string | null | undefined) {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function mapJournalRow(row: SqliteRow): JournalEntry {
  const hasLocation =
    typeof row.locationLat === 'number' && typeof row.locationLng === 'number';
  const photos = parseJsonArray(row.photos);
  const legacyLabels = parseJsonArray(row.labels);

  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    photos,
    imageTags: normalizeImageTags(
      photos,
      parseJsonObject(row.imageTags) as Record<string, string[]>,
      legacyLabels,
    ),
    location: hasLocation
      ? {
          lat: row.locationLat as number,
          lng: row.locationLng as number,
        }
      : null,
    place: row.place,
    timestamp: row.timestamp,
    syncStatus: row.syncStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function initializeJournalDatabase() {
  await db.execute(JOURNAL_SCHEMA);
  await db.execute(`ALTER TABLE journal_entries ADD COLUMN place TEXT`).catch(() => {});
  await db.execute(`ALTER TABLE journal_entries ADD COLUMN createdAt INTEGER`).catch(() => {});
  await db.execute(`ALTER TABLE journal_entries ADD COLUMN labels TEXT NOT NULL DEFAULT '[]'`).catch(() => {});
  await db.execute(`ALTER TABLE journal_entries ADD COLUMN imageTags TEXT NOT NULL DEFAULT '{}'`).catch(() => {});

  const tableInfo = await db.execute(`PRAGMA table_info(journal_entries)`);
  const columns = (tableInfo.rows as Array<{ name: string }>).map(row => row.name);

  if (columns.includes('tags')) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS journal_entries_v2 (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        photos TEXT NOT NULL,
        imageTags TEXT NOT NULL,
        labels TEXT NOT NULL,
        locationLat REAL,
        locationLng REAL,
        place TEXT,
        timestamp INTEGER NOT NULL,
        syncStatus TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);
    await db.execute(`
      INSERT OR REPLACE INTO journal_entries_v2
      (id, userId, title, description, photos, imageTags, labels, locationLat, locationLng, place, timestamp, syncStatus, createdAt, updatedAt)
      SELECT
        id,
        userId,
        title,
        description,
        photos,
        '{}',
        '[]',
        locationLat,
        locationLng,
        place,
        timestamp,
        syncStatus,
        COALESCE(createdAt, updatedAt, timestamp),
        updatedAt
      FROM journal_entries;
    `);
    await db.execute(`DROP TABLE journal_entries`);
    await db.execute(`ALTER TABLE journal_entries_v2 RENAME TO journal_entries`);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_userId
      ON journal_entries(userId, updatedAt DESC);
    `);
  }
}

export async function fetchAllJournalEntries(userId: string) {
  const result = await db.execute(
    `SELECT * FROM journal_entries
     WHERE userId = ?
     ORDER BY updatedAt DESC, timestamp DESC`,
    [userId],
  );

  return (result.rows as SqliteRow[]).map(row => mapJournalRow(row));
}

export async function upsertJournalEntry(entry: JournalEntry) {
  await db.execute(
    `INSERT OR REPLACE INTO journal_entries
     (id, userId, title, description, photos, imageTags, labels, locationLat, locationLng, place, timestamp, syncStatus, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.userId,
      entry.title,
      entry.description,
      JSON.stringify(entry.photos),
      JSON.stringify(entry.imageTags),
      '[]',
      entry.location?.lat ?? null,
      entry.location?.lng ?? null,
      entry.place,
      entry.timestamp,
      entry.syncStatus,
      entry.createdAt,
      entry.updatedAt,
    ],
  );
}

export async function deleteJournalEntryFromLocal(
  userId: string,
  entryId: string,
) {
  await db.execute(`DELETE FROM journal_entries WHERE userId = ? AND id = ?`, [
    userId,
    entryId,
  ]);
}

export async function updateJournalSyncStatus(
  userId: string,
  entryId: string,
  syncStatus: SyncStatus,
) {
  await db.execute(
    `UPDATE journal_entries
     SET syncStatus = ?
     WHERE userId = ? AND id = ?`,
    [syncStatus, userId, entryId],
  );
}

export async function queueJournalMutation(params: {
  userId: string;
  recordId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload?: JournalEntry;
}) {
  await db.execute(
    `INSERT INTO outbox
     (id, userId, tableName, recordId, operation, payload, createdAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      uuid(),
      params.userId,
      JOURNAL_TABLE,
      params.recordId,
      params.operation,
      params.payload ? JSON.stringify(params.payload) : null,
      Date.now(),
    ],
  );
}

export async function getPendingJournalMutations(
  userId: string,
): Promise<JournalOutboxItem[]> {
  const result = await db.execute(
    `SELECT id, userId, recordId, operation, payload, createdAt
     FROM outbox
     WHERE userId = ? AND tableName = ? AND synced = 0
     ORDER BY createdAt ASC`,
    [userId, JOURNAL_TABLE],
  );

  return (result.rows as OutboxRow[]).map(row => ({
    id: row.id,
    userId: row.userId,
    recordId: row.recordId,
    operation: row.operation,
    payload: row.payload,
    createdAt: row.createdAt,
  }));
}

export async function markJournalMutationSynced(id: string) {
  await db.execute(`UPDATE outbox SET synced = 1 WHERE id = ?`, [id]);
}

export async function clearSyncedJournalMutations(userId: string) {
  await db.execute(
    `DELETE FROM outbox
     WHERE userId = ? AND tableName = ? AND synced = 1`,
    [userId, JOURNAL_TABLE],
  );
}

export async function replaceLocalJournalCache(
  userId: string,
  remoteEntries: JournalEntry[],
  pendingRecordIds: string[],
) {
  const pendingIds = new Set(pendingRecordIds);

  for (const entry of remoteEntries) {
    if (pendingIds.has(entry.id)) {
      continue;
    }

    await upsertJournalEntry({
      ...entry,
      userId,
      syncStatus: 'synced',
    });
  }

  const localEntries = await fetchAllJournalEntries(userId);
  const remoteIds = new Set(remoteEntries.map(entry => entry.id));

  for (const localEntry of localEntries) {
    const shouldDelete =
      localEntry.syncStatus === 'synced' &&
      !pendingIds.has(localEntry.id) &&
      !remoteIds.has(localEntry.id);

    if (shouldDelete) {
      await deleteJournalEntryFromLocal(userId, localEntry.id);
    }
  }
}
