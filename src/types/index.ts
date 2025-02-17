export interface User {
  id: string;
  email: string;
  name: string;
  organization_id?: string;
}

export interface Rating {
  id: string;
  user_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  invitation_code: string;
}