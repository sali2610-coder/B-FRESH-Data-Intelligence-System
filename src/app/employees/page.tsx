import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function EmployeesPage() {
  return (
    <PlaceholderPage
      title="ניתוח עובדים"
      description="מדדי ביצוע אישיים לכל עובד ברשת."
      icon={Users}
      features={[
        "משימות פתוחות",
        "משימות שנסגרו",
        "ממוצע SLA",
        "משימות בפיגור",
        "מגמות חודשיות",
        "התפלגות סטטוסים",
      ]}
    />
  );
}
