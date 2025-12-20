import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import ProceduresContent from "./ProceduresContent";

export default function ProceduresPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  return (
    <ConsoleShell>
      <ProceduresContent />
    </ConsoleShell>
  );
}
