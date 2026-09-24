import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../config/permissions';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  requiredPermission?: Permission;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission, children }) => {
  const { user, loading, checkPermission } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-slate-400 text-sm animate-pulse">Verifying clinical credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Restricted Clinical Module</h2>
        <p className="text-sm text-slate-600">
          Your active role (<strong>{user.role}</strong>) does not have authorization to modify or access this module under hospital security policy.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
