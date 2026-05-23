import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "אירעה שגיאה בטעינת הנתונים",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-600">
        <AlertTriangle className="size-6" />
      </div>
      <div className="text-foreground text-sm font-semibold">{message}</div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          נסה שוב
        </Button>
      )}
    </div>
  );
}
