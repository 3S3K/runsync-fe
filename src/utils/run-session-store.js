const ACTIVE_SESSION_STORAGE_KEY = 'activeRunSessionId';
const SESSION_STARTED_AT_KEY = 'activeRunSessionStartedAt';

function readStoredSessionId() {
  return localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
}

function readStoredStartedAt() {
  const stored = localStorage.getItem(SESSION_STARTED_AT_KEY);
  return stored ? Number(stored) : null;
}

let activeSessionId = readStoredSessionId();
let sessionStartedAt = readStoredStartedAt();

export function getActiveRunSessionId() {
  return activeSessionId || readStoredSessionId();
}

export function getRunSessionStartedAt() {
  return sessionStartedAt || readStoredStartedAt();
}

export function setActiveRunSession(sessionId, startedAt = Date.now()) {
  activeSessionId = sessionId ? String(sessionId) : null;
  sessionStartedAt = sessionId ? startedAt : null;

  if (activeSessionId) {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSessionId);
    localStorage.setItem(SESSION_STARTED_AT_KEY, String(sessionStartedAt));
    return;
  }

  localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_STARTED_AT_KEY);
}

export function clearActiveRunSession() {
  setActiveRunSession(null);
}
