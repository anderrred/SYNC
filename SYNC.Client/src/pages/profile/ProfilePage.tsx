import ProfileInfo from '../../components/profile/ProfileInfo';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import MonthlySummary from '../../components/profile/MonthlySummary';

export default function ProfilePage() {
    return (
        <div className="min-h-screen w-full bg-transparent text-slate-800">
            <div className="w-full space-y-7 pt-3">
                <header className="pb-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                        Mój profil
                    </h1>
                </header>

                <div className="space-y-6">
                    <ProfileInfo />
                    <ChangePasswordForm />
                    <MonthlySummary />
                </div>
            </div>
        </div>
    );
}