import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResumeAts } from "@/lib/ats";
import { resumeDataSchema } from "@/lib/schemas/resume";
import { z } from "zod";

const atsRequestSchema = z.object({
  resumeData: resumeDataSchema,
  targetJobDescription: z.string().max(10000).optional(),
});

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
    const parseResult = atsRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid resume data payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { resumeData, targetJobDescription } = parseResult.data;
    const result = analyzeResumeAts(resumeData, targetJobDescription);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ATS calculation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
