import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { useContext, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupsList from './pages/GroupsList';
import GroupDetails from './pages/GroupDetails';
import ProtectedRoute from './components/ProtectedRoute';
import AddExpenseModal from './components/AddExpenseModal';

// Redirect authenticated users away from Login / Register
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F8]">
        <div className="w-8 h-8 border-3 border-[#FEE8EB] border-t-[#E60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ─── Auth Modal Overlay ────────────────────────────────────────────── */
const AuthModal = ({ mode, onClose, onSwitch }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose} // click backdrop → close
    >
      <div
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // click card → do NOT close
      >
        {mode === 'login' ? (
          <Login
            onClose={onClose}
            onSwitchToRegister={() => onSwitch('register')}
            isModal
          />
        ) : (
          <Register
            onClose={onClose}
            onSwitchToLogin={() => onSwitch('login')}
            isModal
          />
        )}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isGlobalAddExpenseOpen, setIsGlobalAddExpenseOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'

  const openLogin    = () => setAuthModal('login');
  const openRegister = () => setAuthModal('register');
  const closeAuth    = () => setAuthModal(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F8]">
      <Navbar
        onOpenAddExpense={() => setIsGlobalAddExpenseOpen(true)}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing onOpenLogin={openLogin} onOpenRegister={openRegister} />} />
          {/* Keep /login & /register routes so direct URL navigation still works */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetails />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modals (blurred backdrop) — shown only when not authenticated */}
      {authModal && !isAuthenticated && (
        <AuthModal
          mode={authModal}
          onClose={closeAuth}
          onSwitch={(newMode) => setAuthModal(newMode)}
        />
      )}

      {/* Global Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isGlobalAddExpenseOpen}
        onClose={() => setIsGlobalAddExpenseOpen(false)}
        onExpenseAdded={() => {
          window.dispatchEvent(new Event('expense_added_globally'));
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
