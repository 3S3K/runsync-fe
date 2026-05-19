import { getAccessToken } from '../../utils/tokens';

export default function HomePage() {
  const token = getAccessToken();

  return (
    <main style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>로그인 완료</h2>
      <p style={{ marginTop: 8, color: 'rgba(0,0,0,0.65)' }}>
        access token이 메모리에 있어요: {token ? 'YES' : 'NO'}
      </p>
    </main>
  );
}
