import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
