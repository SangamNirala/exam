import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppStateProvider } from "./contexts/AppStateContext";
import { AdminProvider } from "./contexts/AdminContext";
import { StudentProvider } from "./contexts/StudentContext";
import { StudentAuthProvider } from "./contexts/StudentAuthContext";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import NewAdminDashboard from "./admin_frontend/NewAdminDashboard";
import AuthenticationFlow from "./student_frontend/Auth/AuthenticationFlow";

function App() {
  return (
    <div className="App">
      <AppStateProvider>
        <AdminProvider>
          <StudentProvider> 
            <StudentAuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AppContent />} />
                  <Route path="/dashboard/:tab?" element={<AppContent />} />
                  <Route path="/admin" element={<NewAdminDashboard />} />
                  <Route path="/student-portal" element={<AuthenticationFlow />} />
                </Routes>
              </BrowserRouter>
            </StudentAuthProvider>
          </StudentProvider>
        </AdminProvider>
      </AppStateProvider>
    </div>
  );
}

const AppContent = () => {
  const [currentView, setCurrentView] = React.useState('landing');

  const handleRoleSelect = (role) => {
    if (role === 'admin') {
      // Redirect to new admin dashboard
      window.location.href = '/admin';
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage onRoleSelect={handleRoleSelect} />
      )}
      {currentView === 'dashboard' && (
        <Dashboard onBackToLanding={handleBackToLanding} />
      )}
    </>
  );
};

export default App;