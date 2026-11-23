
import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { getMonthlySummary } from '../../api/profile';
import type { MonthlySummaryData } from '../../api/profile';

export default function MonthlySummary() {
  const [summary, setSummary] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMonthlySummary()
      .then(setSummary)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Nie udało się załadować podsumowania.'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Ładowanie podsumowania...
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">
          {error || 'Nie udało się załadować podsumowania.'}
        </p>
      </div>
    );
  }

  const statistics = [
    {
      label: 'Liczba zmian',
      value: summary.totalShifts,
      description: 'W tym miesiącu',
      icon: CalendarDays,
    },
    {
      label: 'Przepracowane godziny',
      value: summary.totalHours,
      description: 'Łączny czas pracy',
      icon: Clock3,
    },
    {
      label: 'Zakończone zmiany',
      value: summary.completedShifts,
      description: 'Zrealizowane',
      icon: CheckCircle2,
    },
    {
      label: 'Nadchodzące zmiany',
      value: summary.upcomingShifts,
      description: 'Zaplanowane',
      icon: CalendarClock,
    },
  ];

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Podsumowanie miesiąca
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Twoja aktywność i statystyki pracy
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-blue-100/80 bg-blue-50/70 p-5 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
                    {item.value}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
