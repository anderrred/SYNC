import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/user';

const ALL_ROLES: UserRole[] = ['Worker', 'Coordinator', 'Admin', 'Leader'];
const STAFF_ROLES: UserRole[] = ['Coordinator', 'Admin'];

export default function Sidebar() {
  const { user } = useAuth();

  const links: { label: string; path: string; roles: UserRole[] }[] = [
    {
      label: 'Dashboard',
      path: '/',
      roles: ALL_ROLES,
    },
    {
      label: 'Zmiany',
      path: '/shifts',
      roles: ALL_ROLES,
    },
    {
      label: 'Mój profil',
      path: '/profile',
      roles: ALL_ROLES,
    },
    {
      label: 'Pracownicy',
      path: '/employees',
      roles: STAFF_ROLES,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold text-blue-400 mb-10">
        SYNC
      </h1>

      <nav className="flex flex-col gap-2">
        {links
          .filter((link) => user && link.roles.includes(user.role))
          .map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}