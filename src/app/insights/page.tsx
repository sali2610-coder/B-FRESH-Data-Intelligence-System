import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export default function InsightsPage() {
  return (
    <PlaceholderPage
      title="תובנות AI"
      description="תובנות מבוססות חוקים, מוכן לשילוב עתידי של LLM."
      icon={Sparkles}
      features={[
        "השוואות חודשיות",
        "זיהוי חריגות",
        "מגמות תפעוליות",
        "המלצות אוטומטיות",
        "ניתוח מסונכרן בין סניפים",
      ]}
    />
  );
}
