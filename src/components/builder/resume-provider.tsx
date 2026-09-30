"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type { ResumeData } from "@/lib/schemas/resume";
import { createEmptyResume } from "@/lib/schemas/resume";
import { createClient } from "@/lib/supabase/client";

interface ResumeState {
  id: string | null;
  title: string;
  templateId: string;
  data: ResumeData;
  saving: boolean;
  lastSaved: Date | null;
}

interface ResumeContextType extends ResumeState {
  setTitle: (title: string) => void;
  setTemplateId: (id: string) => void;
  updateData: (updater: (prev: ResumeData) => ResumeData) => void;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
}

interface ResumeProviderProps {
  children: React.ReactNode;
  initialId: string | null;
  initialTitle?: string;
  initialTemplateId?: string;
  initialData?: ResumeData;
  userId: string;
}

export function ResumeProvider({
  children,
  initialId,
  initialTitle = "Untitled Resume",
  initialTemplateId = "modern-1",
  initialData,
  userId,
}: ResumeProviderProps) {
  const [state, setState] = useState<ResumeState>({
    id: initialId,
    title: initialTitle,
    templateId: initialTemplateId,
    data: initialData || createEmptyResume(),
    saving: false,
    lastSaved: null,
  });

  const supabase = createClient();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  // Debounced autosave
  const triggerSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const s = stateRef.current;
      setState((p) => ({ ...p, saving: true }));

      try {
        if (s.id) {
          await supabase
            .from("resumes")
            .update({
              title: s.title,
              template_id: s.templateId,
              data: s.data as unknown as Record<string, unknown>,
            })
            .eq("id", s.id);
        } else {
          const { data: newResume } = await supabase
            .from("resumes")
            .insert({
              user_id: userId,
              title: s.title,
              template_id: s.templateId,
              data: s.data as unknown as Record<string, unknown>,
            })
            .select("id")
            .single();

          if (newResume) {
            setState((p) => ({ ...p, id: newResume.id }));
            // Update URL without reload
            const url = new URL(window.location.href);
            url.searchParams.set("id", newResume.id);
            window.history.replaceState({}, "", url.toString());
          }
        }
        setState((p) => ({ ...p, saving: false, lastSaved: new Date() }));
      } catch {
        setState((p) => ({ ...p, saving: false }));
      }
    }, 1500);
  }, [supabase, userId]);

  const setTitle = useCallback(
    (title: string) => {
      setState((p) => ({ ...p, title }));
      triggerSave();
    },
    [triggerSave]
  );

  const setTemplateId = useCallback(
    (templateId: string) => {
      setState((p) => ({ ...p, templateId }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateData = useCallback(
    (updater: (prev: ResumeData) => ResumeData) => {
      setState((p) => ({ ...p, data: updater(p.data) }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateField = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      setState((p) => ({ ...p, data: { ...p.data, [key]: value } }));
      triggerSave();
    },
    [triggerSave]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <ResumeContext.Provider
      value={{ ...state, setTitle, setTemplateId, updateData, updateField }}
    >
      {children}
    </ResumeContext.Provider>
  );
}
