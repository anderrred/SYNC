import { useState } from 'react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  shiftsThisMonth: number;
}

const mockEmployees: Employee[] = [
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

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`;

    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone.includes(search) ||
      employee.department.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">

      {/* Nagłówek */}
      <header>
        <h1 className="text-3xl font-bold text-slate-800">
          Baza pracowników
        </h1>

        <p className="mt-2 text-slate-500">
          Zarządzanie pracownikami fabryki.
        </p>
      </header>

      {/* Przyciski */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          + Dodaj pracownika
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Import z Excela
        </button>
      </div>

      {/* Liczba pracowników */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Liczba pracowników
        </p>

        <p className="mt-1 text-3xl font-bold text-slate-800">
          {employees.length}
        </p>
      </div>

      {/* Wyszukiwanie */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="employee-search"
          className="mb-2 block font-medium text-slate-700"
        >
          Wyszukaj pracownika
        </label>

        <input
          id="employee-search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Imię, nazwisko, telefon lub dział..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead className="bg-slate-50">
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
                  Profil
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50"
                >
                  {/* Pracownik */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-100 font-bold text-lime-800">
                        {employee.firstName[0]}
                        {employee.lastName[0]}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {employee.firstName} {employee.lastName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kontakt */}
                  <td className="px-5 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      {employee.phone}
                    </div>
                  </td>

                  {/* Dział */}
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {employee.department}
                    </span>
                  </td>

                  {/* Zmiany */}
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-violet-100 px-3 py-1 font-semibold text-violet-700">
                      {employee.shiftsThisMonth}
                    </span>
                  </td>

                  {/* Profil */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="font-medium text-violet-600 hover:text-violet-800"
                    >
                      Zobacz profil →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Brak wyników */}
        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Nie znaleziono pracowników.
          </div>
        )}
      </div>

    </div>
  );
}