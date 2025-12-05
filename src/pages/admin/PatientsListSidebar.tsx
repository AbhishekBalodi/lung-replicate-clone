import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function PatientsListSidebar({
  onSelect,
}: {
  onSelect: (patient: any) => void;
}) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const loadPatients = async () => {
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatients(data);
  };

  const searchPatients = async () => {
    const res = await fetch(`/api/patients?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-emerald-900 mb-4">Patients</h2>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchPatients()}
        />
        <Button onClick={searchPatients}>Search</Button>
      </div>

      <div className="space-y-2 max-h-[65vh] overflow-y-auto">
        {patients.map((p: any) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}   // ✅ Send entire patient object
            className="w-full flex items-center gap-3 p-3 rounded hover:bg-emerald-100 text-left"
          >
            <User className="h-5 w-5 text-emerald-700" />
            <div>
              <div className="font-medium">{p.full_name}</div>
              <div className="text-sm text-gray-600">{p.phone}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
