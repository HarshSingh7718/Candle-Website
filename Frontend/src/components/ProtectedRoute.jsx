import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useAuth";

/**
 * ProtectedRoute — Prevents unauthenticated users from accessing private pages.
 *
 * Uses the useUser() TanStack Query hook which hits GET /user/profile.
 * - If the cookie-based JWT is valid → user data is returned → render children.
 * - If the cookie is missing/expired → API returns 401 → isError = true → redirect.
 * - If the backend/network is down → isError = true → redirect (prevents infinite spinner).
 */
const ProtectedRoute = () => {
  const { data: user, isLoading, isError } = useUser();

  // Show a loading spinner while the auth check is in-flight.
  // This prevents a flash of the sign-in page on authenticated refreshes.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-coffee border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If the query errored (401, network failure, backend down) OR
  // if the user data is null/undefined → redirect to sign-in.
  if (isError || !user) {
    return <Navigate to="/signin" replace />;
  }

  // User is authenticated — render the child route.
  return <Outlet />;
};

export default ProtectedRoute;
