import { Clock } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function SlaPage() {
  return (
    <PlaceholderPage
      title="ניטור SLA"
      description="ניתוח חריגות, זמני תגובה והתראות קריטיות."
      icon={Clock}
      features={[
        "התראות חריגה",
        "היטמפ זמני תגובה",
        "משך טיפול ממוצע",
        "התפלגות עיכובים",
        "אירועים קריטיים",
      ]}
    />
  );
}
