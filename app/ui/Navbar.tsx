import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 h-full w-64 fixed left-0 top-0 p-4">
      <div className="flex flex-col h-full">
        <Link href="/" className="text-white text-2xl font-bold mb-8">
          Deadlock Calculator
        </Link>
        <ul className="flex flex-col space-y-4 flex-grow">
          <li>
            <Link href="/" className="text-white hover:text-gray-300 block">
              Home
            </Link>
          </li>
          {/* <li>
            <Link href="/characters" className="text-white hover:text-gray-300 block">
              Characters
            </Link>
          </li> */}
          <li>
            <Link href="/items" className="text-white hover:text-gray-300 block">
              Items
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;