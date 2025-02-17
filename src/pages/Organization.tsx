import React from 'react';
import { OrganizationSettings } from '../components/settings/OrganizationSettings';
import { DepartmentSettings } from '../components/settings/DepartmentSettings';
import { translations } from '../utils/translations';

const Organization = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{translations.organization}</h1>
      <OrganizationSettings />
      <DepartmentSettings />
    </div>
  );
};

export default Organization;