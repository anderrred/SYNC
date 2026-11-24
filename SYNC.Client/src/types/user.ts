export type UserRole = 'Worker' | 'Admin' | 'Leader';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}