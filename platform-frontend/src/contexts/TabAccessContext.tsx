import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useCustomAuth } from '@/contexts/CustomAuthContext';

// Define all possible tabs for doctors
export const DOCTOR_TABS = [
  { id: 'dashboard', name: 'Dashboard', description: 'Main dashboard overview' },
  { id: 'appointments', name: 'Appointments', description: 'Manage patient appointments' },
  { id: 'calendar', name: 'Calendar', description: 'Calendar view' },
  { id: 'patients', name: 'Patients', description: 'Patient management' },
  { id: 'medicines', name: 'Medicines', description: 'Medicine catalog' },
  { id: 'lab_tests', name: 'Lab Tests', description: 'Lab test management' },
  { id: 'procedures', name: 'Procedures', description: 'Medical procedures' },
  { id: 'consultation', name: 'Consultation', description: 'Consultation settings' },
  { id: 'completed', name: 'Completed', description: 'Completed appointments' },
  { id: 'emr', name: 'Medical Records (EMR)', description: 'Electronic medical records' },
  { id: 'follow_ups', name: 'Follow-Ups & Care', description: 'Follow-up scheduling' },
  { id: 'telemedicine', name: 'Telemedicine', description: 'Video consultations' },
  { id: 'schedule', name: 'Schedule & Availability', description: 'Doctor schedule' },
  { id: 'tasks', name: 'Tasks & Notifications', description: 'Task management' },
  { id: 'analytics', name: 'Performance Analytics', description: 'Analytics and reports' },
  { id: 'communication', name: 'Communication', description: 'Messages and communication' },
  { id: 'emergency', name: 'Emergency & Alerts', description: 'Emergency management' },
  { id: 'profile', name: 'Profile & Settings', description: 'Profile settings' },
  { id: 'ambulance', name: 'Ambulance', description: 'Ambulance management' },
  { id: 'staff', name: 'Staff Management', description: 'Staff management' },
  { id: 'pharmacy', name: 'Pharmacy', description: 'Pharmacy inventory' },
  { id: 'blood_bank', name: 'Blood Bank', description: 'Blood bank management' },
  { id: 'billing', name: 'Billing', description: 'Billing and invoices' },
  { id: 'rooms', name: 'Room Allotment', description: 'Room management' },
];

// Define all possible tabs for patients
export const PATIENT_TABS = [
  { id: 'dashboard', name: 'Dashboard', description: 'Patient dashboard home' },
  { id: 'appointments', name: 'Appointments', description: 'View and book appointments' },
  { id: 'records', name: 'Medical Records', description: 'View medical records' },
  { id: 'prescriptions', name: 'Prescriptions', description: 'View prescriptions' },
  { id: 'lab_reports', name: 'Lab Reports', description: 'View lab results' },
  { id: 'billing', name: 'Billing & Payments', description: 'View invoices and payments' },
  { id: 'timeline', name: 'Health Timeline', description: 'Health history timeline' },
  { id: 'communication', name: 'Communication', description: 'Messages and support' },
  { id: 'notifications', name: 'Notifications', description: 'View notifications' },
  { id: 'profile', name: 'Profile & Family', description: 'Profile settings' },
  { id: 'telemedicine', name: 'Telemedicine', description: 'Video consultations' },
  { id: 'feedback', name: 'Feedback & Ratings', description: 'Submit feedback' },
  { id: 'settings', name: 'Settings & Security', description: 'Account settings' },
];

interface TabAccessContextType {
  doctorTabAccess: Record<number, string[]>; // doctorId -> enabled tab ids
  patientTabAccess: Record<number, string[]>; // patientId -> enabled tab ids
  loading: boolean;
  
  // For current user
  myTabAccess: string[];
  hasTabAccess: (tabId: string) => boolean;
  
  // For Super Admin
  fetchDoctorTabAccess: (doctorId: number) => Promise<string[]>;
  fetchPatientTabAccess: (patientId: number) => Promise<string[]>;
  updateDoctorTabAccess: (doctorId: number, tabs: string[]) => Promise<boolean>;
  updatePatientTabAccess: (patientId: number, tabs: string[]) => Promise<boolean>;
}

const TabAccessContext = createContext<TabAccessContextType | undefined>(undefined);

export function TabAccessProvider({ children }: { children: ReactNode }) {
  const { user } = useCustomAuth();
  const [doctorTabAccess, setDoctorTabAccess] = useState<Record<number, string[]>>({});
  const [patientTabAccess, setPatientTabAccess] = useState<Record<number, string[]>>({});
  const [myTabAccess, setMyTabAccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user's tab access on mount
  useEffect(() => {
    const fetchMyAccess = async () => {
      if (!user) {
        setMyTabAccess([]);
        setLoading(false);
        return;
      }

      try {
        const role = user.role;
        if (role === 'super_admin') {
          // Super admin has access to everything
          setMyTabAccess(['all']);
        } else if (role === 'admin') {
          // Doctor - fetch their specific access
          const res = await apiFetch(`/api/access-control/doctor/${user.doctorId || user.id}/tabs`, { method: 'GET' });
          if (res.ok) {
            const data = await res.json();
            setMyTabAccess(data.tabs || DOCTOR_TABS.map(t => t.id)); // Default: all tabs
          } else {
            // Default to all tabs if API fails
            setMyTabAccess(DOCTOR_TABS.map(t => t.id));
          }
        } else if (role === 'patient') {
          // Patient - fetch their specific access
          const res = await apiFetch(`/api/access-control/patient/${user.id}/tabs`, { method: 'GET' });
          if (res.ok) {
            const data = await res.json();
            setMyTabAccess(data.tabs || PATIENT_TABS.map(t => t.id)); // Default: all tabs
          } else {
            // Default to all tabs if API fails
            setMyTabAccess(PATIENT_TABS.map(t => t.id));
          }
        }
      } catch (error) {
        console.error('Error fetching tab access:', error);
        // Default to all tabs on error
        if (user.role === 'admin') {
          setMyTabAccess(DOCTOR_TABS.map(t => t.id));
        } else if (user.role === 'patient') {
          setMyTabAccess(PATIENT_TABS.map(t => t.id));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyAccess();
  }, [user]);

  const hasTabAccess = useCallback((tabId: string): boolean => {
    if (myTabAccess.includes('all')) return true;
    return myTabAccess.includes(tabId);
  }, [myTabAccess]);

  const fetchDoctorTabAccess = useCallback(async (doctorId: number): Promise<string[]> => {
    try {
      const res = await apiFetch(`/api/access-control/doctor/${doctorId}/tabs`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const tabs = data.tabs || DOCTOR_TABS.map(t => t.id);
        setDoctorTabAccess(prev => ({ ...prev, [doctorId]: tabs }));
        return tabs;
      }
    } catch (error) {
      console.error('Error fetching doctor tab access:', error);
    }
    const defaultTabs = DOCTOR_TABS.map(t => t.id);
    setDoctorTabAccess(prev => ({ ...prev, [doctorId]: defaultTabs }));
    return defaultTabs;
  }, []);

  const fetchPatientTabAccess = useCallback(async (patientId: number): Promise<string[]> => {
    try {
      const res = await apiFetch(`/api/access-control/patient/${patientId}/tabs`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const tabs = data.tabs || PATIENT_TABS.map(t => t.id);
        setPatientTabAccess(prev => ({ ...prev, [patientId]: tabs }));
        return tabs;
      }
    } catch (error) {
      console.error('Error fetching patient tab access:', error);
    }
    const defaultTabs = PATIENT_TABS.map(t => t.id);
    setPatientTabAccess(prev => ({ ...prev, [patientId]: defaultTabs }));
    return defaultTabs;
  }, []);

  const updateDoctorTabAccess = useCallback(async (doctorId: number, tabs: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/access-control/doctor/${doctorId}/tabs`, {
        method: 'PUT',
        body: JSON.stringify({ tabs })
      });
      if (res.ok) {
        setDoctorTabAccess(prev => ({ ...prev, [doctorId]: tabs }));
        return true;
      }
    } catch (error) {
      console.error('Error updating doctor tab access:', error);
    }
    return false;
  }, []);

  const updatePatientTabAccess = useCallback(async (patientId: number, tabs: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/access-control/patient/${patientId}/tabs`, {
        method: 'PUT',
        body: JSON.stringify({ tabs })
      });
      if (res.ok) {
        setPatientTabAccess(prev => ({ ...prev, [patientId]: tabs }));
        return true;
      }
    } catch (error) {
      console.error('Error updating patient tab access:', error);
    }
    return false;
  }, []);

  return (
    <TabAccessContext.Provider value={{
      doctorTabAccess,
      patientTabAccess,
      loading,
      myTabAccess,
      hasTabAccess,
      fetchDoctorTabAccess,
      fetchPatientTabAccess,
      updateDoctorTabAccess,
      updatePatientTabAccess,
    }}>
      {children}
    </TabAccessContext.Provider>
  );
}

export function useTabAccess() {
  const context = useContext(TabAccessContext);
  if (!context) {
    throw new Error('useTabAccess must be used within TabAccessProvider');
  }
  return context;
}
