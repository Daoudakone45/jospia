import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="text-3xl">🕌</div>
            <div>
              <div className="text-xl font-bold">JOSPIA</div>
              <div className="text-xs text-green-200">2025-2026</div>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-green-200 transition">
                  Tableau de bord
                </Link>
                
                {user?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-green-200 transition">
                    Administration
                  </Link>
                )}

                <div className="flex items-center gap-4">
                  <span className="text-sm bg-green-800 px-3 py-1 rounded-full">
                    {user?.full_name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-green-200 transition font-medium">
                  Accueil
                </Link>
                <Link to="/register" className="hover:text-green-200 transition font-medium">
                  Inscription
                </Link>
                <Link to="/login" className="hover:text-green-200 transition font-medium">
                  Connexion
                </Link>
                <Link to="/contact" className="hover:text-green-200 transition font-medium">
                  Contact
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
