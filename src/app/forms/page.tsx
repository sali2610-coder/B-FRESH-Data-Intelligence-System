import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function FormsPage() {
  return (
    <PlaceholderPage
      title="מנוע טפסים"
      description="טפסים דינמיים עם ולידציית Zod ושליחה ל-endpoint חיצוני."
      icon={FileText}
      features={[
        "ולידציה צד-לקוח",
        "הודעות שגיאה בעברית",
        "מצבי טעינה והצלחה",
        "ללא שמירה ב-DB",
        "POST ל-endpoint חיצוני",
      ]}
    />
  );
}
