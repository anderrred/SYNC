import axios from 'axios';
import axiosClient from './axiosClient';

export interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  shiftsThisMonth: number;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateStaffPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface ImportStaffResult {
  successful: number;
  failed: number;
  errors: string[];
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

export async function getStaff(month: number, year: number): Promise<StaffMember[]> {
  try {
    const { data } = await axiosClient.get<StaffMember[]>('/Shifts/workers/staff', {
      params: { month, year },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się pobrać listy pracowników.'));
  }
}

export async function getStaffMember(
  id: number,
  month: number,
  year: number
): Promise<StaffMember> {
  try {
    const { data } = await axiosClient.get<StaffMember>(`/Shifts/workers/${id}`, {
      params: { month, year },
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się pobrać profilu pracownika.'));
  }
}

export async function createStaff(payload: CreateStaffPayload): Promise<string> {
  try {
    const { data } = await axiosClient.post<{ message?: string }>('/Shifts/workers', payload);
    return data?.message ?? 'Konto pracownika zostało utworzone.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się dodać pracownika.'));
  }
}

export async function updateStaff(id: number, payload: UpdateStaffPayload): Promise<string> {
  try {
    const { data } = await axiosClient.put<{ message?: string }>(`/Shifts/workers/${id}`, payload);
    return data?.message ?? 'Dane pracownika zostały zaktualizowane.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się zaktualizować pracownika.'));
  }
}

export async function deleteStaff(id: number): Promise<string> {
  try {
    const { data } = await axiosClient.delete<{ message?: string }>(`/Shifts/workers/${id}`);
    return data?.message ?? 'Konto pracownika zostało usunięte.';
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Nie udało się usunąć pracownika.'));
  }
}

export async function importStaff(file: File): Promise<ImportStaffResult> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    throw new Error('Obsługiwany jest tylko format .xlsx.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await axiosClient.post<ImportStaffResult>('/Shifts/workers/import', formData);
    return {
      successful: data.successful ?? 0,
      failed: data.failed ?? 0,
      errors: Array.isArray(data.errors) ? data.errors : [],
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
      const payload = error.response.data as Partial<ImportStaffResult> & { title?: string };
      if (typeof payload.successful === 'number') {
        return {
          successful: payload.successful,
          failed: payload.failed ?? 0,
          errors: Array.isArray(payload.errors)
            ? payload.errors
            : [payload.title ?? 'Import nie powiódł się.'],
        };
      }
    }

    throw new Error(getApiErrorMessage(error, 'Nie udało się zaimportować pracowników.'));
  }
}
