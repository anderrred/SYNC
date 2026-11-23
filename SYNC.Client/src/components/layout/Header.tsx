import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';

  const roleNames: Record<string, string> = {
    Admin: 'Administrator',
    Coordinator: 'Koordynator',
    Worker: 'Pracownik',
    Leader: 'Lider',
  };

  return (
    <header className="flex min-h-[76px] items-center justify-end border-b border-slate-700 bg-slate-900 px-4 sm:px-8">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Dane użytkownika */}
        <div className="text-right">
          <p className="font-semibold text-blue-400">
            {firstName} {lastName}
          </p>
          <p className="text-xs text-slate-400">
            {roleNames[user?.role ?? ''] ?? user?.role}
          </p>
        </div>

        {/* Wylogowanie */}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-400"
        >
          Wyloguj
        </button>
      </div>
    </header>
  );
}