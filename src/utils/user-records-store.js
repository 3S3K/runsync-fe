let cachedRecords = [];

export function setCachedUserRecords(records) {
  cachedRecords = Array.isArray(records) ? records : [];
}

export function getCachedUserRecords() {
  return cachedRecords;
}

export function getCachedUserRecordById(recordId) {
  const targetId = String(recordId);

  return cachedRecords.find(
    (record) => String(record.recordId) === targetId,
  ) ?? null;
}

export function clearCachedUserRecords() {
  cachedRecords = [];
}
