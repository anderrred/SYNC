import ProfileInfo from '../../components/profile/ProfileInfo';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import MonthlySummary from '../../components/profile/MonthlySummary';

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mój profil</h1>
                <p className="mt-1 text-gray-500">
                    Zarządzaj swoimi danymi i sprawdź podsumowanie miesiąca.
                </p>
            </div>

            <ProfileInfo />
            <ChangePasswordForm />
            <MonthlySummary />
        </div>
    );
}