import React from 'react';
import AdministratorsPage from '../../administrators/administrators-page';

interface EmployeesTabProps {
  isActive?: boolean;
}

const EmployeesTab: React.FC<EmployeesTabProps> = ({ isActive }) => {
  if (!isActive) return null;

  return <AdministratorsPage />;
};

export default EmployeesTab;
