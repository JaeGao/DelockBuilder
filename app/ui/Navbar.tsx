'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <>
      <nav className=' bg-white border-gray-200 dark:bg-gray-900'>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-start p-4">

          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse pr-10">
            <span className="self-center whitespace-nowrap text-custom-beige text-2xl font-bold hover:text-amber-500">Deadlock Calculator</span>
          </Link>
          <div className='hidden w-full md:block md:w-auto'>
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <Link href="/" className="text-custom-beige block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-amber-500 md:p-0  md:dark:hover:text-amber-500 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/items" className="text-custom-beige block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-amber-500 md:p-0 md:dark:hover:text-amber-500 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                  Items
                </Link>
              </li>
              <li>
                <Link href="/builds" className="text-custom-beige block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-amber-500 md:p-0 md:dark:hover:text-amber-500 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                  Builds
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;