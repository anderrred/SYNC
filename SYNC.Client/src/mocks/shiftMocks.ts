import type { Shift } from '../types/shift';
import type { User } from '../types/user';

export const mockUsers: User[] = [
    {
        id: 'user-1',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@sync.pl',
        role: 'Employee'
    },
    {
        id: 'user-2',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna.nowak@sync.pl',
        role: 'Manager'
    }
];

export const mockShifts: Shift[] = [
    {
        id: 'shift-1',
        assignedUserId: 'user-1',
        assignedUser: mockUsers[0],
        startTime: '2026-10-26T08:00:00Z',
        endTime: '2026-10-26T16:00:00Z',
        status: 'Scheduled',
        notes: 'Poranna zmiana na magazynie'
    },
    {
        id: 'shift-2',
        assignedUserId: 'user-2',
        assignedUser: mockUsers[1],
        startTime: '2026-10-27T10:00:00Z',
        endTime: '2026-10-27T18:00:00Z',
        status: 'Completed'
    }
];