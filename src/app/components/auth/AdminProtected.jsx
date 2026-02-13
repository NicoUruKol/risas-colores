import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";

export default function AdminProtected({ children }) {
    const { isAdmin } = useAdminAuth();
    const loc = useLocation();

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
    }

    return children;
}
