import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-10 w-10 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Feedback Fortress
      </h1>
    </div>
  );
}
