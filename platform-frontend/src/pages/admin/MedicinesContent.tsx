import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type Med = { id:number; name:string; form:string; strength:string; default_frequency:string; duration:string; route:string; };

export default function MedicinesContent(){
  const [name, setName] = useState("");
  const [form, setForm] = useState("");
  const [strength, setStrength] = useState("");
  const [defaultFrequency, setDefaultFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [route, setRoute] = useState("");
  const [items, setItems] = useState<Med[]>([]);

  async function load(){
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/medicines");
    const js = await res.json();
    setItems(js.items || []);
  }
  useEffect(()=>{ load(); }, []);

  async function add(){
    const payload = { name, form, strength, default_frequency: defaultFrequency, duration, route };
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if(!res.ok){ alert("Failed to add"); return; }
    setName(""); setForm(""); setStrength(""); setDefaultFrequency(""); setDuration(""); setRoute("");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Medicines Catalog</h1>
        <Button className="bg-[#1f7a68] hover:bg-[#196758]" onClick={add}>New Medicine</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Brand / Generic Name" value={name} onChange={e=>setName(e.target.value)} className="bg-white" />
            <Input placeholder="Form" value={form} onChange={e=>setForm(e.target.value)} className="bg-white" />
            <Input placeholder="Strength" value={strength} onChange={e=>setStrength(e.target.value)} className="bg-white" />
            <Input placeholder="Default Frequency" value={defaultFrequency} onChange={e=>setDefaultFrequency(e.target.value)} className="bg-white" />
            <Input placeholder="Duration" value={duration} onChange={e=>setDuration(e.target.value)} className="bg-white" />
            <Input placeholder="Route" value={route} onChange={e=>setRoute(e.target.value)} className="bg-white" />
          </div>
          <div className="mt-3"><Button onClick={add}>Add Medicine</Button></div>
        </Card>
        <Card className="p-4">
          <div className="font-medium mb-2">Catalog</div>
          <div className="divide-y">
            {items.map(m => (
              <div key={m.id} className="py-2">
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.form} • {m.strength} • {m.default_frequency} • {m.duration} • {m.route}</div>
              </div>
            ))}
            {!items.length && <div className="text-muted-foreground">Catalog list goes here.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
