import { useCallback, useEffect, useRef, useState } from 'react';

import {
  acceptFriendRequest,
  getReceivedRequests,
  getSentRequests,
  rejectFriendRequest,
} from '../api/friend';

/**
 * 받은 친구 요청 조회 + 수락/거절을 관리하는 훅.
 * @returns {{
 *   received: Array<object>,
 *   status: 'loading' | 'success' | 'error',
 *   error: string | null,
 *   processingIds: Array<number>,
 *   accept: (requestId: number) => Promise<void>,
 *   reject: (requestId: number) => Promise<void>,
 *   reload: () => void,
 * }}
 */
export function useFriendRequests() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState([]);
  const inFlightRef = useRef(new Set());

  const load = useCallback(async () => {
    setStatus('loading');
    const [receivedResult, sentResult] = await Promise.allSettled([
      getReceivedRequests(),
      getSentRequests(),
    ]);

    if (sentResult.status === 'fulfilled') {
      setSent(sentResult.value);
    }

    if (receivedResult.status === 'fulfilled') {
      setReceived(receivedResult.value);
      setError(null);
      setStatus('success');
    } else {
      setError('친구 요청을 불러오지 못했어요.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = useCallback(async (requestId, action) => {
    if (inFlightRef.current.has(requestId)) {
      return;
    }
    inFlightRef.current.add(requestId);
    setProcessingIds((prev) => [...prev, requestId]);

    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
      } else {
        await rejectFriendRequest(requestId);
      }
      setReceived((prev) => prev.filter((request) => request.requestId !== requestId));
    } finally {
      inFlightRef.current.delete(requestId);
      setProcessingIds((prev) => prev.filter((id) => id !== requestId));
    }
  }, []);

  const accept = useCallback((requestId) => respond(requestId, 'accept'), [respond]);
  const reject = useCallback((requestId) => respond(requestId, 'reject'), [respond]);

  return { received, sent, status, error, processingIds, accept, reject, reload: load };
}
