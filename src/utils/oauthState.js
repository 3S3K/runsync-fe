const KEY = 'runsync.oauth.state.kakao';

export function createOauthState() {
  const state =
    typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  sessionStorage.setItem(KEY, state);
  return state;
}

export function consumeOauthState() {
  const state = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  return state;
}

