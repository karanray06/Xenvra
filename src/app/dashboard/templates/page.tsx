import { Grid } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <Grid className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">
          Template Gallery
        </h2>
        <p className="text-sm text-text-secondary">
          15+ professionally designed templates are coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
