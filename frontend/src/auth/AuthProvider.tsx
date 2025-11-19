import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '../api/pb';

type User = {
  id: string;
  email?: string;
  fullName?: string;
  role?: 'admin'|'teacher'|'student';
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string)=>Promise<void>;
  signOut: ()=>void;
  register: (data:any)=>Promise<void>;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // load current auth state
    const authStore = pb.authStore;
    if (authStore.isValid) {
      setUser(authStore.model as unknown as User);
    }
    setReady(true);

    const un = pb.authStore.onChange(() => {
      setUser(pb.authStore.isValid ? (pb.authStore.model as unknown as User) : null);
    });
    return () => un();
  }, []);

  const signIn = async (email:string, password:string) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    setUser(pb.authStore.model as unknown as User);
    return authData;
  };

  const register = async (payload:any) => {
    // create user in users collection (if your rules allow public registration)
    const newUser = await pb.collection('users').create(payload);
    // optionally auto-login
    return newUser;
  };

  const signOut = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, signIn, signOut, register, ready}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = ()=> {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
