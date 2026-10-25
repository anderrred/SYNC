import type { User } from './user';

export type ShiftStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Shift {
    id: string;
    assignedUserId: string;
    assignedUser?: User; 
    startTime: string; 
    endTime: string;
    status: ShiftStatus;
    notes?: string;
}