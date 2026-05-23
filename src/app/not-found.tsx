import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md gap-3 p-8 text-center">
        <div className="text-bfresh-blue text-5xl font-extrabold">404</div>
        <h1 className="text-xl font-bold">העמוד לא נמצא</h1>
        <p className="text-muted-foreground text-sm">
          הנתיב שביקשת אינו קיים. חזרה למרכז הבקרה.
        </p>
        <Link href="/" className="mt-2">
          <Button className="w-full">חזרה לדשבורד</Button>
        </Link>
      </Card>
    </div>
  );
}
