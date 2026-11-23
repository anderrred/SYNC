import { useState } from 'react';
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

type Tab = 'changes' | 'workers' | 'settlements';
type ViewMode = 'grid' | 'list';

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  assigned: number;
  total: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  shiftsThisMonth: number;
}

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

export default function Coordinator() {
  const [activeTab, setActiveTab] = useState<Tab>('changes');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [month, setMonth] = useState('11');
  const [year, setYear] = useState('2026');

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: '1',
      date: '22.11',
      startTime: '14:00',
      endTime: '22:00',
      department: 'PRODUKCJA',
      assigned: 1,
      total: 3,
    },
  ]);

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

  function handleDeleteShift(shiftId: string) {
    setShifts((previous) =>
      previous.filter((shift) => shift.id !== shiftId)
    );
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
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <UserPlus size={18} strokeWidth={1.8} />
            Przypisz ręcznie
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
          >
            <Plus size={18} strokeWidth={2} />
            Nowa pula
          </button>
        </div>

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
            {shifts.map((shift) => (
              <article
                key={shift.id}
                className="relative rounded-3xl border border-white/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteShift(shift.id)}
                  className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Usuń zmianę"
                  aria-label={`Usuń zmianę ${shift.date}`}
                >
                  <Trash2 size={20} strokeWidth={1.8} />
                </button>

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <CalendarDays size={17} strokeWidth={1.8} />
                  {shift.date}
                </div>

                <div className="mt-3 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                  <Clock3 size={23} className="text-slate-400" strokeWidth={1.8} />
                  {shift.startTime} - {shift.endTime}
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500">
                    {shift.department}
                  </span>

                  <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-bold text-blue-700">
                    {shift.assigned} / {shift.total}
                  </span>
                </div>
              </article>
            ))}

            {shifts.length === 0 && (
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