import { BrowserRouter } from "react-router-dom";
import { useAuthInit } from "./auth/authHooks";
import { LoaderView } from "./components/Loader";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "./components/ErrorBoundaryFallback";
import { AppRoutes } from "./AppRoutes";

function App() {
  const { user, isVerifying } = useAuthInit();
  if (isVerifying) {
    return <LoaderView />;
  }
  
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <BrowserRouter>
        <div className="main">
          <AppRoutes user={user} />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
