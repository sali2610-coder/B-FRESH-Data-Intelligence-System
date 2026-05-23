import { Building2 } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function BranchesPage() {
  return (
    <PlaceholderPage
      title="ניתוח סניפים"
      description="ציון תפעולי, השוואה לרשת ומגמות לפי סניף."
      icon={Building2}
      features={[
        "ציון תפעולי",
        "ציון SLA",
        "בעיות פתוחות",
        "מגמות נפח פעילות",
        "דירוג סניפים",
        "השוואה לממוצע הרשת",
      ]}
    />
  );
}
