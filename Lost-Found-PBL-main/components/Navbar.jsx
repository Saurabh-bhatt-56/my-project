"use client";

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { userContext } from '@/provider/userProvider';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticate, checkAuth } = useContext(userContext);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost-items' },
    { name: 'Found Items', href: '/found-items' },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        await checkAuth();
        window.location.href = '/auth/login';
      } else {
        alert(data.message || "Failed to log out");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
                Lost <span className="text-gray-900 dark:text-white">&</span> Found
              </Link>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.href)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {isAuthenticate ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="cursor-pointer flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 px-3 py-1.5 rounded-xl transition-all duration-200 focus:outline-none"
                >
                  {user?.avatar && user.avatar.length > 1 ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover shadow-sm" />
                  ) : (
                    <span className="w-7 h-7 p-[3px_0px_0px_0px] rounded-full bg-blue-600 text-white flex cursor-pointer items-center align-center justify-center font-bold text-sm uppercase shadow-sm">
                      {user?.avatar || user?.name?.[0] || 'U'}
                    </span>
                  )}
                  <span className="text-sm font-semibold cursor-pointer text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {user?.name?.trim().split(" ")[0] || 'User'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-900/50">
                        <span className="text-xs text-gray-400 dark:text-gray-505">Signed in as : {" "}</span>
                        <span className="text-sm font-semibold text-gray-850 dark:text-gray-200 truncate">{user?.name || 'User'}</span>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <svg className="w-4 h-4 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>

                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <svg className="w-4 h-4 mr-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                        Dashboard
                      </Link>

                      <div className="border-t border-gray-50 dark:border-gray-900/50 my-1" />

                      <button
                        onClick={() => { setIsDropdownOpen(!isDropdownOpen); handleLogout(); }}
                        className="cursor-pointer flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 mr-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-blue-500/20"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] border-b border-gray-100 dark:border-gray-800' : 'max-h-0'
          }`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1 px-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${isActive(link.href)
                ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col space-y-3 px-4">
            {isAuthenticate ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                  {user?.avatar && user.avatar.length > 1 ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                      {user?.avatar || user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-gray-800 dark:text-white">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-505 text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="text-center bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 block px-3 py-2.5 rounded-xl text-base font-medium transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-center text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 block px-3 py-2.5 rounded-xl text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-center bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500 block px-3 py-2.5 rounded-xl text-base font-medium transition-colors shadow-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;