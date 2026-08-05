import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { ToastProvider } from '../components/Toast';

function createTestStore(preloadedState = {}) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: preloadedState.user || null,
        token: preloadedState.token || null,
        refreshToken: preloadedState.refreshToken || null,
        isAuthenticated: preloadedState.isAuthenticated || false,
        loading: false,
        error: null,
      },
      ...preloadedState,
    },
  });
  return store;
}

export function renderWithProviders(ui, { store = createTestStore(), ...options } = {}) {
  const Wrapper = ({ children }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ToastProvider>
            {children}
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    );
  };
  return { ...render(ui, { wrapper: Wrapper, ...options }), store };
}
