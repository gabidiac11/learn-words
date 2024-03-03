import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./auth/Login";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useAuthInit } from "./auth/authHooks";
import { LoaderView } from "./components/Loader";
import { UploadFilePage } from "./pages/UploadFilePage";
import Header from "./components/Header";
import { LearnedWordsPage } from "./pages/LearnedWordsPage";
import { WordsToLearnPage } from "./pages/WordsToLearnPage";
import { routes as r } from "./routes";
import { WithInitialization } from "./components/WithInitialization";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback";
import { TextPage } from "./pages/TextPage/TextPage";

function App() {
  const { user, isVerifying } = useAuthInit();
  const isAuth = !!user;
  if (isVerifying) {
    return <LoaderView />;
  }
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <BrowserRouter>
        <div className="main">
          {user ? (
            <WithInitialization>
              <Header />
              <Routes>
                <Route path={r.Home.path} element={<Home />} />
                <Route
                  path={r.LearnedWords.path}
                  element={<LearnedWordsPage />}
                />
                <Route
                  path={r.WordsToLearn.path}
                  element={<WordsToLearnPage />}
                />
                <Route path={r.File.path} element={<UploadFilePage />} />
                <Route path={r.Text.path} element={<TextPage />} />
                <Route
                  path="*"
                  element={<DefaultRouteRedirection isAuth={isAuth} />}
                />
              </Routes>
            </WithInitialization>
          ) : (
            <Routes>
              <Route path={r.Login.path} element={<Login />} />
              <Route
                path="*"
                element={<DefaultRouteRedirection isAuth={isAuth} />}
              />
            </Routes>
          )}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

const DefaultRouteRedirection = (props: { isAuth: boolean }) => {
  const navigate = useNavigate();

  useEffect(() => {
    props.isAuth && navigate("/home", { replace: true });
    !props.isAuth && navigate("/login", { replace: true });
  }, [navigate, props.isAuth]);

  return <LoaderView />;
};

export default App;
