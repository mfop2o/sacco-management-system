import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSidebar } from '../contexts/SidebarContext';

export default function Layout() {
  const { pathname } = useLocation();
  const isDashboard = pathname === '/';
  const { collapsed } = useSidebar();

  return (
    <div className="h-screen bg-bg dark:bg-slate-950 flex overflow-hidden">
      <Sidebar />
      {/* Main content — fixed height, scrolls independently */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        {!isDashboard && <Navbar />}
        <main className={`flex-1 min-h-0 overflow-y-auto ${isDashboard ? 'p-0' : 'p-3 sm:p-5'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
