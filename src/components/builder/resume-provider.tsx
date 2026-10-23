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

export type SaveStatus = "saved" | "saving" | "offline" | "error";

interface RemoteSnapshot {
  title: string;
  templateId: string;
  data: ResumeData;
  version: number;
}

interface ResumeState {
  id: string | null;
  title: string;
  templateId: string;
  data: ResumeData;
  version: number;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  errorMessage: string | null;
  alsoOpenInOtherDevice: boolean;
  conflictRemote: RemoteSnapshot | null;
}

interface ResumeContextType extends ResumeState {
  saving: boolean; // Backwards compatible shorthand
  setTitle: (title: string) => void;
  setTemplateId: (id: string) => void;
  updateData: (updater: (prev: ResumeData) => ResumeData) => void;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  retrySave: () => void;
  resolveConflictReload: () => void;
  resolveConflictKeepMine: () => void;
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
  initialData?: ResumeData | null;
  initialVersion?: number;
  userId: string;
}

export function ResumeProvider({
  children,
  initialId,
  initialTitle = "Untitled Resume",
  initialTemplateId = "modern-1",
  initialData,
  initialVersion = 1,
  userId,
}: ResumeProviderProps) {
  const [state, setState] = useState<ResumeState>({
    id: initialId,
    title: initialTitle,
    templateId: initialTemplateId,
    data: initialData || createEmptyResume(),
    version: initialVersion,
    saveStatus: "saved",
    lastSaved: initialId ? new Date() : null,
    errorMessage: null,
    alsoOpenInOtherDevice: false,
    conflictRemote: null,
  });

  const supabase = createClient();
  const stateRef = useRef(state);
  const dirtyRef = useRef(false);
  const isOnlineRef = useRef(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingPromiseRef = useRef<Promise<string | null> | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const tabIdRef = useRef<string>("");

  useEffect(() => {
    if (!tabIdRef.current) {
      tabIdRef.current = Math.random().toString(36).substring(2, 9);
    }
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Flush unsaved data via keepalive fetch
  const flushUnsaved = useCallback(() => {
    if (!dirtyRef.current) return;
    const s = stateRef.current;
    if (!s.id) return; // Cannot beacon without id

    const payload = JSON.stringify({
      title: s.title,
      template_id: s.templateId,
      data: s.data,
      version: s.version,
    });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        const sent = navigator.sendBeacon(`/api/resumes/${s.id}`, blob);
        if (sent) return;
      }
    } catch {
      // Fallback to keepalive fetch
    }

    try {
      fetch(`/api/resumes/${s.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }, []);

  // Save worker with exponential backoff and serialization
  const performSave = useCallback(async () => {
    if (!dirtyRef.current) return;
    if (!isOnlineRef.current) {
      setState((p) => ({ ...p, saveStatus: "offline" }));
      return;
    }

    setState((p) => ({ ...p, saveStatus: "saving", errorMessage: null }));

    const s = stateRef.current;
    let currentId = s.id;

    // Helper for retrying an async operation with backoff
    async function retryOperation<T>(
      fn: () => Promise<T>,
      retries = 3,
      delayMs = 800
    ): Promise<T> {
      try {
        return await fn();
      } catch (err) {
        if (retries <= 1 || !isOnlineRef.current) throw err;
        await new Promise((res) => setTimeout(res, delayMs));
        return retryOperation(fn, retries - 1, delayMs * 2);
      }
    }

    try {
      // Step 1: Handle creation if id is not yet assigned
      if (!currentId) {
        if (creatingPromiseRef.current) {
          currentId = await creatingPromiseRef.current;
        } else {
          creatingPromiseRef.current = (async () => {
            const { data: newResume } = await retryOperation(
              async () => {
                const res = await supabase
                  .from("resumes")
                  .insert({
                    user_id: userId,
                    title: stateRef.current.title,
                    template_id: stateRef.current.templateId,
                    data: stateRef.current.data as unknown as Record<string, unknown>,
                    version: 1,
                  })
                  .select("id, version")
                  .maybeSingle();
                if (res.error) throw new Error(res.error.message);
                return res;
              }
            );

            if (!newResume?.id) {
              throw new Error("Failed to create resume: No ID returned");
            }

            return newResume.id;
          })();

          currentId = await creatingPromiseRef.current;
          creatingPromiseRef.current = null;

          if (currentId) {
            setState((p) => ({
              ...p,
              id: currentId,
              version: 1,
            }));

            // Sync URL id without page reload
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("id", currentId);
              window.history.replaceState({}, "", url.toString());
            }
          }
        }
      }

      // Step 2: Update existing record
      if (currentId) {
        const nextVersion = stateRef.current.version + 1;
        const snapshot = stateRef.current;

        await retryOperation(async () => {
          const res = await supabase
            .from("resumes")
            .update({
              title: snapshot.title,
              template_id: snapshot.templateId,
              data: snapshot.data as unknown as Record<string, unknown>,
              version: nextVersion,
            })
            .eq("id", currentId);

          if (res.error) throw new Error(res.error.message);
          return res;
        });

        dirtyRef.current = false;
        setState((p) => ({
          ...p,
          version: nextVersion,
          saveStatus: "saved",
          lastSaved: new Date(),
          errorMessage: null,
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      if (!isOnlineRef.current) {
        setState((p) => ({ ...p, saveStatus: "offline" }));
      } else {
        setState((p) => ({
          ...p,
          saveStatus: "error",
          errorMessage: msg,
        }));
      }
    }
  }, [supabase, userId]);

  // Enqueue a serialized save task
  const queueSave = useCallback(() => {
    saveQueueRef.current = saveQueueRef.current
      .then(performSave)
      .catch(() => {});
  }, [performSave]);

  // Debounced save trigger
  const triggerSave = useCallback(() => {
    dirtyRef.current = true;
    if (!isOnlineRef.current) {
      setState((p) => ({ ...p, saveStatus: "offline" }));
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      queueSave();
    }, 1200);
  }, [queueSave]);

  const retrySave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    queueSave();
  }, [queueSave]);

  // Resolve conflict: reload remote version
  const resolveConflictReload = useCallback(() => {
    if (!state.conflictRemote) return;
    const r = state.conflictRemote;
    dirtyRef.current = false;
    setState((p) => ({
      ...p,
      title: r.title,
      templateId: r.templateId,
      data: r.data,
      version: r.version,
      conflictRemote: null,
      saveStatus: "saved",
      lastSaved: new Date(),
    }));
  }, [state.conflictRemote]);

  // Resolve conflict: force keep local changes
  const resolveConflictKeepMine = useCallback(() => {
    if (!state.conflictRemote) return;
    const newVersion = state.conflictRemote.version + 1;
    setState((p) => ({
      ...p,
      version: newVersion,
      conflictRemote: null,
    }));
    dirtyRef.current = true;
    queueSave();
  }, [state.conflictRemote, queueSave]);

  // Real-time postgres_changes subscription & presence channel
  useEffect(() => {
    const resumeId = state.id;
    if (!resumeId) return;

    // 1. Changes subscription
    const changesChannel = supabase
      .channel(`resumes_realtime_${resumeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "resumes",
          filter: `id=eq.${resumeId}`,
        },
        (payload) => {
          const remote = payload.new as {
            version?: number;
            title?: string;
            template_id?: string;
            data?: Record<string, unknown>;
          };
          const remoteVersion = remote.version ?? 1;

          if (remoteVersion > stateRef.current.version) {
            const remoteSnapshot: RemoteSnapshot = {
              title: remote.title || stateRef.current.title,
              templateId: remote.template_id || stateRef.current.templateId,
              data: (remote.data as unknown as ResumeData) || stateRef.current.data,
              version: remoteVersion,
            };

            if (!dirtyRef.current) {
              // Not mid-edit: automatically apply remote update
              setState((p) => ({
                ...p,
                title: remoteSnapshot.title,
                templateId: remoteSnapshot.templateId,
                data: remoteSnapshot.data,
                version: remoteVersion,
                saveStatus: "saved",
                lastSaved: new Date(),
              }));
            } else {
              // Mid-edit conflict: prompt user non-blockingly
              setState((p) => ({
                ...p,
                conflictRemote: remoteSnapshot,
              }));
            }
          }
        }
      )
      .subscribe();

    // 2. Presence channel (resume:<id>)
    const presenceChannel = supabase
      .channel(`resume:${resumeId}`)
      .on("presence", { event: "sync" }, () => {
        const presences = presenceChannel.presenceState();
        const clientCount = Object.keys(presences).length;
        setState((p) => ({ ...p, alsoOpenInOtherDevice: clientCount > 1 }));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            tabId: tabIdRef.current,
            userId,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(changesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [state.id, supabase, userId]);

  // Connectivity listeners
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      if (dirtyRef.current) {
        queueSave();
      } else {
        setState((p) => (p.saveStatus === "offline" ? { ...p, saveStatus: "saved" } : p));
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      setState((p) => ({ ...p, saveStatus: "offline" }));
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushUnsaved();
      }
    };

    const handlePageHide = () => {
      flushUnsaved();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      flushUnsaved();
    };
  }, [flushUnsaved, queueSave]);

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

  return (
    <ResumeContext.Provider
      value={{
        ...state,
        saving: state.saveStatus === "saving",
        setTitle,
        setTemplateId,
        updateData,
        updateField,
        retrySave,
        resolveConflictReload,
        resolveConflictKeepMine,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}
