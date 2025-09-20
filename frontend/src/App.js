import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppStateProvider } from "./contexts/AppStateContext";
import { AdminProvider } from "./contexts/AdminContext";
import { StudentProvider } from "./contexts/StudentContext";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="App">
      <AppStateProvider>
        <AdminProvider>
          <StudentProvider> 
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppContent />} />
                <Route path="/dashboard/:tab?" element={<AppContent />} />
              </Routes>
            </BrowserRouter>
          </StudentProvider>
        </AdminProvider>
      </AppStateProvider>
    </div>
  );
}

const AppContent = () => {
  const [currentView, setCurrentView] = React.useState('landing');

  const handleRoleSelect = (role) => {
    setCurrentView('dashboard');
    // The role will be handled by the Dashboard component's tab switching
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