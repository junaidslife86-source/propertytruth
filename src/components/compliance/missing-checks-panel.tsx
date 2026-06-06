import { cn } from "@/lib/utils";

interface MissingChecksPanelProps {
  items: string[];
  className?: string;
}

export function MissingChecksPanel({ items, className }: MissingChecksPanelProps) {
  if (!items.length) return null;

  return (
    <section
      className={cn(
        "rounded-xl bg-surface-container-low p-6",
        className,
      )}
    >
      <h3 className="mb-4 font-[family-name:var(--font-manrope)] text-lg font-semibold">
        Could not verify
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm text-on-surface-variant"
          >
            <span className="text-evidence-missing">—</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-on-surface-variant">
        Missing data is not the same as &ldquo;no issue&rdquo;. Grey is not green.
      </p>
    </section>
  );
}
