import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Users,
  Wallet,
  LayoutGrid,
  List,
  UserPlus,
  Plus,
  Clock3,
  Upload,
  Pencil,
  Eye,
  X,
  Trash2
} from 'lucide-react';
import {
  assignWorker,
  createShiftPool,
  deleteShift,
  getAllShifts,
  getWorkersForAssignment,
  removeWorkerFromShift,
  type ShiftPool,
  type WorkerOption,
} from '../api/shifts';

type Tab = 'changes' | 'workers' | 'settlements';
type ViewMode = 'grid' | 'list';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  shiftsThisMonth: number;
}

const DEPARTMENTS = [
  'Produkcja',
  'Magazyn',
  'Pakowanie',
  'Kontrola jakości',
  'Utrzymanie ruchu',
];

const SHIFT_TEMPLATES = [
  { id: 'morning', name: 'Zmiana poranna', startTime: '06:00', endTime: '14:00' },
  { id: 'afternoon', name: 'Zmiana popołudniowa', startTime: '14:00', endTime: '22:00' },
  { id: 'night', name: 'Zmiana nocna', startTime: '22:00', endTime: '06:00' },
];

const initialEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'Sofiia',
    lastName: 'Kovalova',
    phone: '798481404',
    department: 'Produkcja',
    shiftsThisMonth: 6,
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Nowak',
    phone: '600123456',
    department: 'Magazyn',
    shiftsThisMonth: 8,
  },
  {
    id: '3',
    firstName: 'Jan',
    lastName: 'Kowalski',
    phone: '600987654',
    department: 'Pakowanie',
    shiftsThisMonth: 4,
  },
  {
    id: '4',
    firstName: 'Maria',
    lastName: 'Wiśniewska',
    phone: '601234567',
    department: 'Produkcja',
    shiftsThisMonth: 10,
  },
];

function padMonth(value: number) {
  return String(value).padStart(2, '0');
}

function formatShiftDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatShiftTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isInSelectedMonth(iso: string, month: string, year: string) {
  const date = new Date(iso);
  return (
    !Number.isNaN(date.getTime()) &&
    padMonth(date.getMonth() + 1) === month &&
    String(date.getFullYear()) === year
  );
}

function toLocalDateValue(date: Date) {
  return `${date.getFullYear()}-${padMonth(date.getMonth() + 1)}-${padMonth(date.getDate())}`;
}

function combineLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function buildShiftRange(date: string, startTime: string, endTime: string) {
  const start = combineLocalDateTime(date, startTime);
  let end = combineLocalDateTime(date, endTime);

  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  return { start, end };
}

export default function Coordinator() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<Tab>('changes');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [month, setMonth] = useState(padMonth(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const [shifts, setShifts] = useState<ShiftPool[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [shiftsError, setShiftsError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const [showPoolForm, setShowPoolForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftPool | null>(null);
  const [busyShiftId, setBusyShiftId] = useState<number | null>(null);

  const [poolDate, setPoolDate] = useState(toLocalDateValue(now));
  const [poolTemplate, setPoolTemplate] = useState(SHIFT_TEMPLATES[1].id);
  const [poolStartTime, setPoolStartTime] = useState(SHIFT_TEMPLATES[1].startTime);
  const [poolEndTime, setPoolEndTime] = useState(SHIFT_TEMPLATES[1].endTime);
  const [poolDepartment, setPoolDepartment] = useState(DEPARTMENTS[0]);
  const [poolSpots, setPoolSpots] = useState(3);
  const [savingPool, setSavingPool] = useState(false);

  const [assignShiftId, setAssignShiftId] = useState('');
  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Produkcja');

  const [importMessage, setImportMessage] = useState('');

  const months = [
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

  const loadShifts = useCallback(async () => {
    setShiftsLoading(true);
    setShiftsError('');

    try {
      const data = await getAllShifts();
      setShifts(data);
    } catch (error) {
      setShiftsError(
        error instanceof Error
          ? error.message
          : 'Nie udało się pobrać grafiku zmian.'
      );
    } finally {
      setShiftsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShifts();
  }, [loadShifts]);

  const filteredShifts = useMemo(
    () =>
      shifts
        .filter((shift) => isInSelectedMonth(shift.startTime, month, year))
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
    [shifts, month, year]
  );

  function applyTemplate(templateId: string) {
    const template = SHIFT_TEMPLATES.find((item) => item.id === templateId);
    setPoolTemplate(templateId);
    if (!template) return;
    setPoolStartTime(template.startTime);
    setPoolEndTime(template.endTime);
  }

  function openPoolForm() {
    setActionError('');
    setPoolDate(toLocalDateValue(new Date()));
    applyTemplate(SHIFT_TEMPLATES[1].id);
    setPoolDepartment(DEPARTMENTS[0]);
    setPoolSpots(3);
    setShowPoolForm(true);
  }

  async function openAssignForm(shiftId?: number) {
    setActionError('');
    setAssignShiftId(shiftId ? String(shiftId) : '');
    setAssignWorkerId('');
    setShowAssignForm(true);
    setWorkersLoading(true);

    try {
      const data = await getWorkersForAssignment();
      setWorkers(data);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Nie udało się pobrać listy pracowników.'
      );
    } finally {
      setWorkersLoading(false);
    }
  }

  async function handleCreatePool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPool(true);
    setActionError('');

    try {
      const { start, end } = buildShiftRange(poolDate, poolStartTime, poolEndTime);
      const message = await createShiftPool({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        description: poolDepartment,
        spots: Number(poolSpots),
      });
      setActionMessage(message);
      setShowPoolForm(false);
      await loadShifts();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Nie udało się utworzyć puli zmian.'
      );
    } finally {
      setSavingPool(false);
    }
  }

  async function handleAssignWorker(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignShiftId || !assignWorkerId) return;

    setAssigning(true);
    setActionError('');

    try {
      const shiftId = Number(assignShiftId);
      const message = await assignWorker(shiftId, Number(assignWorkerId));
      setActionMessage(message);
      setShowAssignForm(false);
      const refreshed = await getAllShifts();
      setShifts(refreshed);
      const updated = refreshed.find((shift) => shift.shiftId === shiftId);
      if (updated) setSelectedShift(updated);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Nie udało się przypisać pracownika.'
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleDeleteShift(shiftId: number) {
    if (!window.confirm('Czy na pewno usunąć tę zmianę?')) return;

    setBusyShiftId(shiftId);
    setActionError('');

    try {
      const message = await deleteShift(shiftId);
      setActionMessage(message);
      setSelectedShift((current) =>
        current?.shiftId === shiftId ? null : current
      );
      await loadShifts();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Nie udało się usunąć zmiany.'
      );
    } finally {
      setBusyShiftId(null);
    }
  }

  async function handleRemoveWorker(shiftId: number, workerId: number) {
    setBusyShiftId(shiftId);
    setActionError('');

    try {
      const message = await removeWorkerFromShift(shiftId, workerId);
      setActionMessage(message);
      const refreshed = await getAllShifts();
      setShifts(refreshed);
      const updated = refreshed.find((shift) => shift.shiftId === shiftId);
      setSelectedShift(updated ?? null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Nie udało się usunąć pracownika ze zmiany.'
      );
    } finally {
      setBusyShiftId(null);
    }
  }

  function openAddForm() {
    setEditingEmployee(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setDepartment('Produkcja');
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingEmployee(employee);
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setPhone(employee.phone);
    setDepartment(employee.department);
    setShowForm(true);
  }

  function handleSaveEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                firstName,
                lastName,
                phone,
                department,
              }
            : employee
        )
      );
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        firstName,
        lastName,
        phone,
        department,
        shiftsThisMonth: 0,
      };

      setEmployees((previous) => [...previous, newEmployee]);
    }

    setShowForm(false);
  }

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`;

    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone.includes(search) ||
      employee.department.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
      <div className="min-h-screen w-full bg-transparent text-slate-800">
      <div className="w-full space-y-6">

        {/* Nagłówek */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Centrum koordynatora
          </h1>
        </header>

        {/* Przyciski */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void openAssignForm()}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <UserPlus size={18} strokeWidth={1.8} />
            Przypisz ręcznie
          </button>

          <button
            type="button"
            onClick={openPoolForm}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
          >
            <Plus size={18} strokeWidth={2} />
            Nowa pula
          </button>
        </div>

        {(actionMessage || actionError) && (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              actionError
                ? 'border-red-100 bg-red-50 text-red-700'
                : 'border-blue-100 bg-blue-50 text-blue-700'
            }`}
          >
            {actionError || actionMessage}
          </div>
        )}

        {/* Panel zakładek */}
        <section className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-5">

            <button
              type="button"
              onClick={() => setActiveTab('changes')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                activeTab === 'changes'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-700'
              }`}
            >
              <CalendarDays size={18} strokeWidth={1.8} />
              Zmiany
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workers')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                activeTab === 'workers'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-700'
              }`}
            >
              <Users size={18} strokeWidth={1.8} />
              Pracownicy
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settlements')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition-all ${
                activeTab === 'settlements'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-700'
              }`}
            >
              <Wallet size={18} strokeWidth={1.8} />
              Rozliczenia
            </button>
          </div>

          {/* Filtry zakładki Zmiany */}
          {activeTab === 'changes' && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

              <div className="flex rounded-xl bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg px-3 py-2.5 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-700'
                  }`}
                  title="Widok kafelkowy"
                >
                  <LayoutGrid size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg px-3 py-2.5 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-700'
                  }`}
                  title="Widok listy"
                >
                  <List size={18} />
                </button>
              </div>

              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3"
              >
                {months.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          )}
        </section>

        {/* ZAKŁADKA ZMIANY */}
        {activeTab === 'changes' && (
          <section
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-5'
                : 'flex flex-col gap-3'
            }
          >
            {shiftsLoading && (
              <div className="rounded-3xl border border-white/80 bg-white p-8 text-center shadow-sm">
                <p className="text-slate-500">Ładowanie grafiku zmian...</p>
              </div>
            )}

            {!shiftsLoading && shiftsError && (
              <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <p className="text-red-600">{shiftsError}</p>
              </div>
            )}

            {!shiftsLoading &&
              !shiftsError &&
              filteredShifts.map((shift) => (
              <article
                key={shift.shiftId}
                className="relative cursor-pointer rounded-3xl border border-white/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setSelectedShift(shift)}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDeleteShift(shift.shiftId);
                  }}
                  disabled={busyShiftId === shift.shiftId}
                  className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  title="Usuń zmianę"
                  aria-label={`Usuń zmianę ${formatShiftDate(shift.startTime)}`}
                >
                  <Trash2 size={20} strokeWidth={1.8} />
                </button>

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <CalendarDays size={17} strokeWidth={1.8} />
                  {formatShiftDate(shift.startTime)}
                </div>

                <div className="mt-3 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                  <Clock3 size={23} className="text-slate-400" strokeWidth={1.8} />
                  {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500">
                    {shift.description || 'Bez działu'}
                  </span>

                  <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-bold text-blue-700">
                    {shift.assignedWorkers.length} / {shift.requiredWorkers}
                  </span>
                </div>
              </article>
            ))}

            {!shiftsLoading && !shiftsError && filteredShifts.length === 0 && (
              <div className="rounded-3xl border border-white/80 bg-white p-8 text-center shadow-sm">
                <p className="text-slate-500">
                  Brak zmian do wyświetlenia.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ZAKŁADKA PRACOWNICY */}
        {activeTab === 'workers' && (
          <section className="space-y-5">

            {/* Nagłówek bazy */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Baza pracowników
                </h2>
                <p className="mt-1 text-slate-500">
                  Zarządzanie pracownikami fabryki
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openAddForm}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
                >
                  <UserPlus size={18} /> Dodaj pracownika
                </button>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <Upload size={18} strokeWidth={1.8} /> Import z Excela
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        setImportMessage(
                          `Wybrano plik: ${file.name}. Import zostanie podłączony w kolejnym etapie.`
                        );
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Informacja o imporcie */}
            {importMessage && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-700">
                {importMessage}
              </div>
            )}

            {/* Liczba pracowników */}
            <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-sm text-slate-500">
                Liczba pracowników
              </p>
              <p className="mt-1 text-3xl font-bold">
                {employees.length}
              </p>
            </div>

            {/* Wyszukiwanie */}
            <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
              <label
                htmlFor="employee-search"
                className="mb-2 block font-medium"
              >
                Wyszukaj pracownika
              </label>

              <input
                id="employee-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Imię, nazwisko, telefon lub dział..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70/60 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* Tabela pracowników */}
            <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] border-collapse text-left">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Pracownik
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Kontakt
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Dział
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Zmiany w miesiącu
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Akcje
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-t border-slate-100 transition hover:bg-blue-50/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </div>

                            <p className="font-semibold">
                              {employee.firstName} {employee.lastName}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {employee.phone}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-sm font-medium">
                            {employee.department}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
                            {employee.shiftsThisMonth}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedEmployee(employee)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-blue-700 transition hover:bg-blue-50"
                            >
                              <Eye size={15} /> Profil
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditForm(employee)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Pencil size={15} /> Edytuj
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEmployees.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Nie znaleziono pracowników.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ZAKŁADKA ROZLICZENIA - NA RAZIE PUSTA */}
        {activeTab === 'settlements' && <section />}
      </div>

      {/* FORMULARZ NOWEJ PULI */}
      {showPoolForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nowa pula zmian</h2>
              <button
                type="button"
                onClick={() => setShowPoolForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div>
                <label className="mb-1 block font-medium">Data</label>
                <input
                  type="date"
                  required
                  value={poolDate}
                  onChange={(event) => setPoolDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">Szablon zmiany</label>
                <select
                  value={poolTemplate}
                  onChange={(event) => applyTemplate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  {SHIFT_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.startTime}–{template.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium">Od</label>
                  <input
                    type="time"
                    required
                    value={poolStartTime}
                    onChange={(event) => setPoolStartTime(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium">Do</label>
                  <input
                    type="time"
                    required
                    value={poolEndTime}
                    onChange={(event) => setPoolEndTime(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium">Dział</label>
                <select
                  value={poolDepartment}
                  onChange={(event) => setPoolDepartment(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  {DEPARTMENTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">Liczba miejsc</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={poolSpots}
                  onChange={(event) => setPoolSpots(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPoolForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50/70"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={savingPool}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md disabled:opacity-50"
                >
                  {savingPool ? 'Zapisywanie...' : 'Utwórz pulę'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMULARZ PRZYPISANIA */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Przypisz pracownika</h2>
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignWorker} className="space-y-4">
              <div>
                <label className="mb-1 block font-medium">Zmiana</label>
                <select
                  required
                  value={assignShiftId}
                  onChange={(event) => setAssignShiftId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">Wybierz zmianę</option>
                  {filteredShifts.map((shift) => (
                    <option key={shift.shiftId} value={shift.shiftId}>
                      {formatShiftDate(shift.startTime)} {formatShiftTime(shift.startTime)}–
                      {formatShiftTime(shift.endTime)} ({shift.description || 'Bez działu'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">Pracownik</label>
                <select
                  required
                  value={assignWorkerId}
                  onChange={(event) => setAssignWorkerId(event.target.value)}
                  disabled={workersLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
                >
                  <option value="">
                    {workersLoading ? 'Ładowanie...' : 'Wybierz pracownika'}
                  </option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50/70"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={assigning || workersLoading}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md disabled:opacity-50"
                >
                  {assigning ? 'Przypisywanie...' : 'Przypisz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SZCZEGÓŁY ZMIANY */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Szczegóły zmiany</h2>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-sm text-slate-500">Termin</p>
                <p className="font-semibold">
                  {formatShiftDate(selectedShift.startTime)}{' '}
                  {formatShiftTime(selectedShift.startTime)} –{' '}
                  {formatShiftTime(selectedShift.endTime)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm text-slate-500">Dział</p>
                <p className="font-semibold">{selectedShift.description || 'Bez działu'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm text-slate-500">Obsada</p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedShift.assignedWorkers.length} / {selectedShift.requiredWorkers}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 font-semibold">Przypisani pracownicy</h3>
              {selectedShift.assignedWorkers.length === 0 ? (
                <p className="text-sm text-slate-500">Nikt nie jest jeszcze przypisany.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedShift.assignedWorkers.map((worker) => (
                    <li
                      key={worker.workerId}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                    >
                      <span className="font-medium">{worker.fullName}</span>
                      <button
                        type="button"
                        onClick={() =>
                          void handleRemoveWorker(selectedShift.shiftId, worker.workerId)
                        }
                        disabled={busyShiftId === selectedShift.shiftId}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Usuń
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => void openAssignForm(selectedShift.shiftId)}
                className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
              >
                Przypisz pracownika
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50/70"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULARZ DODAWANIA / EDYCJI */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingEmployee
                  ? 'Edytuj pracownika'
                  : 'Dodaj pracownika'}
              </h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="mb-1 block font-medium">
                  Imię
                </label>
                <input
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Imię"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Nazwisko
                </label>
                <input
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Nazwisko"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Telefon
                </label>
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Numer telefonu"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Dział
                </label>
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option>Produkcja</option>
                  <option>Magazyn</option>
                  <option>Pakowanie</option>
                  <option>Kontrola jakości</option>
                  <option>Utrzymanie ruchu</option>
                </select>
              </div>

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
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFIL PRACOWNIKA */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Profil pracownika
              </h2>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-slate-50/70 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                {selectedEmployee.firstName[0]}
                {selectedEmployee.lastName[0]}
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h3>
                <p className="text-slate-500">
                  {selectedEmployee.department}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm text-slate-500">Telefon</p>
                <p className="font-semibold">{selectedEmployee.phone}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm text-slate-500">
                  Zmiany w tym miesiącu
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedEmployee.shiftsThisMonth}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  openEditForm(selectedEmployee);
                  setSelectedEmployee(null);
                }}
                className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md"
              >
                Edytuj profil
              </button>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50/70"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
