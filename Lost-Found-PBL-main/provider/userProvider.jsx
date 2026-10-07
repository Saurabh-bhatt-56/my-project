'use client';

import React, { createContext, useEffect, useState } from 'react';

export const userContext = createContext();

function UserProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const [isAuthenticate, setIsAuthenticate] = useState(!!initialUser);

  useEffect(() => {
    if (!initialUser) {
      checkAuth();
    }
  }, [initialUser]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/isAuth");
      if (!res.ok) {
        setUser(null);
        setIsAuthenticate(false);
        return;
      }
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticate(true);
      } else {
        setUser(null);
        setIsAuthenticate(false);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setIsAuthenticate(false);
    }
  }

  return (
    <userContext.Provider value={{ user, isAuthenticate, checkAuth }}>
      {children}
    </userContext.Provider>
  );
}

export default UserProvider;