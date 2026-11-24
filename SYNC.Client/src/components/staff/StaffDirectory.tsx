import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Eye, Pencil, Search, Trash2, Upload, UserPlus, Users, X } from 'lucide-react';
import {
  createStaff,
  deleteStaff,
  getStaff,
  importStaff,
  updateStaff,
  type StaffMember,
} from '../../api/employees';

const MONTHS = [
  { value: '01', label: 'Styczeń' },
  { value: '02', label: 'Luty' },
  { value: '03', label: 'Marzec' },
  { value: '04', label: 'Kwiecień' },
  { value: '05', label: 'Maj' },
  { value: '06', label: 'Czerwiec' },
  { value: '07', label: 'Lipiec' },
  { value: '08', label: 'Sierpień' },
  { value: '09', label: 'Wrzesień' },
  { value: '10', label: 'Październik' },
  { value: '11', label: 'Listopad' },
  { value: '12', label: 'Grudzień' },
];

interface StaffDirectoryProps {
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  showHeader?: boolean;
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50';

export default function StaffDirectory({
  month,
  year,
  onMonthChange,
  onYearChange,
  showHeader = true,
}: StaffDirectoryProps) {
  const [employees, setEmployees] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [importing, setImporting] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getStaff(Number(month), Number(year));
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Nie udało się pobrać listy pracowników.'
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      `${employee.fullName} ${employee.email} ${employee.phoneNumber}`
        .toLowerCase()
        .includes(query)
    );
  }, [employees, search]);

  function openAddForm() {
    setEditing(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setError('');
    setShowForm(true);
  }

  function openEditForm(employee: StaffMember) {
    setEditing(employee);
    setFullName(employee.fullName);
    setEmail(employee.email);
    setPhone(employee.phoneNumber);
    setPassword('');
    setError('');
    setShowForm(true);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const result = editing
        ? await updateStaff(editing.id, { fullName, email, phoneNumber: phone })
        : await createStaff({ fullName, email, phoneNumber: phone, password });

      setMessage(result);
      setShowForm(false);
      await loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać pracownika.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee: StaffMember) {
    if (!window.confirm(`Czy na pewno usunąć konto ${employee.fullName}?`)) return;

    setError('');
    try {
      const result = await deleteStaff(employee.id);
      setMessage(result);
      await loadStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć pracownika.');
    }
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;

    setImporting(true);
    setError('');
    setMessage('');

    try {
      const result = await importStaff(file);
      const details =
        result.errors.length > 0 ? ` ${result.errors.slice(0, 5).join(' ')}` : '';
      setMessage(
        `Import zakończony: dodano ${result.successful}, błędów ${result.failed}.${details}`
      );
      if (result.successful > 0) {
        await loadStaff();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zaimportować pliku.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="space-y-5">
      {showHeader && (
        <header>
          <h1 className="text-3xl font-bold text-slate-800">Baza pracowników</h1>
          <p className="mt-2 text-slate-500">Zarządzanie pracownikami fabryki.</p>
        </header>
      )}

      {!showHeader && (
        <div>
          <h2 className="text-2xl font-bold">Baza pracowników</h2>
          <p className="mt-1 text-slate-500">Zarządzanie pracownikami fabryki</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
        >
          <UserPlus size={18} /> Dodaj pracownika
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Upload size={18} strokeWidth={1.8} />
          {importing ? 'Importowanie...' : 'Import z Excela'}
          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            disabled={importing}
            onChange={(event) => {
              const file = event.target.files?.[0];
              void handleImport(file);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {message && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-700">
          {message}
        </div>
      )}

      {error && !showForm && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-end">
          <div className="flex items-center gap-3 lg:border-r lg:border-slate-200 lg:pr-5">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Users size={20} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Liczba pracowników</p>
              <p className="mt-1 text-3xl font-bold leading-none tracking-tight">{employees.length}</p>
            </div>
          </div>

          <div className="min-w-0">
            <label htmlFor="staff-search" className="mb-2 block text-sm font-medium text-slate-600">
              Wyszukaj pracownika
            </label>
            <div className="relative">
              <Search
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="staff-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Imię, nazwisko, e-mail lub telefon..."
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <div>
              <label htmlFor="staff-month" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <CalendarDays size={15} strokeWidth={1.8} className="text-slate-400" />
                Miesiąc zmian
              </label>
              <select
                id="staff-month"
                value={month}
                onChange={(event) => onMonthChange(event.target.value)}
                title="Miesiąc, dla którego liczona jest kolumna „Zmiany w miesiącu”"
                className="w-full min-w-[10.5rem] rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                {MONTHS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="staff-year" className="mb-2 block text-sm font-medium text-slate-600">
                Rok
              </label>
              <select
                id="staff-year"
                value={year}
                onChange={(event) => onYearChange(event.target.value)}
                title="Rok, dla którego liczona jest kolumna „Zmiany w miesiącu”"
                className="w-full min-w-[7rem] rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-600">Pracownik</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Kontakt</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Zmiany w miesiącu</th>
                <th className="px-5 py-4 font-semibold text-slate-600">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t border-slate-100 transition hover:bg-blue-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {initials(employee.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold">{employee.fullName}</p>
                          <p className="text-sm text-slate-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{employee.phoneNumber}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                        {employee.shiftsThisMonth}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/employees/${employee.id}?month=${month}&year=${year}`}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-medium text-blue-700 transition hover:bg-blue-50"
                        >
                          <Eye size={15} /> Profil
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditForm(employee)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil size={15} /> Edytuj
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(employee)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} /> Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-8 text-center text-slate-500">Ładowanie pracowników...</div>
        )}

        {!loading && filteredEmployees.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Nie znaleziono pracowników.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editing ? 'Edytuj pracownika' : 'Dodaj pracownika'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block font-medium">Imię i nazwisko</label>
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className={inputClass}
                  placeholder="Anna Kowalska"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">E-mail</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  placeholder="anna@sync.pl"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">Telefon</label>
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                  placeholder="Numer telefonu"
                />
              </div>
              {!editing && (
                <div>
                  <label className="mb-1 block font-medium">Hasło tymczasowe</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                    placeholder="Minimum 8 znaków"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50/70"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
