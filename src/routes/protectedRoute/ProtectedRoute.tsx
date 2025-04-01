// ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "components/layout/mainLayout/MainLayout";
import { useAuth } from "context/AuthContext";

// Define the props type for the ProtectedRoute component
type Props = {
  children: JSX.Element; // The content to be rendered if the user is authenticated
  redirectPath: string; // The path to redirect to if the user is not authenticated
};

// ProtectedRoute component renders the provided content only if the user is authenticated
// Otherwise, it redirects to the specified path
const ProtectedRoute = ({ redirectPath, children }: Props) => {
  const { isAuthenticated } = useAuth();

  // Check if the user is not authenticated
  if (isAuthenticated) {
    
    // Render the MainLayout with the provided content if the user is authenticated
    return (
      <>
        <MainLayout isAuth={isAuthenticated}>{children}</MainLayout>
      </>
    );
  } else {
    
    // Redirect to the specified path
    return <Navigate to={redirectPath} replace />;
  }
};
export default ProtectedRoute;
