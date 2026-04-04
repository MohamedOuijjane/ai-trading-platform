import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <Dashboard
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage === 'users' && <Users />}
    </Dashboard>
  );
}