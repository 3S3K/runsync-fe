import { useEffect, useState } from 'react';

import { refreshAccessToken } from '../api/auth';
import { getAccessToken, setAccessToken } from './tokens';

export function useAuthBootstrap() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (getAccessToken()) {
        if (!cancelled) {
          setIsAuthed(true);
          setIsBootstrapping(false);
        }
        return;
      }

      const { accessToken } = await refreshAccessToken();
      if (cancelled) {
        return;
      }

      if (accessToken) {
        setAccessToken(accessToken);
        setIsAuthed(true);
      }
      setIsBootstrapping(false);
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isBootstrapping, isAuthed };
}
