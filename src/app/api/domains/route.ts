import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { createDomainSchema } from "@/features/domains/schemas/domain.schema";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domainList = await domainService.getDomainsForUser(user);
    return NextResponse.json({ success: true, data: domainList });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load domains";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createDomainSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const domain = await domainService.createDomain(user, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");

    return NextResponse.json({ success: true, data: domain }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create domain";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
