import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, adminRateLimitConfig } from "@/lib/rate-limiter";

import { z } from "zod";

// Validation schemas
const alertQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val) || 20, 100) : 20)),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  search: z.string().optional(),
});

// GET /api/admin/security/alerts - Fetch security alerts
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, adminRateLimitConfig);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin authorization check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = alertQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      severity: searchParams.get("severity"),
      search: searchParams.get("search"),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { page, limit, severity, search } = queryResult.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (severity) {
      where.severity = severity;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { alertType: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch alerts with pagination
    const [alerts, totalCount] = await Promise.all([
      prisma.securityAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.securityAlert.count({ where }),
    ]);

    // Format response
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      type: alert.alertType,
      severity: alert.severity,
      description: alert.description,
      ipAddress: alert.ipAddress,
      metadata: alert.metadata,
      userId: alert.userId,
      createdAt: alert.createdAt,
    }));

    return NextResponse.json({
      alerts: formattedAlerts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Security alerts fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/security/alerts/[id] - Delete alert
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, adminRateLimitConfig);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin authorization check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Extract alert ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const alertIdStr = pathSegments[pathSegments.length - 1];

    if (!alertIdStr || alertIdStr === "route.ts") {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    const alertId = parseInt(alertIdStr);
    if (isNaN(alertId)) {
      return NextResponse.json({ error: "Invalid alert ID" }, { status: 400 });
    }

    // Delete alert
    await prisma.securityAlert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({
      message: "Alert deleted successfully",
    });
  } catch (error: any) {
    console.error("Security alert deletion error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
