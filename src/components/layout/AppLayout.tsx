import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="app-container">
      <main className="safe-bottom min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
