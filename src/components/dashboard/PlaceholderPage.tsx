import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </header>

      <Card className="grid place-items-center gap-4 py-16 text-center">
        <div className="bg-bfresh-blue/10 text-bfresh-blue grid size-16 place-items-center rounded-3xl">
          <Icon className="size-7" />
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold">בקרוב</div>
          <p className="text-muted-foreground max-w-md text-sm">
            המסך נמצא בפיתוח. בפאזה הבאה ייכללו:
          </p>
        </div>
        <div className="flex max-w-xl flex-wrap justify-center gap-2">
          {features.map((f) => (
            <Badge key={f} variant="secondary" className="rounded-full text-xs">
              {f}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
