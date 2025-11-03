import ConsoleShell from "../layouts/ConsoleShell";

export default function PatientsPage() {
  return (
    <ConsoleShell>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-sm font-medium text-slate-600">Patients</div>
          <div className="text-4xl font-semibold mt-2">—</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-sm font-medium text-slate-600">New This Week</div>
          <div className="text-4xl font-semibold mt-2">—</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
        Hook this page to your patients data when ready.
      </div>
    </ConsoleShell>
  );
}
