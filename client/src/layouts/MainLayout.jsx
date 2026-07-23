import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Leaf, Menu, X, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getNotifications, markAllNotificationsAsRead } from '../features/notifications/notificationApi';

const PRIMARY_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Species', href: '/species' },
  { label: 'Map', href: '/map' },
  { label: 'Analytics', href: '/analytics' },
];

const REPORT_ITEMS = [
  { label: 'Report Tip', href: '/tips/submit' },
  { label: 'Report HWC', href: '/hwc/report' },
  { label: 'Rescue', href: '/rescue' },
];

function MainLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { scrollY } = useScroll();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const updateScroll = () => setScrolled(scrollY.get() > 20);
    scrollY.on('change', updateScroll);
    return () => scrollY.clearListeners();
  }, [scrollY]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const result = await getNotifications({ limit: 5 });
      setNotifications(result.data.data.notifications || []);
      setUnreadCount(result.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  return (
    <div className="min-h-screen bg-canopy-sand-50 text-canopy-ink-900">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-canopy-sand-50/85 backdrop-blur-md shadow-ambient border-b border-canopy-mist-200'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <Leaf className="w-7 h-7 text-canopy-forest-600 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-display text-2xl font-semibold text-canopy-forest-950 tracking-tight">Canopy</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'text-canopy-forest-600'
                      : 'text-canopy-ink-900/70 hover:text-canopy-forest-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-canopy-ink-900/70 hover:text-canopy-forest-600 transition-colors">
                  Report
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white border border-canopy-mist-200 rounded-2xl shadow-ambient-lg p-2">
                    {REPORT_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-canopy-ink-900/80 hover:bg-canopy-sand-100 rounded-xl transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-full text-canopy-ink-900/70 hover:text-canopy-forest-600 hover:bg-canopy-sand-100 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-canopy-clay-500 rounded-full border-2 border-canopy-sand-50" />
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-canopy-mist-200 rounded-2xl shadow-ambient-lg z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-canopy-mist-200">
                        <h3 className="font-display font-semibold text-canopy-forest-950">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-canopy-forest-600 hover:text-canopy-forest-800">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-canopy-ink-900/60 text-center">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`px-4 py-3 border-b border-canopy-mist-200 last:border-b-0 ${
                                !n.readAt ? 'bg-canopy-sand-100/60' : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-canopy-forest-950">{n.title}</p>
                              <p className="text-xs text-canopy-ink-900/70 mt-1">{n.message}</p>
                              <p className="text-xs text-canopy-ink-900/50 mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Link to="/tips/submit" className="btn-clay text-sm">
                Report an Incident
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -mr-2 text-canopy-ink-900"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="lg:hidden bg-canopy-sand-50/95 backdrop-blur-md border-b border-canopy-mist-200"
          >
            <div className="px-4 py-4 space-y-1">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-canopy-sand-100 text-canopy-forest-600'
                      : 'text-canopy-ink-900/80 hover:bg-canopy-sand-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-canopy-mist-200 mt-2">
                <p className="px-4 text-xs font-semibold text-canopy-ink-900/50 uppercase tracking-wider mb-2">Report</p>
                {REPORT_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-canopy-ink-900/80 hover:bg-canopy-sand-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      <main className="flex-grow pt-16 lg:pt-20">
        <Outlet />
      </main>

      <footer className="bg-canopy-forest-950 text-canopy-moss-300 py-16 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-canopy-moss-300" />
                <span className="font-display text-xl font-semibold text-white">Canopy</span>
              </Link>
              <p className="text-sm text-canopy-moss-300/80 max-w-sm leading-relaxed">
                A unified platform for wildlife conservation — species monitoring, citizen science, anti-poaching intelligence, and predictive analytics.
              </p>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/species" className="text-canopy-moss-300/80 hover:text-white transition-colors">Species Catalog</Link></li>
                <li><Link to="/sightings" className="text-canopy-moss-300/80 hover:text-white transition-colors">Sightings</Link></li>
                <li><Link to="/map" className="text-canopy-moss-300/80 hover:text-white transition-colors">Interactive Map</Link></li>
                <li><Link to="/analytics" className="text-canopy-moss-300/80 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-4">Report</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/tips/submit" className="text-canopy-moss-300/80 hover:text-white transition-colors">Anti-Poaching Tip</Link></li>
                <li><Link to="/hwc/report" className="text-canopy-moss-300/80 hover:text-white transition-colors">Human-Wildlife Conflict</Link></li>
                <li><Link to="/rescue" className="text-canopy-moss-300/80 hover:text-white transition-colors">Rescue & Rehabilitation</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-canopy-forest-800 mt-12 pt-8 text-sm text-canopy-moss-300/60">
            <p>© {new Date().getFullYear()} Canopy — Wildlife Conservation Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
