import { POST as aiPost } from "@/lib/ai";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return aiPost(request);
}
