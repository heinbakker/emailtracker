export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          organization_id: string | null;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          organization_id?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          organization_id?: string | null;
          role?: 'admin' | 'user';
          created_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          admin_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          admin_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          admin_id?: string;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          type: 'stars' | 'thumbs' | 'smileys';
          value: number;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'stars' | 'thumbs' | 'smileys';
          value: number;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'stars' | 'thumbs' | 'smileys';
          value?: number;
          feedback?: string | null;
          created_at?: string;
        };
      };
    };
  };
}