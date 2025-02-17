import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { departmentService } from '../../services/departments';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import type { Department } from '../../types/departments';

export const DepartmentSettings = () => {
  const { organization } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Don't load departments if no organization
  if (!organization) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{translations.departmentSettings}</h2>
        <p className="text-gray-500">
          {translations.needOrganizationForDepartments}
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadDepartments();
  }, [organization.id]);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await departmentService.getDepartments(organization.id);
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    try {
      setError(null);
      await departmentService.createDepartment(organization.id, newDepartmentName.trim());
      setNewDepartmentName('');
      await loadDepartments();
    } catch (err) {
      console.error('Failed to create department:', err);
      setError('Failed to create department');
    }
  };

  if (isLoading) {
    return <div>{translations.loadingDepartments}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{translations.departmentSettings}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateDepartment} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder={translations.enterDepartmentName}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {translations.createDepartment}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {departments.map((department) => (
          <div
            key={department.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{department.name}</h3>
            </div>
            <button
              onClick={() => {/* TODO: Show department members modal */}}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="w-4 h-4 mr-2" />
              {translations.manageMembers}
            </button>
          </div>
        ))}

        {departments.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            {translations.noDepartments}
          </div>
        )}
      </div>
    </div>
  );
};