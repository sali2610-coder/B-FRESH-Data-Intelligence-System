import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "אירעה שגיאה בטעינת הנתונים",
  description = "נסה לרענן או לבדוק את חיבור הרשת.",
  onRetry,
}: {
  message?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="relative">
        <div className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-600 ring-1 ring-rose-500/20">
          <AlertTriangle className="size-7" />
        </div>
        <span className="from-rose-500/20 pointer-events-none absolute -inset-3 -z-10 rounded-full bg-gradient-radial to-transparent blur-xl" />
      </div>
      <div className="space-y-1">
        <div className="text-foreground text-sm font-bold">{message}</div>
        <p className="text-muted-foreground max-w-xs text-xs">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" onClick={onRetry} className="mt-2 gap-1 rounded-xl">
          נסה שוב
        </Button>
      )}
    </div>
  );
}
