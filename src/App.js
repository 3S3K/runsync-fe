import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage/LoginPage";
import KakaoCallbackPage from "./pages/KakaoCallbackPage/KakaoCallbackPage";
import FriendsPage from "./pages/friends-page/friends-page";
import HomePage from "./pages/HomePage/HomePage";
import Mypage from "./pages/mypage/mypage";
import { getAccessToken, setAccessToken } from "./utils/tokens";
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
          path="/home"
          element={isAuthed ? <HomePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/friends"
          element={isAuthed ? <FriendsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/mypage"
          element={isAuthed ? <Mypage /> : <Navigate to="/" replace />}
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
