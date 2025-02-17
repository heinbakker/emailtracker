import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Settings, LogOut } from 'lucide-react';
import { NavLogo } from './NavLogo';
import { NavLinks } from './NavLinks';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLogo />
          <NavLinks />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;