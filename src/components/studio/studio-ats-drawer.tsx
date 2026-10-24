"use client";

import React, { useMemo } from "react";
import { useStudioStore } from "@/lib/studio/store";
import { validateStudioDocumentATS } from "@/lib/studio/ats-validator";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface StudioATSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudioATSDrawer({ isOpen, onClose }: StudioATSDrawerProps) {
  const { doc } = useStudioStore();

  const atsResult = useMemo(() => {
    return validateStudioDocumentATS(doc);
  }, [doc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 max-w-full flex-col bg-white shadow-2xl border-l border-[#C9CCD1] animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#C9CCD1] px-5 bg-[#E6EEF4]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#5A4032]" />
          <h3 className="text-sm font-bold text-[#241915]">Live ATS Score & Validator</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#5E534D] hover:bg-white hover:text-[#241915] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Score Card */}
        <div className="rounded-2xl border border-[#C9CCD1] bg-[#F5F9FB] p-5 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-[#5A4032] bg-white shadow-sm mx-auto">
            <div className="text-center">
              <span className="text-2xl font-black text-[#241915]">{atsResult.score}</span>
              <span className="text-xs font-bold text-[#8A8F98]">/100</span>
            </div>
          </div>

          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                atsResult.score >= 85
                  ? "bg-emerald-100 text-emerald-800"
                  : atsResult.score >= 70
                    ? "bg-[#DCD3F2] text-[#5A4032]"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              Grade {atsResult.grade} · {atsResult.score >= 85 ? "ATS Ready" : "Optimization Recommended"}
            </span>
            <p className="text-xs text-[#5E534D] mt-2">
              Tested against standard Workday, Taleo, Greenhouse & Lever parser benchmarks.
            </p>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-[#C9CCD1] bg-white p-3 space-y-1">
            <span className="text-[#8A8F98] flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Quantified Numbers
            </span>
            <p className="text-sm font-bold text-[#241915]">
              {atsResult.metricsCount} Metrics Found
            </p>
          </div>
          <div className="rounded-xl border border-[#C9CCD1] bg-white p-3 space-y-1">
            <span className="text-[#8A8F98] flex items-center gap-1">
              <FileText className="h-3 w-3" /> Word Count
            </span>
            <p className="text-sm font-bold text-[#241915]">
              {atsResult.wordCount} Words
            </p>
          </div>
        </div>

        {/* Diagnostic Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#241915]">
            Diagnostic Checklist
          </h4>

          <div className="space-y-2.5">
            {atsResult.checklist.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#C9CCD1] bg-white p-3.5 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#241915]">{item.title}</span>
                  {item.status === "pass" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Pass
                    </span>
                  )}
                  {item.status === "warn" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> Warning
                    </span>
                  )}
                  {item.status === "fail" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                      <XCircle className="h-3.5 w-3.5" /> Missing
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5E534D] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="rounded-xl border border-[#C9CCD1] bg-[#E6EEF4]/60 p-4 space-y-2">
          <h4 className="text-xs font-bold text-[#5A4032] uppercase tracking-wider">
            Standard Sections Detected
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  atsResult.sectionsDetected.contact ? "bg-emerald-500" : "bg-red-400"
                }`}
              />
              <span>Contact Info</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  atsResult.sectionsDetected.experience ? "bg-emerald-500" : "bg-red-400"
                }`}
              />
              <span>Work Experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  atsResult.sectionsDetected.education ? "bg-emerald-500" : "bg-red-400"
                }`}
              />
              <span>Education</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  atsResult.sectionsDetected.skills ? "bg-emerald-500" : "bg-red-400"
                }`}
              />
              <span>Skills List</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#C9CCD1] p-4 bg-[#F5F9FB] flex items-center justify-between text-xs">
        <span className="font-semibold text-[#5A4032] flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Vector Safe PDF
        </span>
        <button
          onClick={onClose}
          className="rounded-lg bg-[#5A4032] px-4 py-2 font-bold text-white hover:bg-[#483328] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
