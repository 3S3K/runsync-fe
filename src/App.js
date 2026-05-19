import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import KakaoCallbackPage from './pages/kakao-callback-page/kakao-callback-page';
import HomePage from './pages/home-page/home-page';
import LoginPageContainer from './pages/login-page/login-page-container';
import { useAuthBootstrap } from './utils/use-auth-bootstrap';

function App() {
  const { isBootstrapping, isAuthed } = useAuthBootstrap();

  if (isBootstrapping) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthed ? (
              <Navigate
                to="/home"
                replace
              />
            ) : (
              <LoginPageContainer />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthed ? (
              <HomePage />
            ) : (
              <Navigate
                to="/"
                replace
              />
            )
          }
        />
        <Route
          path="/oauth/kakao/callback"
          element={<KakaoCallbackPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
