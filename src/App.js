import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage/LoginPage";
import KakaoCallbackPage from "./pages/KakaoCallbackPage/KakaoCallbackPage";
import FriendsPage from "./pages/friends-page/friends-page";
import FriendRequestsPage from "./pages/friend-requests-page/friend-requests-page";
import HomePage from "./pages/HomePage/HomePage";
import Mypage from "./pages/mypage/mypage";
import ProfileEditPage from "./pages/profile-edit/profile-edit-page";
import RunningRecordPage from "./pages/running-record/running-record-page";
import ArtRunsPage from "./pages/art-runs-page/art-runs-page";
import ArtRunDetailPage from "./pages/art-run-detail-page/art-run-detail-page";
import ArtRunCreatePage from "./pages/art-run-create-page/art-run-create-page";
import ArtRunRunPage from "./pages/art-run-run-page/art-run-run-page";
import ArtRunResultPage from "./pages/art-run-result-page/art-run-result-page";
import { AUTH_CLEARED_EVENT, clearAuthSession, getAccessToken, setAccessToken } from "./utils/tokens";
import { isAccessTokenValid } from "./utils/access-token";
import { refreshAccessToken } from "./api/auth";
import SearchPage from './pages/search-page/search-page';


function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthed, setIsAuthed] = useState(() => isAccessTokenValid(getAccessToken()));

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      // 토큰 "존재"가 아니라 "유효성"으로 판단한다.
      // 유효한 토큰이 있으면 바로 인증, 없거나 만료됐으면 reissue를 선제적으로 시도한다.
      if (isAccessTokenValid(getAccessToken())) {
        if (!cancelled) {
          setIsAuthed(true);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const { accessToken } = await refreshAccessToken();
        if (cancelled) {
          return;
        }

        if (accessToken) {
          setAccessToken(accessToken);
          setIsAuthed(true);
        } else {
          // 만료된 토큰을 갱신하지 못함 → 남은 토큰을 정리해 깔끔히 로그아웃 상태로
          clearAuthSession();
          setIsAuthed(false);
        }
      } catch {
        if (!cancelled) {
          clearAuthSession();
          setIsAuthed(false);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleAuthCleared = () => {
      setIsAuthed(false);
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    };
  }, []);

  if (isBootstrapping) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthed ? <Navigate to="/home" replace /> : <LoginPage />}
        />
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/home" replace /> : <LoginPage />}
        />
        <Route
          path="/home"
          element={isAuthed ? <HomePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/friends"
          element={isAuthed ? <FriendsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/friends/requests"
          element={isAuthed ? <FriendRequestsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/mypage"
          element={isAuthed ? <Mypage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/mypage/edit"
          element={isAuthed ? <ProfileEditPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/running-record/:id"
          element={isAuthed ? <RunningRecordPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/art-runs"
          element={isAuthed ? <ArtRunsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/art-runs/new"
          element={isAuthed ? <ArtRunCreatePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/art-runs/:id"
          element={isAuthed ? <ArtRunDetailPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/art-runs/:id/run"
          element={isAuthed ? <ArtRunRunPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/art-runs/:id/result"
          element={isAuthed ? <ArtRunResultPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/search"
          element={<SearchPage />}
        />
        <Route
          path="/login/oauth2/code/kakao"
          element={<KakaoCallbackPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
