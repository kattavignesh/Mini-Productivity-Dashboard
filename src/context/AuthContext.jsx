import { createContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MOCK_USERS } from '../data/mockData';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const initTimer = useRef(null);

  const fetchProfile = useCallback(async (userId, email) => {
    if (!supabase) {
      return MOCK_USERS.find(u => u.email === email) || null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data || MOCK_USERS.find(u => u.email === email) || null;
    } catch (err) {
      // Quietly fail or return null to trigger mock fallback
      return MOCK_USERS.find(u => u.email === email) || null;
    }
  }, []);

  const initializeAuth = useCallback(async (mounted) => {
    try {
      if (!supabase) {
        setIsDemo(true);
        const saved = localStorage.getItem('zoiko_demo_user');
        if (saved && mounted) {
          const user = JSON.parse(saved);
          setSession({ user });
          setProfile(MOCK_USERS.find(u => u.email === user.email));
        }
      } else {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            const p = await fetchProfile(initialSession.user.id, initialSession.user.email);
            if (mounted) setProfile(p);
          }
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      if (mounted) {
        setLoading(false);
        if (initTimer.current) clearTimeout(initTimer.current);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: If initialization takes > 3.5s, force loading to false
    initTimer.current = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 3500);

    initializeAuth(mounted);

    let authListener = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        
        // Handle explicit sign out event from Supabase
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (newSession) {
          setSession(newSession);
          if (newSession.user) {
            const p = await fetchProfile(newSession.user.id, newSession.user.email);
            if (mounted) setProfile(p);
          }
          setLoading(false);
        } else {
          setSession(null);
          setProfile(null);
        }
      });
      authListener = subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
      if (initTimer.current) clearTimeout(initTimer.current);
    };
  }, [fetchProfile, initializeAuth]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    // Deliberate 1-second delay for a "professional" feel
    const delay = new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Prioritise mock login for known demo accounts to ensure a smooth demo experience
      const isDemoEmail = ['test.manager@zoiko.com', 'test.emp.a@zoiko.com', 'test.emp.b@zoiko.com'].includes(email);

      if (!supabase || isDemoEmail) {
        const user = { id: `mock-${Date.now()}`, email };
        localStorage.setItem('zoiko_demo_user', JSON.stringify(user));
        setSession({ user });
        setProfile(MOCK_USERS.find(u => u.email === email));
        await delay;
        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        const p = await fetchProfile(data.session.user.id, data.session.user.email);
        setProfile(p);
      }
      await delay;
      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    setLoading(true); // Show spinner during logout
    const delay = new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await delay;
      
      setProfile(null);
      setSession(null);
      localStorage.removeItem('zoiko_demo_user');
      
      if (supabase) {
        supabase.auth.signOut().catch(err => console.warn('Supabase sign out warning:', err.message));
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signOut,
    signIn,
    isDemo: !supabase || isDemo,
    role: profile?.role ?? null,
  }), [session, profile, loading, signOut, signIn, isDemo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
