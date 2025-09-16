import { cn } from "@/lib/utils";

export function YamLogo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div
      className={cn("flex items-center gap-2 select-none", onClick ? "cursor-pointer" : "", className)}
      aria-label="YAM - Your AI Meals"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
    >
      <div
        className="h-8 w-8 rounded-lg"
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-elevated)",
        }}
      />
      <span className="text-xl font-extrabold tracking-tight text-gradient-primary">YAM</span>
    </div>
  );
}
