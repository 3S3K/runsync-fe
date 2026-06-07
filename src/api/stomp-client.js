import { Client } from '@stomp/stompjs';

import { getAccessToken } from '../utils/tokens';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws/locations';

/**
 * STOMP 클라이언트를 우리 설정으로 생성한다.
 * activate()로 연결, deactivate()로 해제한다 (생명주기는 use-stomp 훅에서 관리).
 * @param {{
 *   onConnect?: () => void,
 *   onStompError?: (frame: object) => void,
 *   onWebSocketError?: (event: Event) => void,
 *   onClose?: (event: CloseEvent) => void,
 * }} [handlers]
 * @returns {import('@stomp/stompjs').Client}
 */
export function createStompClient(handlers = {}) {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: handlers.onConnect,
    onStompError: handlers.onStompError,
    onWebSocketError: handlers.onWebSocketError,
    onWebSocketClose: handlers.onClose,
  });

  // 매 연결(재연결 포함)마다 최신 토큰을 CONNECT 헤더에 싣는다.
  client.beforeConnect = () => {
    client.connectHeaders = { Authorization: `Bearer ${getAccessToken()}` };
  };

  return client;
}
