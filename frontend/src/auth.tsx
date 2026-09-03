import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/src/utils/storage";
import { api, setAuthToken } from "@/src/api";
type User = { id: string; name: string; email: string };
type AuthState = { user: User|null; token: string|null; loading: boolean; signIn:(e:string,p:string)=>Promise<void>; signUp:(n:string,e:string,p:string)=>Promise<void>; signOut:()=>Promise<void>; };
const AuthContext = createContext<AuthState|undefined>(undefined);
const TOKEN_KEY = "mechmate_token";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,setUser]=useState<User|null>(null); const [token,setToken]=useState<string|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{const saved=await storage.secureGet<string>(TOKEN_KEY,"");if(saved){setAuthToken(saved);try{const me=await api.me();setUser(me);setToken(saved);}catch{await storage.secureRemove(TOKEN_KEY);setAuthToken(null);}}setLoading(false);})();},[]);
  const persist=useCallback(async(t:string,u:User)=>{setAuthToken(t);await storage.secureSet(TOKEN_KEY,t);setToken(t);setUser(u);},[]);
  const signIn=useCallback(async(email:string,password:string)=>{const res=await api.login(email,password);await persist(res.token,res.user);},[persist]);
  const signUp=useCallback(async(name:string,email:string,password:string)=>{const res=await api.register(name,email,password);await persist(res.token,res.user);},[persist]);
  const signOut=useCallback(async()=>{await storage.secureRemove(TOKEN_KEY);setAuthToken(null);setToken(null);setUser(null);},[]);
  return <AuthContext.Provider value={{user,token,loading,signIn,signUp,signOut}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const ctx=useContext(AuthContext);if(!ctx)throw new Error("useAuth must be used within AuthProvider");return ctx;}
