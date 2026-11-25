import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRound, ChevronDown } from 'lucide-react';

export default function ProfileInfo() {
    const { user } = useAuth();
    // Dane użytkownika są domyślnie zwinięte i otwierają się po kliknięciu.
    const [expanded, setExpanded] = useState(false);

    if (!user) {
        return <p>Nie znaleziono danych użytkownika.</p>;
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-blue-50/50"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <UserRound size={18} strokeWidth={1.8} />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-slate-800">
                            Dane użytkownika
                        </h2>
                        <p className="text-xs text-slate-500">
                            Informacje o Twoim koncie
                        </p>
                    </div>
                </div>

                <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-300 ${
                        expanded ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {expanded && (
                <div className="border-t border-blue-50 px-4 py-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                            { label: 'Imię', value: user.firstName },
                            { label: 'Email', value: user.email },
                            { label: 'Rola', value: user.role },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-lg bg-blue-50/60 px-3 py-2"
                            >
                                <p className="text-xs text-slate-500">
                                    {item.label}
                                </p>
                                <p className="truncate text-sm font-medium text-slate-800">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
