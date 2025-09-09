import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import LandingPage from './pages/Landing';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import { auth } from './firebaseAuth';
import { useUserStore } from './stores/useUserStore';
import { Loader2 } from 'lucide-react';
// This component is the key. It redirects if the user is not logged in.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useUserStore(state => state.currentUser);
  if (!currentUser) {
    // If user is null, declaratively navigate to the landing page.
    return <ReactRouterDOM.Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
};
const App: React.FC = () => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { setCurrentUser, clearUser } = useUserStore();
  useEffect(() => {
    // This listener syncs the app state with Firebase's auth state.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        clearUser();
      }
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, [setCurrentUser, clearUser]);
  // Shows a loader while checking the initial auth state.
  if (!isAuthChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <ReactRouterDOM.HashRouter>
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/welcome" element={<LandingPage />} />
        <ReactRouterDOM.Route path="/login" element={<Login />} />
        <ReactRouterDOM.Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
        <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/welcome" replace />} />
      </ReactRouterDOM.Routes>
    </ReactRouterDOM.HashRouter>
  );
};
export default App;
