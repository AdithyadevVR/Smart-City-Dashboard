import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Database, Activity } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin', label: 'Update Data', icon: Settings },
  { to: '/records', label: 'Records', icon: Database },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-56 flex-col bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-sidebar-primary" />
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">Smart City</h1>
            <p className="text-xs text-sidebar-foreground/60">Dashboard v1.0</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40">© 2025 Smart City Project</p>
      </div>
    </aside>
  );
};

export default Sidebar;
