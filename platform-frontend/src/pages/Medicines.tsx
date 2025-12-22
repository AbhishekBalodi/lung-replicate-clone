import { useEffect, useState } from "react";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Patient {
  id: number | null;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function MedicinesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<Medicine>({
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [savedList, setSavedList] = useState<Medicine[]>([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // ✅ now pulls from backend that merges patients + appointments
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (e: any) {
      toast.error("Failed to load patients: " + e.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveMedicine = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }

    try {
      const payload: any = {
        ...form,
      };

      // ✅ support both patients with id and from appointments
      if (selectedPatient.id) {
        payload.patient_id = selectedPatient.id;
      } else {
        payload.full_name = selectedPatient.full_name;
        payload.email = selectedPatient.email;
        payload.phone = selectedPatient.phone;
      }

      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save medicine");

      toast.success("Medicine saved successfully!");
      setForm({ medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });

      if (selectedPatient.id) loadPatientMedicines(selectedPatient.id.toString());
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const loadPatientMedicines = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${id}`);
      const data = await res.json();
      if (res.ok) setSavedList(data.medicines || []);
    } catch (e: any) {
      toast.error("Failed to load medicines: " + e.message);
    }
  };

  return (
    <ConsoleShell>
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-lg font-semibold mb-4">Prescribe Medicines</h2>

        <div className="mb-6">
          <Label>Select Patient</Label>
          <select
            className="border border-slate-300 rounded-md p-2 w-full mt-1"
            value={selectedPatient ? selectedPatient.email || selectedPatient.phone || "" : ""}
            onChange={(e) => {
              const patient = patients.find(
                (p) => p.email === e.target.value || p.phone === e.target.value
              );
              setSelectedPatient(patient || null);
              if (patient?.id) loadPatientMedicines(patient.id.toString());
              else setSavedList([]);
            }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p, idx) => (
              <option key={idx} value={p.email || p.phone || ""}>
                {p.full_name} {p.email ? `(${p.email})` : p.phone ? `(${p.phone})` : ""}
                {p.id ? "" : " (from appointment)"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Medicine Name</Label>
            <Input name="medicine_name" value={form.medicine_name} onChange={handleChange} />
          </div>
          <div>
            <Label>Dosage</Label>
            <Input name="dosage" value={form.dosage} onChange={handleChange} />
          </div>
          <div>
            <Label>Frequency</Label>
            <Input name="frequency" value={form.frequency} onChange={handleChange} />
          </div>
          <div>
            <Label>Duration</Label>
            <Input name="duration" value={form.duration} onChange={handleChange} />
          </div>
          <div className="col-span-2">
            <Label>Instructions</Label>
            <Input name="instructions" value={form.instructions} onChange={handleChange} />
          </div>
        </div>

        <Button
          onClick={saveMedicine}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save Medicine
        </Button>

        {savedList.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Prescribed Medicines</h3>
            <ul className="list-disc pl-5 space-y-1">
              {savedList.map((m, i) => (
                <li key={i}>
                  {m.medicine_name} – {m.dosage} – {m.frequency} – {m.duration} ({m.instructions})
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </ConsoleShell>
  );
}
