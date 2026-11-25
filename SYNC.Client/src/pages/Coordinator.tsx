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
  assignedEmployeeIds: string[];
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
  { id: '1', firstName: 'Sofiia', lastName: 'Kovalova', phone: '798481404', department: 'Produkcja', shiftsThisMonth: 6 },
  { id: '2', firstName: 'Anna', lastName: 'Nowak', phone: '600123456', department: 'Magazyn', shiftsThisMonth: 8 },
  { id: '3', firstName: 'Jan', lastName: 'Kowalski', phone: '600987654', department: 'Pakowanie', shiftsThisMonth: 4 },
  { id: '4', firstName: 'Maria', lastName: 'Wiśniewska', phone: '601234567', department: 'Produkcja', shiftsThisMonth: 10 },
  { id: '5', firstName: 'Piotr', lastName: 'Zieliński', phone: '602345678', department: 'Magazyn', shiftsThisMonth: 7 },
  { id: '6', firstName: 'Aleksandra', lastName: 'Wójcik', phone: '603456789', department: 'Kontrola jakości', shiftsThisMonth: 5 },
  { id: '7', firstName: 'Michał', lastName: 'Kamiński', phone: '604567890', department: 'Produkcja', shiftsThisMonth: 9 },
  { id: '8', firstName: 'Natalia', lastName: 'Lewandowska', phone: '605678901', department: 'Pakowanie', shiftsThisMonth: 6 },
  { id: '9', firstName: 'Jakub', lastName: 'Dąbrowski', phone: '606789012', department: 'Utrzymanie ruchu', shiftsThisMonth: 3 },
  { id: '10', firstName: 'Zuzanna', lastName: 'Kozłowska', phone: '607890123', department: 'Magazyn', shiftsThisMonth: 8 },
  { id: '11', firstName: 'Tomasz', lastName: 'Jankowski', phone: '608901234', department: 'Produkcja', shiftsThisMonth: 11 },
  { id: '12', firstName: 'Julia', lastName: 'Mazur', phone: '609012345', department: 'Pakowanie', shiftsThisMonth: 5 },
];

export default function Coordinator() {
  const [activeTab, setActiveTab] = useState<Tab>('changes');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [month, setMonth] = useState('11');
  const [year, setYear] = useState('2026');

  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', date: '01', startTime: '06:00', endTime: '14:00', department: 'PRODUKCJA', assigned: 2, total: 4, assignedEmployeeIds: ['1', '4'] },
    { id: '2', date: '02', startTime: '14:00', endTime: '22:00', department: 'MAGAZYN', assigned: 1, total: 3, assignedEmployeeIds: ['2'] },
    { id: '3', date: '03', startTime: '22:00', endTime: '06:00', department: 'PAKOWANIE', assigned: 2, total: 3, assignedEmployeeIds: ['3', '8'] },
    { id: '4', date: '05', startTime: '06:00', endTime: '14:00', department: 'PRODUKCJA', assigned: 1, total: 4, assignedEmployeeIds: ['7'] },
    { id: '5', date: '07', startTime: '14:00', endTime: '22:00', department: 'KONTROLA JAKOŚCI', assigned: 2, total: 2, assignedEmployeeIds: ['6', '9'] },
    { id: '6', date: '10', startTime: '06:00', endTime: '14:00', department: 'MAGAZYN', assigned: 2, total: 3, assignedEmployeeIds: ['5', '10'] },
    { id: '7', date: '12', startTime: '14:00', endTime: '22:00', department: 'PAKOWANIE', assigned: 1, total: 3, assignedEmployeeIds: ['12'] },
    { id: '8', date: '15', startTime: '22:00', endTime: '06:00', department: 'PRODUKCJA', assigned: 2, total: 4, assignedEmployeeIds: ['11', '4'] },
    { id: '9', date: '18', startTime: '06:00', endTime: '14:00', department: 'UTRZYMANIE RUCHU', assigned: 1, total: 2, assignedEmployeeIds: ['9'] },
    { id: '10', date: '22', startTime: '14:00', endTime: '22:00', department: 'PRODUKCJA', assigned: 0, total: 3, assignedEmployeeIds: [] },
    { id: '11', date: '24', startTime: '06:00', endTime: '14:00', department: 'MAGAZYN', assigned: 0, total: 3, assignedEmployeeIds: [] },
    { id: '12', date: '27', startTime: '14:00', endTime: '22:00', department: 'PAKOWANIE', assigned: 0, total: 2, assignedEmployeeIds: [] },
  ]);

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showPoolForm, setShowPoolForm] = useState(false);
  const [poolDate, setPoolDate] = useState('2026-11-28');
  const [poolDepartment, setPoolDepartment] = useState('PRODUKCJA');
  const [poolStartTime, setPoolStartTime] = useState('06:00');
  const [poolEndTime, setPoolEndTime] = useState('14:00');
  const [poolPlaces, setPoolPlaces] = useState('3');
  const [assignmentShiftId, setAssignmentShiftId] = useState('1');
  const [assignmentEmployeeId, setAssignmentEmployeeId] = useState('');

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

  function openAssignmentForm() {
    const firstAvailableShift = shifts.find((shift) => shift.assigned < shift.total);
    setAssignmentShiftId(firstAvailableShift?.id ?? '');
    setAssignmentEmployeeId('');
    setShowAssignmentForm(true);
  }

  const selectedAssignmentShift = shifts.find((shift) => shift.id === assignmentShiftId);
  const availableEmployees = employees.filter((employee) => {
    if (!selectedAssignmentShift) return false;
    return !selectedAssignmentShift.assignedEmployeeIds.includes(employee.id);
  });

  function handleAssignEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAssignmentShift || !assignmentEmployeeId) return;
    if (selectedAssignmentShift.assigned >= selectedAssignmentShift.total) return;

    setShifts((previous) =>
      previous.map((shift) =>
        shift.id === assignmentShiftId
          ? {
              ...shift,
              assignedEmployeeIds: [...shift.assignedEmployeeIds, assignmentEmployeeId],
              assigned: shift.assigned + 1,
            }
          : shift
      )
    );
    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === assignmentEmployeeId
          ? { ...employee, shiftsThisMonth: employee.shiftsThisMonth + 1 }
          : employee
      )
    );
    setShowAssignmentForm(false);
  }

  function handleCreatePool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const [selectedYear, selectedMonth, selectedDay] = poolDate.split('-');
    const places = Number(poolPlaces);

    if (!selectedYear || !selectedMonth || !selectedDay || !Number.isInteger(places) || places < 1) {
      return;
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      date: selectedDay,
      startTime: poolStartTime,
      endTime: poolEndTime,
      department: poolDepartment,
      assigned: 0,
      total: places,
      assignedEmployeeIds: [],
    };

    setShifts((previous) => [...previous, newShift]);
    setMonth(selectedMonth);
    setYear(selectedYear);
    setShowPoolForm(false);
  }

  function handleDeleteShift(shiftId: string) {
    setShifts((previous) =>
      previous.filter((shift) => shift.id !== shiftId)
    );
  }

  function handleDeleteEmployee(employee: Employee) {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć pracownika ${employee.firstName} ${employee.lastName}?`
    );

    if (!confirmed) return;

    setEmployees((previous) =>
      previous.filter((item) => item.id !== employee.id)
    );

    // Usuń pracownika również z obsady zmian i zaktualizuj liczbę miejsc.
    setShifts((previous) =>
      previous.map((shift) => {
        if (!shift.assignedEmployeeIds.includes(employee.id)) return shift;

        const assignedEmployeeIds = shift.assignedEmployeeIds.filter(
          (id) => id !== employee.id
        );

        return {
          ...shift,
          assignedEmployeeIds,
          assigned: assignedEmployeeIds.length,
        };
      })
    );

    if (selectedEmployee?.id === employee.id) setSelectedEmployee(null);
    if (editingEmployee?.id === employee.id) {
      setEditingEmployee(null);
      setShowForm(false);
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
      <div className="w-full space-y-6 pt-3">

        {/* Nagłówek */}
        <header>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
            Centrum koordynatora
          </h1>
        </header>

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

        {/* Akcje nad listą zmian */}
        {activeTab === 'changes' && (
          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={openAssignmentForm}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <UserPlus size={18} strokeWidth={1.8} />
              Przypisz ręcznie
            </button>
            <button
              type="button"
              onClick={() => {
                setPoolDate(`${year}-${month}-28`);
                setPoolDepartment('PRODUKCJA');
                setPoolStartTime('06:00');
                setPoolEndTime('14:00');
                setPoolPlaces('3');
                setShowPoolForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
            >
              <Plus size={18} strokeWidth={2} />
              Nowa pula
            </button>
          </div>
        )}

        {/* ZAKŁADKA ZMIANY */}
        {activeTab === 'changes' && (
          <section
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col gap-3'
            }
          >
            {shifts.map((shift) => (
              <article
                key={shift.id}
                className={
                  viewMode === 'grid'
                    ? `relative rounded-3xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${shift.assigned >= shift.total ? 'border-emerald-200 bg-emerald-50/70' : 'border-white/80 bg-white'}`
                    : `flex flex-col gap-4 rounded-2xl border p-4 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:justify-between ${shift.assigned >= shift.total ? 'border-emerald-200 bg-emerald-50/70' : 'border-white/80 bg-white'}`
                }
              >
                {viewMode === 'grid' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeleteShift(shift.id)}
                      className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Usuń zmianę"
                      aria-label={`Usuń zmianę ${shift.date}`}
                    >
                      <Trash2 size={19} strokeWidth={1.8} />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                      <CalendarDays size={17} strokeWidth={1.8} />
                      {shift.date}.{month}.{year}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xl font-bold sm:text-2xl">
                      <Clock3 size={21} className="text-slate-400" strokeWidth={1.8} />
                      {shift.startTime} – {shift.endTime}
                    </div>
                    <div className="my-5 border-t border-slate-100" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-500">{shift.department}</span>
                      <span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${shift.assigned >= shift.total ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'}`}>
                        {shift.assigned} / {shift.total} osób
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {shift.total - shift.assigned > 0
                        ? `Wolne miejsca: ${shift.total - shift.assigned}`
                        : 'Wszystkie miejsca obsadzone'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-3">
                      <div className="min-w-[90px]">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Data</p>
                        <p className="font-semibold text-slate-800">{shift.date}.{month}.{year}</p>
                      </div>
                      <div className="min-w-[125px]">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Godziny</p>
                        <p className="font-semibold text-slate-800">{shift.startTime} – {shift.endTime}</p>
                      </div>
                      <div className="min-w-[130px]">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Dział</p>
                        <p className="font-semibold text-slate-800">{shift.department}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Obsada</p>
                        <p className={`font-semibold ${shift.assigned >= shift.total ? 'text-emerald-800' : 'text-blue-700'}`}>{shift.assigned} / {shift.total} osób</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteShift(shift.id)}
                      className="self-end rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 md:self-center"
                      title="Usuń zmianę"
                      aria-label={`Usuń zmianę ${shift.date}`}
                    >
                      <Trash2 size={19} strokeWidth={1.8} />
                    </button>
                  </>
                )}
              </article>
            ))}

            {shifts.length === 0 && (
              <div className="rounded-3xl border border-white/80 bg-white p-8 text-center shadow-sm md:col-span-2 xl:col-span-3">
                <p className="text-slate-500">Brak zmian do wyświetlenia.</p>
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
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(employee)}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title={`Usuń pracownika ${employee.firstName} ${employee.lastName}`}
                              aria-label={`Usuń pracownika ${employee.firstName} ${employee.lastName}`}
                            >
                              <Trash2 size={17} strokeWidth={1.8} />
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

      {/* FORMULARZ WYSTAWIANIA NOWEJ PULI */}
      {showPoolForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Wystaw nową pulę</h2>
                <p className="mt-1 text-sm text-slate-500">Utwórz zmianę i określ liczbę dostępnych miejsc.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPoolForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Zamknij formularz"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div>
                <label htmlFor="pool-date" className="mb-1 block font-medium">Data</label>
                <input
                  id="pool-date"
                  type="date"
                  required
                  value={poolDate}
                  onChange={(event) => setPoolDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label htmlFor="pool-department" className="mb-1 block font-medium">Dział</label>
                <select
                  id="pool-department"
                  value={poolDepartment}
                  onChange={(event) => setPoolDepartment(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="PRODUKCJA">Produkcja</option>
                  <option value="MAGAZYN">Magazyn</option>
                  <option value="PAKOWANIE">Pakowanie</option>
                  <option value="KONTROLA JAKOŚCI">Kontrola jakości</option>
                  <option value="UTRZYMANIE RUCHU">Utrzymanie ruchu</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">Godziny</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pool-start" className="mb-1 block text-xs text-slate-500">Od</label>
                    <input
                      id="pool-start"
                      type="time"
                      required
                      value={poolStartTime}
                      onChange={(event) => setPoolStartTime(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="pool-end" className="mb-1 block text-xs text-slate-500">Do</label>
                    <input
                      id="pool-end"
                      type="time"
                      required
                      value={poolEndTime}
                      onChange={(event) => setPoolEndTime(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="pool-places" className="mb-1 block font-medium">Miejsca</label>
                <input
                  id="pool-places"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={poolPlaces}
                  onChange={(event) => setPoolPlaces(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Liczba miejsc"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPoolForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  Wystaw pulę
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORMULARZ RĘCZNEGO PRZYPISANIA */}
      {showAssignmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-slate-900/10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Przypisz pracownika</h2>
                <p className="mt-1 text-sm text-slate-500">Wybierz zmianę i dowolnego dostępnego pracownika.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignmentForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Zamknij formularz"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignEmployee} className="space-y-4">
              <div>
                <label htmlFor="assignment-shift" className="mb-1 block font-medium">Zmiana</label>
                <select
                  id="assignment-shift"
                  required
                  value={assignmentShiftId}
                  onChange={(event) => {
                    setAssignmentShiftId(event.target.value);
                    setAssignmentEmployeeId('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  {shifts.filter((shift) => shift.assigned < shift.total).map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.date}.{month}.{year} · {shift.startTime}–{shift.endTime} · {shift.department} ({shift.assigned}/{shift.total})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAssignmentShift && (
                <div>
                  <label htmlFor="assignment-employee" className="mb-1 block font-medium">Dostępny pracownik</label>
                  <select
                    id="assignment-employee"
                    required
                    value={assignmentEmployeeId}
                    onChange={(event) => setAssignmentEmployeeId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Wybierz pracownika</option>
                    {availableEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                  {availableEmployees.length === 0 && (
                    <p className="mt-2 text-sm text-amber-700">Brak dostępnych pracowników do wybranej zmiany.</p>
                  )}
                </div>
              )}

              {shifts.length === 0 || !shifts.some((shift) => shift.assigned < shift.total) ? (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Brak zmian z wolnymi miejscami.</p>
              ) : null}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={!selectedAssignmentShift || !assignmentEmployeeId || availableEmployees.length === 0}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Przypisz
                </button>
              </div>
            </form>
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