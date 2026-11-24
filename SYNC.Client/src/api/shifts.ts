import axios from 'axios';
import axiosClient from './axiosClient';

export interface ShiftWorker {
  workerId: number;
  fullName: string;
}

export interface ShiftPool {
  shiftId: number;
  startTime: string;
  endTime: string;
  description: string;
  requiredWorkers: number;
  assignedWorkers: ShiftWorker[];
}

export interface WorkerOption {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface CreateShiftPoolPayload {
  startTime: string;
  endTime: string;
  description: string;
  spots: number;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) {
      return 'Brak uprawnień do tej operacji.';
    }

    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const payload = data as { title?: string; message?: string };
      if (typeof payload.title === 'string' && payload.title.trim()) {
        return payload.title;
      }
      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function getAllShifts(): Promise<ShiftPool[]> {
  try {
    const { data } = await axiosClient.get<ShiftPool[]>('/Shifts/all');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się pobrać grafiku zmian.'));
  }
}

export async function getShiftById(shiftId: number): Promise<ShiftPool> {
  try {
    const { data } = await axiosClient.get<ShiftPool>(`/Shifts/${shiftId}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się pobrać szczegółów zmiany.'));
  }
}

export async function createShiftPool(payload: CreateShiftPoolPayload): Promise<string> {
  try {
    const { data } = await axiosClient.post<{ message?: string }>('/Shifts/create-pool', payload);
    return data?.message ?? 'Utworzono pulę zmian.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się utworzyć puli zmian.'));
  }
}

export async function assignWorker(shiftId: number, workerId: number): Promise<string> {
  try {
    const { data } = await axiosClient.post<{ message?: string }>(
      `/Shifts/${shiftId}/assign/${workerId}`
    );
    return data?.message ?? 'Pracownik został przypisany.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się przypisać pracownika.'));
  }
}

export async function removeWorkerFromShift(shiftId: number, workerId: number): Promise<string> {
  try {
    const { data } = await axiosClient.delete<{ message?: string }>(
      `/Shifts/${shiftId}/remove/${workerId}`
    );
    return data?.message ?? 'Pracownik został usunięty ze zmiany.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się usunąć pracownika ze zmiany.'));
  }
}

export async function deleteShift(shiftId: number): Promise<string> {
  try {
    const { data } = await axiosClient.delete<{ message?: string }>(`/Shifts/${shiftId}`);
    return data?.message ?? 'Zmiana została usunięta.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się usunąć zmiany.'));
  }
}

export async function getWorkersForAssignment(): Promise<WorkerOption[]> {
  try {
    const { data } = await axiosClient.get<WorkerOption[]>('/Shifts/workers');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się pobrać listy pracowników.'));
  }
}
