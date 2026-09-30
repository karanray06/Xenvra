import { FileText } from "lucide-react";

export default function BuilderPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <FileText className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">
          Resume Builder
        </h2>
        <p className="text-sm text-text-secondary">
          The full editor with templates, live preview, and AI assistance is coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
