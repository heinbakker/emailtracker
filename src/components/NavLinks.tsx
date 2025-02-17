import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, BarChart3, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

export const NavLinks = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Link 
        to="/dashboard" 
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <BarChart3 className="w-5 h-5 md:hidden" />
        <span className="hidden md:inline">{translations.dashboard}</span>
      </Link>
      <Link 
        to="/ratings" 
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Star className="w-5 h-5 md:hidden" />
        <span className="hidden md:inline">{translations.ratings}</span>
      </Link>
      <Link 
        to="/organization" 
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Settings className="w-5 h-5 md:hidden" />
        <span className="hidden md:inline">{translations.settings}</span>
      </Link>
      <button 
        onClick={handleLogout}
        className="text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={translations.logout}
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};