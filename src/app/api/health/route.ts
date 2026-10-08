import { NextResponse } from "next/server";
import { healthService } from "@/server/services/health.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await healthService.getHealth();
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health check failed";
    return NextResponse.json(
      {
        status: "unhealthy",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
