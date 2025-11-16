import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Procedure = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  duration: string | null;
  preparation_instructions: string | null;
  created_at?: string;
};

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

export default function ProceduresPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [preparationInstructions, setPreparationInstructions] = useState("");
  const [items, setItems] = useState<Procedure[]>([]);

  const load = async () => {
    try {
      const res = await fetch(`${API_ROOT}/procedures/catalog`);
      if (!res.ok) throw new Error("Failed to load procedures");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Error loading procedures: " + err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) {
      toast.error("Procedure name is required");
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
        duration: duration.trim() || null,
        preparation_instructions: preparationInstructions.trim() || null,
      };
      const res = await fetch(`${API_ROOT}/procedures/catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const js = await res.json();
        throw new Error(js?.error || "Failed to add procedure");
      }
      toast.success("Procedure added successfully");
      setName("");
      setCategory("");
      setDescription("");
      setDuration("");
      setPreparationInstructions("");
      await load();
    } catch (err: any) {
      toast.error("Error adding procedure: " + err.message);
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-emerald-900">Procedures Catalogue</h1>
          <Button onClick={add} className="bg-emerald-700 hover:bg-emerald-800">
            Add Procedure
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Form */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-emerald-900">Add New Procedure</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-emerald-900">Procedure Name*</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Bronchoscopy"
                  className="bg-white"
                />
              </div>

              <div>
                <Label className="text-emerald-900">Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Diagnostic"
                  className="bg-white"
                />
              </div>

              <div>
                <Label className="text-emerald-900">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the procedure"
                  className="bg-white min-h-[80px]"
                />
              </div>

              <div>
                <Label className="text-emerald-900">Duration</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 30-45 minutes"
                  className="bg-white"
                />
              </div>

              <div>
                <Label className="text-emerald-900">Preparation Instructions</Label>
                <Textarea
                  value={preparationInstructions}
                  onChange={(e) => setPreparationInstructions(e.target.value)}
                  placeholder="Instructions for patient preparation"
                  className="bg-white min-h-[80px]"
                />
              </div>

              <Button onClick={add} className="w-full bg-emerald-700 hover:bg-emerald-800">
                Add Procedure
              </Button>
            </div>
          </Card>

          {/* List */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-emerald-900">
              Procedures Catalog ({items.length})
            </h3>
            {items.length === 0 ? (
              <p className="text-emerald-700 text-center py-8">No procedures in catalog yet</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {items.map((proc) => (
                  <div key={proc.id} className="p-4 bg-emerald-50 rounded-lg">
                    <div className="font-medium text-emerald-900 text-lg">{proc.name}</div>
                    {proc.category && (
                      <div className="text-sm text-emerald-700 mt-1">Category: {proc.category}</div>
                    )}
                    {proc.description && (
                      <div className="text-sm text-emerald-700 mt-1">{proc.description}</div>
                    )}
                    {proc.duration && (
                      <div className="text-sm text-emerald-700 mt-1">Duration: {proc.duration}</div>
                    )}
                    {proc.preparation_instructions && (
                      <div className="text-sm text-emerald-700 mt-2">
                        <span className="font-medium">Preparation:</span> {proc.preparation_instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
