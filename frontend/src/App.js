import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/AdminDashboard";
import StudentPortal from "./components/StudentPortal";

function App() {
  const [currentView, setCurrentView] = useState('landing');

  const handleRoleSelect = (role) => {
    setCurrentView(role);
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <>
              {currentView === 'landing' && (
                <LandingPage onRoleSelect={handleRoleSelect} />
              )}
              {currentView === 'admin' && (
                <AdminDashboard onBack={handleBackToHome} />
              )}
              {currentView === 'student' && (
                <StudentPortal onBack={handleBackToHome} />
              )}
            </>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;