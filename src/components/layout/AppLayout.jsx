import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ShieldAlert } from 'lucide-react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Standard Healthcare Disclaimer Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-600">
          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Pemberitahuan Resmi:</span>
          </div>
          <p>
            SPK Balita Sehat merupakan sistem pendukung keputusan pemantauan perkembangan balita dengan integrasi AHP & SAW.
            Bukan pengganti diagnosis dokter atau tenaga kesehatan berwenang.
          </p>
        </div>
        <p className="mt-2 text-slate-400">
          © {new Date().getFullYear()} SPK Balita Sehat. Seluruh hak cipta dilindungi.
        </p>
      </footer>
    </div>
  );
}
