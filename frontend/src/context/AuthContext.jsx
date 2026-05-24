import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser as setReduxUser, logout as reduxLogout } from '../features/auth/authSlice';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = user ? user.token : null;
  const isAuthenticated = !!user;

  // Restore session from localStorage on initial render
  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr && !user) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser && storedUser.token) {
          dispatch(setReduxUser(storedUser));
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [dispatch, user]);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch(setReduxUser(userData));
  };

  const logout = () => {
    localStorage.removeItem('user');
    dispatch(reduxLogout());
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
