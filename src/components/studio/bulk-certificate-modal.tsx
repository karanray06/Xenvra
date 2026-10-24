"use client";

import React, { useState } from "react";
import { useStudioStore } from "@/lib/studio/store";
import {
  parseRecipientCSV,
  generateBulkCertificatesZIP,
  type BulkRecipient,
} from "@/lib/studio/bulk-generator";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

interface BulkCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `Name,Role,Event,Date
Aarav Sharma,First Place,National Hackathon 2026,24 Oct 2026
Ananya Verma,Runner Up,National Hackathon 2026,24 Oct 2026
Rohan Mehta,Best Innovation,National Hackathon 2026,24 Oct 2026
Diya Patel,Finalist,National Hackathon 2026,24 Oct 2026`;

export function BulkCertificateModal({ isOpen, onClose }: BulkCertificateModalProps) {
  const { doc } = useStudioStore();
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV);
  const [recipients, setRecipients] = useState<BulkRecipient[]>(() =>
    parseRecipientCSV(SAMPLE_CSV)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCsvChange = (text: string) => {
    setCsvContent(text);
    setErrorMsg(null);
    try {
      const parsed = parseRecipientCSV(text);
      setRecipients(parsed);
    } catch {
      setErrorMsg("Failed to parse CSV format.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleCsvChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (recipients.length === 0) {
      setErrorMsg("Please add at least one recipient with a name.");
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: recipients.length });
    setErrorMsg(null);

    try {
      const { blob } = await generateBulkCertificatesZIP(
        doc,
        recipients,
        true,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `xenvra-bulk-certificates-${recipients.length}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to generate bulk archive.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#C9CCD1] bg-white p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C9CCD1] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-[#E6EEF4] p-2 text-[#5A4032]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241915]">
                Bulk Certificate & Placard Generator
              </h3>
              <p className="text-xs text-[#5E534D]">
                Upload a CSV to generate a personalized vector PDF for every recipient in a single ZIP.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#8A8F98] hover:bg-[#F6F1EE] hover:text-[#241915]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CSV Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#241915]">
              Recipients CSV Data
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A4032] bg-[#E6EEF4] hover:bg-[#DCD3F2] px-2.5 py-1 rounded-md transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload .csv</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <textarea
            value={csvContent}
            onChange={(e) => handleCsvChange(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-[#C9CCD1] bg-[#F5F9FB] p-3 text-xs font-mono text-[#241915] focus:bg-white focus:border-[#5A4032] outline-none transition-colors"
            placeholder="Name,Role,Event,Date"
          />

          <p className="text-[11px] text-[#8A8F98]">
            Columns recognized: <code>Name</code>, <code>Role / Title</code>, <code>Event / Competition</code>, <code>Date</code>.
          </p>
        </div>

        {/* Recipients Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#241915]">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[#5A4032]" />
              Parsed Recipients ({recipients.length})
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ready for generation
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto rounded-xl border border-[#C9CCD1] bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E6EEF4] border-b border-[#C9CCD1] text-[#5A4032] font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Role / Category</th>
                  <th className="p-2.5">Event</th>
                  <th className="p-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EEF4]">
                {recipients.map((rec, i) => (
                  <tr key={i} className="hover:bg-[#F5F9FB]">
                    <td className="p-2.5 text-[#8A8F98] font-mono">{i + 1}</td>
                    <td className="p-2.5 font-bold text-[#241915]">{rec.name}</td>
                    <td className="p-2.5 text-[#5E534D]">{rec.role || "—"}</td>
                    <td className="p-2.5 text-[#5E534D]">{rec.event || "—"}</td>
                    <td className="p-2.5 text-[#5E534D]">{rec.date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress bar when generating */}
        {isGenerating && (
          <div className="space-y-1.5 bg-[#E6EEF4] p-3 rounded-xl">
            <div className="flex justify-between text-xs font-semibold text-[#5A4032]">
              <span>Generating Vector PDFs...</span>
              <span>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full h-2 bg-[#C9CCD1] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A4032] transition-all duration-150"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#C9CCD1] pt-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-[#5E534D] hover:bg-[#F6F1EE]"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || recipients.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5A4032] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#483328] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Bundling ZIP ({progress.current}/{progress.total})...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Generate & Download ZIP ({recipients.length} PDFs)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
