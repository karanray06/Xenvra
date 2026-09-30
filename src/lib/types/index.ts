// ===== App-wide TypeScript types =====

export type Plan = "free" | "beginner" | "pro";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  plan: Plan;
  status: "active" | "expired" | "cancelled";
  current_period_end: string | null;
  created_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  action: string;
  tokens: number;
  created_at: string;
}

// Navigation types
export type DashboardView =
  | "dashboard"
  | "builder"
  | "templates"
  | "settings"
  | "billing";
