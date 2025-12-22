import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScheduleTab from "./tabs/ScheduleTab";
import PatientsTab from "./tabs/PatientsTab";
import TasksTab from "./tabs/TasksTab";
import StatsTab from "./tabs/StatsTab";

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  status?: string | null;
}

interface DashboardTabsProps {
  appointments: Appointment[];
  onViewAppointment: (appointment: Appointment) => void;
}

export default function DashboardTabs({ appointments, onViewAppointment }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("schedule");

  // Filter today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointment_date === today && a.status !== "done");
  
  // Upcoming appointments (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingAppointments = appointments.filter(a => {
    const apptDate = new Date(a.appointment_date);
    const todayDate = new Date(today);
    return apptDate > todayDate && apptDate <= nextWeek && a.status !== "done";
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-slate-800/50 border border-slate-700 p-1 rounded-lg">
        <TabsTrigger 
          value="schedule" 
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 px-6"
        >
          Schedule
        </TabsTrigger>
        <TabsTrigger 
          value="patients" 
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 px-6"
        >
          Patients
        </TabsTrigger>
        <TabsTrigger 
          value="tasks" 
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 px-6"
        >
          Tasks
        </TabsTrigger>
        <TabsTrigger 
          value="stats" 
          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 px-6"
        >
          Stats
        </TabsTrigger>
      </TabsList>

      <TabsContent value="schedule" className="mt-6">
        <ScheduleTab 
          todaysAppointments={todaysAppointments} 
          upcomingAppointments={upcomingAppointments}
          onViewAppointment={onViewAppointment}
        />
      </TabsContent>

      <TabsContent value="patients" className="mt-6">
        <PatientsTab todaysAppointments={todaysAppointments} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-6">
        <TasksTab />
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <StatsTab appointments={appointments} />
      </TabsContent>
    </Tabs>
  );
}
