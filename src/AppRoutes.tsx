import { User } from "firebase/auth";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Header from "./components/Header/Header";
import { LoaderView } from "./components/Loader";
import { WithInitialization } from "./components/WithInitialization";
import { AddRecordFilePage } from "./pages/add-record/AddRecordFilePage";
import { AddRecordTextPage } from "./pages/add-record/AddRecordTextPage";
import { AddRecordUrlPage } from "./pages/add-record/AddRecordUrlPage";
import { NotFound } from "./pages/NotFound";
import { RecordPage } from "./pages/record/RecordPage";
import Records from "./pages/records/RecordsPage";
import { WordsToLearnPage } from "./pages/WordsToLearnPage";
import { routes as r } from "./routes";

export const AppRoutes = ({ user }: { user: User | null | undefined }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const originalPath = useRef<{
    startPath: string | null;
    toRedirect: string | null | undefined;
  }>({
    startPath:
      location.pathname.indexOf(r.Login.path) === -1 ? location.pathname : null,
    toRedirect: undefined,
  });

  useEffect(() => {
    if (!originalPath.current.startPath) {
      return;
    }

    if (originalPath.current.toRedirect === null) {
      return;
    }

    if (!user) {
      originalPath.current.toRedirect = originalPath.current.startPath;
      return;
    }

    if (user) {
      originalPath.current.toRedirect = null;
      navigate(originalPath.current.startPath, { replace: true });
    }
  }, [navigate, user]);

  const isAuth = !!user && !originalPath.current.toRedirect;

  return isAuth ? (
    <WithInitialization>
      <Header />
      <Routes>
        <Route path={r.Records.path} element={<Records />} />
        <Route path={r.WordsToLearn.path} element={<WordsToLearnPage />} />
        <Route path={r.File.path} element={<AddRecordFilePage />} />
        <Route path={r.Text.path} element={<AddRecordTextPage />} />
        <Route path={r.Url.path} element={<AddRecordUrlPage />} />
        <Route path={r.Record.path} element={<RecordPage />} />
        <Route path={"/404"} element={<NotFound />} />
        <Route path="*" element={<DefaultRouteRedirection isAuth={isAuth} />} />
      </Routes>
    </WithInitialization>
  ) : (
    <Routes>
      <Route path={r.Login.path} element={<Login />} />
      <Route path="*" element={<DefaultRouteRedirection isAuth={isAuth} />} />
    </Routes>
  );
};

const DefaultRouteRedirection = (props: { isAuth: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!props.isAuth) {
      navigate(r.Login.path, { replace: true });
      return;
    }
    if (
      location.pathname === r.Login.path ||
      location.pathname === "/" ||
      !location.pathname
    ) {
      navigate(r.Records.path, { replace: true });
    } else {
      navigate("/404", { replace: true });
    }
  }, [location.pathname, navigate, props.isAuth]);

  return <LoaderView />;
};
