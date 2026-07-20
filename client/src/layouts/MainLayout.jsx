import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-canopy-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Canopy</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/species" className="hover:underline">Species</Link>
            <Link to="/sightings" className="hover:underline">Sightings</Link>
            <Link to="/map" className="hover:underline">Map</Link>
            <Link to="/tips/submit" className="hover:underline">Report Tip</Link>
            <Link to="/hwc/report" className="hover:underline">Report HWC</Link>
            <Link to="/rescue" className="hover:underline">Rescue</Link>
            <Link to="/analytics" className="hover:underline">Analytics</Link>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-slate-800 text-white p-4 text-center">
        <p>© {new Date().getFullYear()} Canopy — Wildlife Conservation Platform</p>
      </footer>
    </div>
  );
}

export default MainLayout;
