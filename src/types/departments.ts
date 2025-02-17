export interface Department {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
}

export interface DepartmentMembership {
  id: string;
  department_id: string;
  user_id: string;
  role: 'member' | 'manager';
  created_at: string;
}

export interface DepartmentPermission {
  id: string;
  department_id: string;
  user_id: string;
  can_view_results: boolean;
  created_at: string;
}