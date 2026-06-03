import axios from 'axios';

import { API_BASE_URL } from './config';
import { extractAccessTokenFromResponse } from '../utils/auth-response';
import { setAccessToken } from '../utils/tokens';

const reissueClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function requestTokenReissue() {
  const response = await reissueClient.post('/api/auth/reissue/token');
  const accessToken = extractAccessTokenFromResponse(response);

  if (accessToken) {
    setAccessToken(accessToken);
  }

  return accessToken;
}
