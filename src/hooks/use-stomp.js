import { useCallback, useEffect, useRef, useState } from 'react';

import { createStompClient } from '../api/stomp-client';

/**
 * STOMP 연결 생명주기를 관리하고 subscribe/publish 를 제공하는 훅.
 * @param {boolean} enabled true일 때 연결, false/언마운트 시 해제
 * @returns {{
 *   connected: boolean,
 *   error: string | null,
 *   subscribe: (destination: string, callback: (payload: any, message: object) => void) => (object | null),
 *   publish: (destination: string, body: object) => void,
 * }}
 */
export function useStomp(enabled) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const client = createStompClient({
      onConnect: () => {
        setConnected(true);
        setError(null);
      },
      onStompError: (frame) => {
        setError(frame?.headers?.message || 'STOMP 오류가 발생했어요.');
      },
      onWebSocketError: () => {
        setError('웹소켓 연결에 실패했어요.');
      },
      onClose: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      setConnected(false);
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled]);

  const subscribe = useCallback((destination, callback) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      return null;
    }

    return client.subscribe(destination, (message) => {
      let payload = message.body;
      try {
        payload = JSON.parse(message.body);
      } catch {
        payload = message.body;
      }

      callback(payload, message);
    });
  }, []);

  const publish = useCallback((destination, body) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      return;
    }

    client.publish({ destination, body: JSON.stringify(body) });
  }, []);

  return { connected, error, subscribe, publish };
}
