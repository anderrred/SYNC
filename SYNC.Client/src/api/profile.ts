export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface MonthlySummaryData {
    totalShifts: number;
    totalHours: number;
    completedShifts: number;
    upcomingShifts: number;
}

export const getMonthlySummary = async (): Promise<MonthlySummaryData> => {
    return {
        totalShifts: 18,
        totalHours: 144,
        completedShifts: 15,
        upcomingShifts: 3,
    };
};

export const changePassword = async (
    data: ChangePasswordData
): Promise<void> => {
    if (data.currentPassword !== 'sync123') {
        throw new Error('Nieprawidłowe obecne hasło.');
    }

    if (data.newPassword.length < 8) {
        throw new Error('Nowe hasło musi mieć co najmniej 8 znaków.');
    }

    if (data.newPassword !== data.confirmPassword) {
        throw new Error('Hasła nie są zgodne.');
    }
};
