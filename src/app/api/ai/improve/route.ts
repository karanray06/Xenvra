import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndRecordAiUsage } from "@/lib/plan-limits";
import { generateAiCompletion } from "@/lib/ai";
import { z } from "zod";

const improveRequestSchema = z.object({
  action: z.enum(["strengthen", "shorten", "fix_grammar", "generate_summary"]),
  text: z.string().min(3).max(1500),
  context: z
    .object({
      role: z.string().optional(),
      skills: z.array(z.string()).optional(),
    })
    .optional(),
});

function smartHeuristicEnhance(
  action: "strengthen" | "shorten" | "fix_grammar" | "generate_summary",
  text: string,
  context?: { role?: string; skills?: string[] }
): string {
  const cleaned = text.trim();

  if (action === "generate_summary") {
    const role = context?.role || "Results-driven professional";
    const skillsList = context?.skills && context.skills.length > 0
      ? `specializing in ${context.skills.slice(0, 4).join(", ")}`
      : "with a proven track record of delivering measurable business impact";
    return `${role} ${skillsList}. Experienced in leading cross-functional initiatives, optimizing operational workflows, and driving high-velocity execution. Dedicated to building scalable solutions and fostering collaborative, high-performing team cultures.`;
  }

  if (action === "strengthen") {
    // Replace weak phrases with strong action verbs
    const weakMap: Record<string, string> = {
      "responsible for": "Spearheaded",
      "helped with": "Collaborated on",
      "worked on": "Engineered and delivered",
      "did": "Executed",
      "made": "Architected",
      "managed": "Orchestrated",
      "handled": "Streamlined",
      "assisted in": "Facilitated",
      "looked after": "Oversaw",
      "was part of": "Contributed directly to",
    };

    let result = cleaned;
    for (const [weak, strong] of Object.entries(weakMap)) {
      const reg = new RegExp(`^${weak}\\b`, "i");
      if (reg.test(result)) {
        result = result.replace(reg, strong);
        break;
      }
      const midReg = new RegExp(`\\b${weak}\\b`, "gi");
      if (midReg.test(result)) {
        result = result.replace(midReg, strong);
      }
    }

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);
    if (!result.endsWith(".")) result += ".";
    return result;
  }

  if (action === "shorten") {
    // Strip redundant filler words
    const fillerWords = [
      /\bin order to\b/gi,
      /\bas well as\b/gi,
      /\bvarious different\b/gi,
      /\bdue to the fact that\b/gi,
      /\bfor the purpose of\b/gi,
      /\bat the present time\b/gi,
      /\bneedless to say\b/gi,
    ];

    let shortened = cleaned;
    shortened = shortened.replace(/\bin order to\b/gi, "to");
    shortened = shortened.replace(/\bas well as\b/gi, "and");
    shortened = shortened.replace(/\bdue to the fact that\b/gi, "because");
    fillerWords.forEach((regex) => {
      shortened = shortened.replace(regex, "");
    });
    shortened = shortened.replace(/\s{2,}/g, " ").trim();
    return shortened;
  }

  if (action === "fix_grammar") {
    let fixed = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    fixed = fixed.replace(/\s+,/g, ",").replace(/\s+\./g, ".");
    fixed = fixed.replace(/,\s*,/g, ",");
    fixed = fixed.replace(/\bi\b/g, "I");
    if (!/[.!?]$/.test(fixed)) fixed += ".";
    return fixed;
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = improveRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { action, text, context } = parseResult.data;

    // Quota check and rate limit
    const quota = await checkAndRecordAiUsage(user.id, 1);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Daily AI action quota reached for your plan. Upgrade your plan on the Billing page to unlock more daily AI suggestions.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // AI Completion (Groq / OpenAI) with heuristic fallback
    const systemPrompt = `You are an executive resume editor at an elite career advisory firm.
Your task is to refine resume text according to the requested action:
- strengthen: Start with a powerful action verb, highlight measurable impact, eliminate passive voice.
- shorten: Remove filler words, make punchy and concise while preserving all metrics.
- fix_grammar: Fix grammatical errors, capitalization, punctuation, and style.
- generate_summary: Produce a polished 2-3 sentence executive professional summary.
Return ONLY the refined text without commentary, quotes, or markdown.`;

    const userPrompt = `Action: ${action}\nContext: ${JSON.stringify(context || {})}\nOriginal Text: "${text}"`;

    const suggested = await generateAiCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { maxTokens: 350 });

    if (suggested) {
      return NextResponse.json({
        improvedText: suggested,
        remaining: quota.remaining,
      });
    }

    // Heuristic enhancement fallback
    const improvedText = smartHeuristicEnhance(action, text, context);

    return NextResponse.json({
      improvedText,
      remaining: quota.remaining,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
