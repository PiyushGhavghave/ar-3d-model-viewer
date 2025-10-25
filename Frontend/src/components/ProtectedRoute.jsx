import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
