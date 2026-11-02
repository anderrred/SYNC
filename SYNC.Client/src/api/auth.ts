import axios from 'axios';
import axiosClient from './axiosClient';
import type { User, UserRole } from '../types/user';

export interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    email: string;
    role: UserRole;
}

function parseJwt(token: string): Record<string, unknown> | null {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

function mapUser(data: AuthResponse): User {
    const payload = parseJwt(data.token);
    const id =
        (payload?.nameid as string | undefined) ??
        (payload?.sub as string | undefined) ??
        (payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string | undefined) ??
        data.email;

    const localPart = (data.email ?? '').split('@')[0];
    const [firstName, ...rest] = localPart.split(/[.\-_]/);

    return {
        id: String(id),
        firstName: firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Użytkownik',
        lastName: rest.join(' '),
        email: data.email,
        role: data.role,
    };
}

export async function login(credentials: LoginCredentials): Promise<User> {
    try {
        const { data } = await axiosClient.post<AuthResponse>('/Auth/login', credentials);
        localStorage.setItem('token', data.token);
        return mapUser(data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error('Nieprawidłowy email lub hasło');
        }

        throw new Error('Nie udało się zalogować. Spróbuj ponownie.');
    }
}
