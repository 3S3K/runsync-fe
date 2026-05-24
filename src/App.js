import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage/LoginPage";
import KakaoCallbackPage from "./pages/KakaoCallbackPage/KakaoCallbackPage";
import FriendsPage from "./pages/friends-page/friends-page";
import HomePage from "./pages/HomePage/HomePage";
import Mypage from "./pages/mypage/mypage";
import { getAccessToken, setAccessToken } from "./utils/tokens";
import { refreshAccessToken } from "./api/auth";

function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthed, setIsAuthed] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    const run = async () => {
      // 이미 있으면(콜백 직후) 스킵
      if (getAccessToken()) {
        setIsAuthed(true);
        setIsBootstrapping(false);
        return;
      }

      const { accessToken } = await refreshAccessToken();
      if (accessToken) {
        setAccessToken(accessToken);
        setIsAuthed(true);
      }

      setIsBootstrapping(false);
    };

    run();
  }, []);

  if (isBootstrapping) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthed ? <Navigate to="/home" replace /> : <LoginPage />}
        />
        {/* TODO: 배포 전 인증 가드 복구 — element={isAuthed ? <HomePage /> : <Navigate to="/" replace />} */}
        <Route
          path="/home"
          element={<HomePage />}
        />
        <Route
          path="/friends"
          element={<FriendsPage />}
        />
        {/* TODO: 배포 전 인증 가드 복구 */}
        <Route
          path="/mypage"
          element={<Mypage />}
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
