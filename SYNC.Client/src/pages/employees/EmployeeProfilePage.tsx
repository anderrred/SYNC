import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { deleteStaff, getStaffMember, type StaffMember } from '../../api/employees';

function padMonth(value: number) {
  return String(value).padStart(2, '0');
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const now = new Date();
  const month = Number(searchParams.get('month') ?? padMonth(now.getMonth() + 1));
  const year = Number(searchParams.get('year') ?? now.getFullYear());

  const [employee, setEmployee] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const workerId = Number(id);
    if (!Number.isInteger(workerId) || workerId <= 0) {
      setError('Nieprawidłowy identyfikator pracownika.');
      setLoading(false);
      return;
    }

    getStaffMember(workerId, month, year)
      .then(setEmployee)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : 'Nie udało się pobrać profilu pracownika.'
        );
      })
      .finally(() => setLoading(false));
  }, [id, month, year]);

  async function handleDelete() {
    if (!employee) return;
    if (!window.confirm(`Czy na pewno usunąć konto ${employee.fullName}?`)) return;

    try {
      await deleteStaff(employee.id);
      navigate('/employees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć pracownika.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/employees"
        className="inline-flex font-medium text-blue-700 hover:text-blue-800"
      >
        ← Wróć do bazy pracowników
      </Link>

      {loading && (
        <div className="rounded-3xl border border-white/80 bg-white p-8 text-slate-500 shadow-sm">
          Ładowanie profilu...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {!loading && employee && (
        <section className="rounded-3xl border border-white/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4 rounded-xl bg-slate-50/70 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {initials(employee.fullName)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{employee.fullName}</h1>
              <p className="text-slate-500">Profil pracownika</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">E-mail</p>
              <p className="font-semibold">{employee.email || 'Brak'}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Telefon</p>
              <p className="font-semibold">{employee.phoneNumber || 'Brak'}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-sm text-slate-500">Zmiany w wybranym miesiącu</p>
              <p className="text-2xl font-bold text-blue-600">{employee.shiftsThisMonth}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Usuń konto
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
