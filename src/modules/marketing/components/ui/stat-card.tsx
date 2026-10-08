import { cn } from "@/lib/cn";
import type { Stat } from "../../types";
import { Icon } from "./icon";

/** Cifra destacada con su etiqueta. `wide` la hace ocupar toda la fila. */
export function StatCard({ icon, value, label, wide = false }: Stat) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border border-surface-container bg-surface-container-lowest p-6",
        wide && "sm:col-span-2",
      )}
    >
      <Icon name={icon} className="text-[32px] text-primary" />
      <div>
        <p className="mb-1 font-headline-lg text-[32px] font-bold text-on-surface">
          {value}
        </p>
        <p className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </p>
      </div>
    </div>
  );
}
