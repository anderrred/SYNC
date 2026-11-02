import { useAuth } from '../../context/AuthContext';

export default function ProfileInfo() {
    const { user } = useAuth();

    if (!user) {
        return <p>Nie znaleziono danych użytkownika.</p>;
    }

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Dane użytkownika</h2>

            <div className="space-y-2">
                <p>
                    <span className="font-medium">Imię:</span> {user.firstName}
                </p>
                <p>
                    <span className="font-medium">Nazwisko:</span> {user.lastName}
                </p>
                <p>
                    <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                    <span className="font-medium">Rola:</span> {user.role}
                </p>
            </div>
        </section>
    );
}