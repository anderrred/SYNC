import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev);
  }

  return (
    <div className="flex min-h-screen bg-blue-180
    ">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 w-full flex-1 overflow-y-scroll p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}