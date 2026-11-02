import type { User } from '../types/user';

export interface LoginCredentials {
    email: string;
    password: string;
}

const mockUsers: User[] = [
    {
        id: '1',
        firstName: 'Admin',
        lastName: 'SYNC',
        email: 'admin@sync.pl',
        role: 'Admin',
    },
    {
        id: '2',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'manager@sync.pl',
        role: 'Manager',
    },
    {
        id: '3',
        firstName: 'Adam',
        lastName: 'Nowak',
        email: 'employee@sync.pl',
        role: 'Employee',
    },
];

export async function login(
    credentials: LoginCredentials,
): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
        (u) => u.email === credentials.email,
    );

    if (!user || credentials.password !== 'sync123') {
        throw new Error('Nieprawidłowy email lub hasło');
    }

    return user;
}