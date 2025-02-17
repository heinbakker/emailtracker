import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { supabase } from '../config/supabase';
import { authService, SignUpData } from '../services/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...prev, user: null, isLoading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserData(session.user.id);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      setState({
        user: userData,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await authService.signIn(email, password);
      if (error) throw error;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const signup = async (data: SignUpData) => {
    try {
      const { error } = await authService.signUp(data);
      if (error) throw error;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const logout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};