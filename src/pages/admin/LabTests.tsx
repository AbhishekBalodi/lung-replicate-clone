import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "../../layouts/ConsoleShell";
import LabTestsContent from "./LabTestsContent";

export default function LabTests() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  return (
    <ConsoleShell>
      <LabTestsContent />
    </ConsoleShell>
  );
}
