import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage/LoginPage";
import KakaoCallbackPage from "./pages/KakaoCallbackPage/KakaoCallbackPage";
import FriendsPage from "./pages/friends-page/friends-page";
import FriendRequestsPage from "./pages/friend-requests-page/friend-requests-page";
import HomePage from "./pages/HomePage/HomePage";
import Mypage from "./pages/mypage/mypage";
import RunningRecordPage from "./pages/running-record/running-record-page";
import ArtRunsPage from "./pages/art-runs-page/art-runs-page";
import ArtRunDetailPage from "./pages/art-run-detail-page/art-run-detail-page";
import ArtRunCreatePage from "./pages/art-run-create-page/art-run-create-page";
import ArtRunRunPage from "./pages/art-run-run-page/art-run-run-page";
import { AUTH_CLEARED_EVENT, getAccessToken, setAccessToken } from "./utils/tokens";
import { refreshAccessToken } from "./api/auth";
import SearchPage from './pages/search-page/search-page';


function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthed, setIsAuthed] = useState(Boolean(getAccessToken()));

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

      try {
        const { accessToken } = await refreshAccessToken();
        if (cancelled) {
          return;
        }

        if (accessToken) {
          setAccessToken(accessToken);
          setIsAuthed(true);
        }
      } catch {
        // API unavailable — stay unauthenticated
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
