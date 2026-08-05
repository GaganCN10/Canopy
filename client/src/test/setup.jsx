import '@testing-library/jest-dom';

import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    post: vi.fn(),
  },
}));

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: { _getIconUrl: () => {} },
        mergeOptions: vi.fn(),
      },
    },
  },
  Icon: {
    Default: {
      prototype: { _getIconUrl: () => {} },
      mergeOptions: vi.fn(),
    },
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...rest } = props || {};
      return <div {...rest}>{children}</div>;
    },
    p: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...rest } = props || {};
      return <p {...rest}>{children}</p>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
  };
};

global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

localStorage.setItem('accessToken', 'test-access-token');
localStorage.setItem('refreshToken', 'test-refresh-token');
