
import { NavLink } from 'react-router-dom';
import {
  House,
  CalendarDays,
  UserRound,
  LayoutDashboard,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/user';

const ALL_ROLES: UserRole[] = ['Worker', 'Admin', 'Leader'];
const STAFF_ROLES: UserRole[] = ['Admin'];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const links = [
  {
    label: 'Panel główny',
    path: '/',
    roles: ALL_ROLES,
    icon: House,
  },
  {
    label: 'Zmiany',
    path: '/shifts',
    roles: ALL_ROLES,
    icon: CalendarDays,
  },
  {
    label: 'Mój profil',
    path: '/profile',
    roles: ALL_ROLES,
    icon: UserRound,
  },
  {
    label: 'Centrum koordynatora',
    path: '/command-center',
    roles: STAFF_ROLES,
    icon: LayoutDashboard,
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside
      className={`min-h-screen shrink-0 bg-slate-900 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-3">
        {/* Logo – kliknięcie zwija lub rozwija panel */}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Rozwiń panel' : 'Zwiń panel'}
          className={`mb-8 flex h-14 w-full items-center rounded-xl px-3 text-2xl font-bold text-blue-400 transition-colors hover:bg-slate-800 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <span>SYNC</span>
        </button>

        {/* Nawigacja */}
        <nav className="flex flex-col gap-2">
          {links
            .filter((link) => user && link.roles.includes(user.role))
            .map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  title={collapsed ? link.label : undefined}
                  className={({ isActive }) =>
                    `group flex min-h-12 cursor-pointer items-center rounded-xl transition-all duration-200 ${
                      collapsed
                        ? 'justify-center px-2'
                        : 'gap-3 px-4'
                    } ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span className="whitespace-nowrap text-sm font-medium">
                      {link.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </nav>
      </div>
    </aside>
  );
}
