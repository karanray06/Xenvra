import { handleWebhookRequest } from "../route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  return handleWebhookRequest(request, provider);
}
