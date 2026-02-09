import { Activity, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Database } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin', label: 'Update Data', icon: Settings },
  { to: '/records', label: 'Records', icon: Database },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm text-foreground">Smart City Dashboard</span>
        </div>
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-foreground">
            {location.pathname === '/' && 'Dashboard Overview'}
            {location.pathname === '/admin' && 'Update Sensor Data'}
            {location.pathname === '/records' && 'Data Records'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-md hover:bg-muted"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-border space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default Header;
