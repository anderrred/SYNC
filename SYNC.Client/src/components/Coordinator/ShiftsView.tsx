interface Shift {
  id: string;
  departmentId: string;
  departmentName: string;
  date: string;
  templateName: string;
  startTime: string;
  endTime: string;
  workersCount: number;
}

interface ShiftsViewProps {
  departmentName: string;
  shifts: Shift[];
}

export default function ShiftsView({
  departmentName,
  shifts,
}: ShiftsViewProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Grafik zmian — {departmentName}
        </h2>
      </div>

      {shifts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-500">
            Brak zaplanowanych zmian dla wybranej daty.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {shift.templateName}
                  </h3>

                  <p className="mt-2 font-medium text-blue-600">
                    {shift.startTime} — {shift.endTime}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-3">
                  <p className="text-sm text-slate-500">
                    Liczba miejsc
                  </p>

                  <p className="text-lg font-bold text-blue-700">
                    {shift.workersCount}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <p>Data: {shift.date}</p>
                <p>Dział: {shift.departmentName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}