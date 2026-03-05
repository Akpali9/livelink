import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { router } from './router';
export default function App() {
  return<React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>;
}
