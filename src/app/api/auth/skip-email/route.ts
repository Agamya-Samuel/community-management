import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * API endpoint to skip email prompt
 * 
 * When a MediaWiki user clicks "Skip for now", this endpoint is called
 * to record that they've skipped. This prevents the infinite redirect
 * loop between dashboard and complete-profile pages.
 */
export async function POST() {
    try {
        // Get current session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Update user to mark email as skipped
        await db
            .update(schema.users)
            .set({
                emailSkippedAt: new Date(),
            })
            .where(eq(schema.users.id, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error skipping email prompt:", error);
        return NextResponse.json(
            { error: "Failed to skip email prompt" },
            { status: 500 }
        );
    }
}
