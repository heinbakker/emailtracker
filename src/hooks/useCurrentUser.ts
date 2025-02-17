import { useAuth } from '../context/AuthContext';

export function useCurrentUser() {
  const { user } = useAuth();
  
  if (!user?.id) {
    throw new Error('No authenticated user found');
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}