import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./auth/Login";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useAuthInit } from "./auth/authHooks";
import { LoaderView } from "./components/Loader";
import { AddRecordFilePage } from "./pages/add-record/AddRecordFilePage";
import Header from "./components/Header/Header";
import { LearnedWordsPage } from "./pages/LearnedWordsPage";
import { WordsToLearnPage } from "./pages/WordsToLearnPage";
import { routes as r } from "./routes";
import { WithInitialization } from "./components/WithInitialization";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback";
import { AddRecordTextPage } from "./pages/add-record/AddRecordTextPage";
import { NotFound } from "./pages/NotFound";
import { AddRecordUrlPage } from "./pages/add-record/AddRecordUrlPage";
import { RecordPage } from "./pages/RecordPage";

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
                <Route path={r.File.path} element={<AddRecordFilePage />} />
                <Route path={r.Text.path} element={<AddRecordTextPage />} />
                <Route path={r.Url.path} element={<AddRecordUrlPage />} />
                <Route path={r.Record.path} element={<RecordPage />} />
                <Route path={"/404"} element={<NotFound />} />
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
  const location = useLocation();

  useEffect(() => {
    if (!props.isAuth) {
      navigate("/login", { replace: true });
      return;
    }
    if (
      location.pathname === "/login" ||
      location.pathname === "/" ||
      !location.pathname
    ) {
      navigate("/home", { replace: true });
    } else {
      navigate("/404", { replace: true });
    }
  }, [location.pathname, navigate, props.isAuth]);

  return <LoaderView />;
};

export default App;
