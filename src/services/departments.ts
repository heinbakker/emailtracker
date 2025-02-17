import { supabase } from '../config/supabase';
import type { Department, DepartmentMembership, DepartmentPermission } from '../types/departments';

export const departmentService = {
  async getDepartments(organizationId: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;
    return data;
  },

  async createDepartment(organizationId: string, name: string): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert({ organization_id: organizationId, name })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinDepartment(departmentId: string, userId: string): Promise<DepartmentMembership> {
    const { data, error } = await supabase
      .from('department_memberships')
      .insert({
        department_id: departmentId,
        user_id: userId,
        role: 'member'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDepartmentMembers(departmentId: string): Promise<DepartmentMembership[]> {
    const { data, error } = await supabase
      .from('department_memberships')
      .select('*, users(name, email)')
      .eq('department_id', departmentId);

    if (error) throw error;
    return data;
  },

  async updateMemberRole(membershipId: string, role: 'member' | 'manager'): Promise<void> {
    const { error } = await supabase
      .from('department_memberships')
      .update({ role })
      .eq('id', membershipId);

    if (error) throw error;
  },

  async setDepartmentPermission(
    departmentId: string,
    userId: string,
    canViewResults: boolean
  ): Promise<DepartmentPermission> {
    const { data, error } = await supabase
      .from('department_permissions')
      .upsert({
        department_id: departmentId,
        user_id: userId,
        can_view_results: canViewResults
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};