import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./auth/Login";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useAuthInit } from "./auth/authHooks";
import { LoaderView } from "./components/Loader";

function App() {
  const { user, isVerifying } = useAuthInit();
  const isAuth = !!user;
  if (isVerifying) {
    return <LoaderView />;
  }
  return (
    <BrowserRouter>
      <div className="main">
        {user ? (
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route
              path="*"
              element={<DefaultRouteRedirection isAuth={isAuth} />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={<DefaultRouteRedirection isAuth={isAuth} />}
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
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