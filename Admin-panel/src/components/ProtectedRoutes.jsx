import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoutes = () => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated");

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If they have a token, render whatever child route they asked for!
    return <Outlet />;
};