
import { useEffect, useState } from 'react';
import {
    CalendarDays,
    Clock3,
    CheckCircle2,
    CalendarClock,
    WalletCards,
    Banknote,
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
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                    Ładowanie podsumowania...
                </p>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
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

    const cardStyle =
        'group rounded-2xl border border-blue-100/80 bg-blue-50/60 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-100/70 hover:shadow-lg';

    const iconStyle =
        'rounded-xl bg-white p-3 text-blue-600 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md';

    return (
        <div className="space-y-6">

            {/* Podsumowanie miesiąca */}
            <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform duration-300 hover:rotate-6">
                        <CalendarDays size={21} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Podsumowanie miesiąca
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Twoja aktywność i statystyki pracy
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statistics.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className={cardStyle}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-blue-700">
                                            {item.label}
                                        </p>

                                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
                                            {item.value}
                                        </p>
                                    </div>

                                    <div className={iconStyle}>
                                        <Icon size={20} strokeWidth={1.8} />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-slate-400 transition-colors duration-300 group-hover:text-blue-600">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Moje zarobki */}
            <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-transform duration-300 hover:rotate-6">
                        <WalletCards size={21} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Moje zarobki
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Podsumowanie czasu pracy i wynagrodzenia
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* Godziny */}
                    <div className={cardStyle}>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-blue-700">
                                Przepracowane godziny
                            </p>

                            <div className={iconStyle}>
                                <Clock3 size={20} strokeWidth={1.8} />
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
                            {summary.totalHours}
                            <span className="ml-2 text-base font-medium text-slate-500">
                                godz.
                            </span>
                        </p>

                        <p className="mt-2 text-xs text-slate-400 transition-colors duration-300 group-hover:text-blue-600">
                            Łączna liczba godzin w tym miesiącu
                        </p>
                    </div>

                    {/* Wynagrodzenie */}
                    <div className={cardStyle}>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-blue-700">
                                Szacowane brutto
                            </p>

                            <div className={iconStyle}>
                                <Banknote size={20} strokeWidth={1.8} />
                            </div>
                        </div>

                        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
                            Brak danych
                        </p>

                        <p className="mt-2 text-xs text-slate-400 transition-colors duration-300 group-hover:text-blue-600">
                            Wynagrodzenie będzie dostępne po dodaniu stawki godzinowej
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
