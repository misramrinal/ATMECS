import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="bg-gray-800 text-white p-4">
    <nav className="max-w-7xl mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        <Link to="/">Evolvix</Link>
      </h1>
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="hover:text-purple-400">
            Home
          </Link>
        </li>
        <li>
          <Link to="/features" className="hover:text-purple-400">
            Features
          </Link>
        </li>
        <li>
          <Link to="/nexus" className="hover:text-purple-400">
            Nexus
          </Link>
        </li>
      </ul>
    </nav>
  </header>
);

export default Header;