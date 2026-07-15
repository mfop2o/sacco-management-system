import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const { pathname } = useLocation();
  const isDashboard = pathname === '/';

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950">
      <Sidebar />
      {/* On mobile: no left margin. On desktop: ml-64 to clear sidebar */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {!isDashboard && <Navbar />}
        <main className={`flex-1 ${isDashboard ? 'p-0' : 'p-4 sm:p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
