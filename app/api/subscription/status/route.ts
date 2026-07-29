import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

export async function GET(request: NextRequest) {
  try {
    const status = getSubscriptionStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
