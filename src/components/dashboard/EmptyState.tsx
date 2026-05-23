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
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="relative">
        <div className="bg-muted/60 grid size-16 place-items-center rounded-3xl ring-1 ring-border/40">
          <Icon className="size-7 opacity-70" />
        </div>
        <span className="from-bfresh-blue/20 to-transparent pointer-events-none absolute -inset-3 -z-10 rounded-full bg-gradient-radial blur-xl" />
      </div>
      <div className="text-foreground text-sm font-bold">{title}</div>
      <p className="max-w-xs text-xs leading-relaxed">{description}</p>
    </div>
  );
}
