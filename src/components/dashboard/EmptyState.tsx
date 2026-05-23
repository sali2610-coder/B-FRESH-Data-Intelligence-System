import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "אין נתונים להצגה",
  description = "נסה לשנות את הסינון או לרענן את הנתונים.",
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="bg-muted/60 grid size-14 place-items-center rounded-2xl">
        <Icon className="size-6" />
      </div>
      <div className="text-foreground text-sm font-semibold">{title}</div>
      <p className="max-w-xs text-xs">{description}</p>
    </div>
  );
}
