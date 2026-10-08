import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth.helper";
import { domainService } from "@/server/services/domain.service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await domainService.deleteDomain(user, id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/domains");

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete domain";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
