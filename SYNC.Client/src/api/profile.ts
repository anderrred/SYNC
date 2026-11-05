import axios from 'axios';
import axiosClient from './axiosClient';

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

interface MyShift {
    shiftId: number;
    startTime: string;
    endTime: string;
    description: string;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === 'string' && data.trim()) {
            return data;
        }

        if (data && typeof data === 'object') {
            const message = (data as { message?: string }).message;
            if (typeof message === 'string' && message.trim()) {
                return message;
            }
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

function hoursBetween(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        return 0;
    }

    return (end - start) / 36e5;
}

function isInCurrentMonth(isoDate: string, now: Date): boolean {
    const date = new Date(isoDate);
    return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

export const getMonthlySummary = async (): Promise<MonthlySummaryData> => {
    try {
        const { data } = await axiosClient.get<MyShift[]>('/Users/me/shifts');
        const now = new Date();
        const shiftsThisMonth = (Array.isArray(data) ? data : []).filter((shift) =>
            isInCurrentMonth(shift.startTime, now)
        );

        return {
            totalShifts: shiftsThisMonth.length,
            totalHours:
                Math.round(
                    shiftsThisMonth.reduce(
                        (sum, shift) => sum + hoursBetween(shift.startTime, shift.endTime),
                        0
                    ) * 10
                ) / 10,
            completedShifts: shiftsThisMonth.filter(
                (shift) => new Date(shift.endTime).getTime() <= now.getTime()
            ).length,
            upcomingShifts: shiftsThisMonth.filter(
                (shift) => new Date(shift.startTime).getTime() > now.getTime()
            ).length,
        };
    } catch (error) {
        throw new Error(
            getApiErrorMessage(error, 'Nie udało się załadować podsumowania zmian.')
        );
    }
};

export const changePassword = async (
    data: ChangePasswordData
): Promise<void> => {
    if (data.newPassword.length < 8) {
        throw new Error('Nowe hasło musi mieć co najmniej 8 znaków.');
    }

    if (data.newPassword !== data.confirmPassword) {
        throw new Error('Hasła nie są zgodne.');
    }

    try {
        await axiosClient.post('/Auth/change-password', {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    } catch (error) {
        throw new Error(
            getApiErrorMessage(error, 'Wystąpił błąd podczas zmiany hasła.')
        );
    }
};
