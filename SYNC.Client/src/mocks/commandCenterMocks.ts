export interface Department {
  id: string;
  name: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  departmentId: string;
}

export const mockDepartments: Department[] = [
  {
    id: 'department-1',
    name: 'Magazyn',
  },
  {
    id: 'department-2',
    name: 'Produkcja',
  },
  {
    id: 'department-3',
    name: 'Pakowanie',
  },
];

export const mockShiftTemplates: ShiftTemplate[] = [
  {
    id: 'template-1',
    name: 'Zmiana poranna',
    startTime: '06:00',
    endTime: '14:00',
    departmentId: 'department-1',
  },
  {
    id: 'template-2',
    name: 'Zmiana popołudniowa',
    startTime: '14:00',
    endTime: '22:00',
    departmentId: 'department-1',
    
  },
  {
    id: 'template-3',
    name: 'Zmiana nocna',
    startTime: '22:00',
    endTime: '06:00',
    departmentId: 'department-2',
  },
];