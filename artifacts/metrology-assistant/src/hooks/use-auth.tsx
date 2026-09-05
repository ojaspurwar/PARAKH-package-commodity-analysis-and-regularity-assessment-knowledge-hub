import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'officer' | 'supervisor' | 'auditor' | 'citizen';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  roleHindi: string;
  badgeId: string;
  jurisdiction: string;
  permissions: {
    canCapture: boolean;
    canSubmit: boolean;
    canAccessSupervisorDashboard: boolean;
    canIssueSeizureMemo: boolean;
    canAuthorizeCompounding: boolean;
    canExportReports: boolean;
  };
}

export const PROFILES: Record<UserRole, UserProfile> = {
  officer: {
    id: 'off-7842',
    name: 'A. Mehta',
    role: 'officer',
    roleTitle: 'Field Enforcement Officer',
    roleHindi: 'क्षेत्र प्रवर्तन अधिकारी',
    badgeId: 'LM-DL-894',
    jurisdiction: 'New Delhi Central District',
    permissions: {
      canCapture: true,
      canSubmit: true,
      canAccessSupervisorDashboard: false,
      canIssueSeizureMemo: true,
      canAuthorizeCompounding: false,
      canExportReports: true,
    },
  },
  supervisor: {
    id: 'sup-1049',
    name: 'R. Verma',
    role: 'supervisor',
    roleTitle: 'Legal Metrology Controller',
    roleHindi: 'विधिक मापविज्ञान नियंत्रक',
    badgeId: 'LM-HQ-012',
    jurisdiction: 'State Directorate of Legal Metrology',
    permissions: {
      canCapture: true,
      canSubmit: true,
      canAccessSupervisorDashboard: true,
      canIssueSeizureMemo: true,
      canAuthorizeCompounding: true,
      canExportReports: true,
    },
  },
  auditor: {
    id: 'aud-3310',
    name: 'Dr. S. Rao',
    role: 'auditor',
    roleTitle: 'Directorate Compliance Auditor',
    roleHindi: 'मंत्रालय अनुपालन लेखापरीक्षक',
    badgeId: 'MCA-AUD-07',
    jurisdiction: 'Ministry of Consumer Affairs (National)',
    permissions: {
      canCapture: false,
      canSubmit: false,
      canAccessSupervisorDashboard: true,
      canIssueSeizureMemo: false,
      canAuthorizeCompounding: false,
      canExportReports: true,
    },
  },
  citizen: {
    id: 'cit-public',
    name: 'Citizen / Consumer',
    role: 'citizen',
    roleTitle: 'Citizen Verification Desk',
    roleHindi: 'नागरिक सत्यापन डेस्क',
    badgeId: 'PUBLIC-ACCESS',
    jurisdiction: 'National Consumer Verification Desk',
    permissions: {
      canCapture: true,
      canSubmit: false,
      canAccessSupervisorDashboard: false,
      canIssueSeizureMemo: false,
      canAuthorizeCompounding: false,
      canExportReports: true,
    },
  },
};

interface AuthContextType {
  role: UserRole;
  user: UserProfile;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (role: UserRole, badgeId?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'parakh.auth.role';
const AUTH_STATUS_KEY = 'parakh.auth.is_authenticated';
const SESSION_ACTIVE_KEY = 'parakh.auth.session_active';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(AUTH_STORAGE_KEY) as UserRole | null;
      if (saved && PROFILES[saved]) return saved;
    }
    return 'officer';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const sessionActive = window.sessionStorage.getItem(SESSION_ACTIVE_KEY);
      if (sessionActive === 'true') {
        const saved = window.localStorage.getItem(AUTH_STATUS_KEY);
        if (saved !== null) {
          return saved === 'true';
        }
      }
    }
    // Default on first visit / new browser session: unauthenticated
    return false;
  });

  const switchRole = (newRole: UserRole) => {
    if (PROFILES[newRole]) {
      setRoleState(newRole);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_STORAGE_KEY, newRole);
      }
    }
  };

  const login = async (newRole: UserRole, _badgeId?: string): Promise<boolean> => {
    if (PROFILES[newRole]) {
      setRoleState(newRole);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_STORAGE_KEY, newRole);
        window.localStorage.setItem(AUTH_STATUS_KEY, 'true');
        window.sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STATUS_KEY, 'false');
      window.sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    }
  };

  const user = PROFILES[role];

  return (
    <AuthContext.Provider value={{ role, user, switchRole, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
