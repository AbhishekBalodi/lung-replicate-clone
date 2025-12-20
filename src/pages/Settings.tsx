import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import SettingsContent from "./SettingsContent";

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useCustomAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  return (
    <ConsoleShell>
      <SettingsContent />
    </ConsoleShell>
  );
}
