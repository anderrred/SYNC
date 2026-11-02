import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const links = [
    {
      label: 'Dashboard',
      path: '/',
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      label: 'Zmiany',
      path: '/shifts',
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      label: 'Mój profil',
      path: '/profile',
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      label: 'Pracownicy',
      path: '/employees',
      roles: ['Admin', 'Manager'],
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