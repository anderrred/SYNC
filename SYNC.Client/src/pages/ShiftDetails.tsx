interface ShiftsViewProps {
  departmentName: string;
}

export default function ShiftsView({
  departmentName,
}: ShiftsViewProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">
        Grafik zmian — {departmentName}
      </h2>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">
          Grafik zmian dla wybranego działu.
        </p>
      </div>
    </section>
  );
}
