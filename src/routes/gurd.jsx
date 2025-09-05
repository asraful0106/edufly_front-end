// import { Navigate, Outlet, useParams } from "react-router-dom";
// import { useAuth } from "../contextapi/AuthContext";

// export function RequireAuth() {
//     const { isAuthenticated, profile } = useAuth();
//     const { id: routeInstitutionId } = useParams();

//     if (!isAuthenticated) return <Navigate to="/login" replace />;

//     // Tenant isolation: :id must match the logged-in institution id
//     if (routeInstitutionId && String(routeInstitutionId) !== String(profile?.institution_id)) {
//         return <Navigate to={`/${profile?.institution_id}/dashboard`} replace />;
//     }
//     return <Outlet />;
// }

// export function RequireRole({ allow }) {
//     const { profile } = useAuth();
//     if (!profile || !allow.includes(profile.role)) return <Navigate to="/login" replace />;
//     return <Outlet />;
// }

// src/routes/gurd.jsx
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../contextapi/AuthContext";

export function RequireAuth() {
    const { isAuthenticated, profile } = useAuth();
    const { id: routeInstitutionId } = useParams();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Use EIIN as the source of truth; fall back to old key if present
    const tenantId = String(profile?.institution_eiin ?? profile?.institution_id ?? "");

    // Tenant isolation: URL :id must match logged-in institution EIIN
    if (routeInstitutionId && String(routeInstitutionId) !== tenantId) {
        return <Navigate to={`/${tenantId}/dashboard`} replace />;
    }

    return <Outlet />;
}

export function RequireRole({ allow }) {
    const { profile } = useAuth();
    if (!profile || !allow.includes(profile.role)) {
        // If role mismatches on a nested dashboard route, send to the role landing/index,
        // not all the way to /login (prevents “kicked to login” experience).
        const tenantId = profile?.institution_eiin ?? profile?.institution_id;
        if (tenantId && profile.role === "institution") {
            return <Navigate to={`/${tenantId}/dashboard`} replace />;
        }
        if (tenantId && profile.role === "teacher") {
            return <Navigate to={`/${tenantId}/dashboard/teacher-dashboard`} replace />;
        }
        if (tenantId && profile.role === "student") {
            return <Navigate to={`/${tenantId}/dashboard/student`} replace />;
        }
        return  <Navigate to="/login" replace />;
    }
    return <Outlet />;
}
