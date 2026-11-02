import { useEffect, useState } from 'react';
import { getMonthlySummary } from '../../api/profile';
import type { MonthlySummaryData } from '../../api/profile';

export default function MonthlySummary() {
    const [summary, setSummary] = useState<MonthlySummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMonthlySummary()
            .then(setSummary)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p>Ładowanie podsumowania...</p>;
    }

    if (!summary) {
        return <p>Nie udało się załadować podsumowania.</p>;
    }

    const statistics = [
        { label: 'Liczba zmian', value: summary.totalShifts },
        { label: 'Przepracowane godziny', value: summary.totalHours },
        { label: 'Zakończone zmiany', value: summary.completedShifts },
        { label: 'Nadchodzące zmiany', value: summary.upcomingShifts },
    ];

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Podsumowanie miesiąca
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {statistics.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-lg bg-gray-50 p-4"
                    >
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="mt-1 text-2xl font-bold">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}