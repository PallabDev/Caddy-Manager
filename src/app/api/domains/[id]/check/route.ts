import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const domain = await domainService.getDomainById(id);
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (!user.admin && domain.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await domainService.checkDomainStatus(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Domain check error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = GET;
