import { useState } from 'react';
import {
  mockDepartments,
  mockShiftTemplates,
} from '../../mocks/commandCenterMocks';

export default function CommandCenterPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(
    mockDepartments[0].id
  );

  const filteredTemplates = mockShiftTemplates.filter(
    (template) => template.departmentId === selectedDepartment
  );

  const currentDepartment = mockDepartments.find(
    (department) => department.id === selectedDepartment
  );

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Command Center
        </h1>

        <p className="mt-2 text-slate-500">
          Panel koordynatora — zarządzanie grafikiem zmian.
        </p>
      </div>

      {/* Wybór działu */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <label
          htmlFor="department"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Wybierz dział
        </label>

        <select
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        >
          {mockDepartments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      {/* Informacje o dziale */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
        <h2 className="text-xl font-semibold text-slate-800">
          {currentDepartment?.name}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Zarządzanie zmianami w wybranym dziale.
        </p>
      </div>

      {/* Szablony zmian */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          Szablony zmian
        </h2>

        {filteredTemplates.length === 0 ? (
          <p className="text-slate-500">
            Brak szablonów dla tego działu.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-slate-800">
                  {template.name}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-blue-600 font-medium">
                  <span>{template.startTime}</span>
                  <span>—</span>
                  <span>{template.endTime}</span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Dział: {currentDepartment?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}