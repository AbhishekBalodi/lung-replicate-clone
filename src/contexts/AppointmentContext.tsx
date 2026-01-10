import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiFetch } from "@/lib/api";
interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  created_at?: string | null;
  status?: string | null;
  department?: string | null;
}

interface PatientDetails {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  appointments?: Appointment[];
  medicines?: any[];
  lab_tests?: any[];
  procedures?: any[];
}

interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  loading: boolean;
  fetchAppointments: () => Promise<void>;
  markAppointmentDone: (id: number) => Promise<boolean>;
  cancelAppointment: (id: number) => Promise<boolean>;
  // Patient details for expanded view - keyed by appointment id
  patientDetailsCache: Record<number, PatientDetails | null>;
  loadPatientDetails: (appt: Appointment) => Promise<PatientDetails | null>;
  refreshPatientDetails: (apptId: number, email: string, phone: string) => Promise<void>;
  // Notify when prescription is added
  notifyPrescriptionAdded: (patientId: number) => void;
  prescriptionUpdateTrigger: number;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const API_BASE = "/api/appointment";

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [patientDetailsCache, setPatientDetailsCache] = useState<Record<number, PatientDetails | null>>({});
  const [prescriptionUpdateTrigger, setPrescriptionUpdateTrigger] = useState(0);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(API_BASE, { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching appointments:", e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAppointmentDone = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`${API_BASE}/${id}/done`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to mark as done");

      // Update local state immediately without refetching
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "done" } : a)));
      return true;
    } catch (e) {
      console.error("Error marking appointment done:", e);
      return false;
    }
  }, []);

  const cancelAppointment = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to cancel appointment");

      // Remove from local state immediately
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      return true;
    } catch (e) {
      console.error("Error cancelling appointment:", e);
      return false;
    }
  }, []);

  const fetchPatientRecord = async (email: string, phone: string) => {
    try {
      const q = email ? email : phone;
      const res = await apiFetch(`/api/patients?q=${encodeURIComponent(q)}`, { method: "GET" });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0];
    } catch {
      return null;
    }
  };

  const fetchPatientFullData = async (patientId: number) => {
    try {
      const res = await apiFetch(`/api/patients/${patientId}`, { method: "GET" });
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  };

  const loadPatientDetails = useCallback(async (appt: Appointment): Promise<PatientDetails | null> => {
    // Check cache first
    if (patientDetailsCache[appt.id]) {
      return patientDetailsCache[appt.id];
    }

    const record = await fetchPatientRecord(appt.email, appt.phone);
    if (!record) {
      setPatientDetailsCache(prev => ({ ...prev, [appt.id]: null }));
      return null;
    }

    const fullData = await fetchPatientFullData(record.id);
    const histRes = await apiFetch(`/api/appointment?email=${encodeURIComponent(appt.email)}`, { method: "GET" });
    const history = await histRes.json();

    const details: PatientDetails = {
      ...record,
      appointments: history || [],
      medicines: fullData?.medicines || [],
      lab_tests: fullData?.lab_tests || [],
      procedures: fullData?.procedures || []
    };

    setPatientDetailsCache(prev => ({ ...prev, [appt.id]: details }));
    return details;
  }, [patientDetailsCache]);

  const refreshPatientDetails = useCallback(async (apptId: number, email: string, phone: string) => {
    const record = await fetchPatientRecord(email, phone);
    if (!record) return;

    const fullData = await fetchPatientFullData(record.id);
    const histRes = await apiFetch(`/api/appointment?email=${encodeURIComponent(email)}`, { method: "GET" });
    const history = await histRes.json();

    const details: PatientDetails = {
      ...record,
      appointments: history || [],
      medicines: fullData?.medicines || [],
      lab_tests: fullData?.lab_tests || [],
      procedures: fullData?.procedures || []
    };

    setPatientDetailsCache(prev => ({ ...prev, [apptId]: details }));
  }, []);

  const notifyPrescriptionAdded = useCallback((patientId: number) => {
    // Increment trigger to notify components to refresh
    setPrescriptionUpdateTrigger(prev => prev + 1);
    
    // Also refresh any cached patient details that match this patient
    // We'll iterate through cache and refresh matching entries
    Object.entries(patientDetailsCache).forEach(async ([apptId, details]) => {
      if (details && details.id === patientId) {
        const fullData = await fetchPatientFullData(patientId);
        if (fullData) {
          setPatientDetailsCache(prev => ({
            ...prev,
            [apptId]: {
              ...prev[Number(apptId)]!,
              medicines: fullData.medicines || [],
              lab_tests: fullData.lab_tests || [],
              procedures: fullData.procedures || []
            }
          }));
        }
      }
    });
  }, [patientDetailsCache]);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        setAppointments,
        loading,
        fetchAppointments,
        markAppointmentDone,
        cancelAppointment,
        patientDetailsCache,
        loadPatientDetails,
        refreshPatientDetails,
        notifyPrescriptionAdded,
        prescriptionUpdateTrigger
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return context;
}
