import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      <h2 className="font-semibold text-slate-800">
        System zarządzania zmianami
      </h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"
        >
          Wyloguj
        </button>
      </div>
    </header>
  );
}