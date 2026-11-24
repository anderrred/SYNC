import { useState } from 'react';
import StaffDirectory from '../../components/staff/StaffDirectory';

function padMonth(value: number) {
  return String(value).padStart(2, '0');
}

export default function EmployeesPage() {
  const now = new Date();
  const [month, setMonth] = useState(padMonth(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  return (
    <StaffDirectory
      month={month}
      year={year}
      onMonthChange={setMonth}
      onYearChange={setYear}
    />
  );
}
