import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export const NavLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <BarChart3 className="w-6 h-6 text-blue-600" />
      <span className="font-semibold text-xl">Klanttevredenheid meten - IJsselheem</span>
    </Link>
  );
};