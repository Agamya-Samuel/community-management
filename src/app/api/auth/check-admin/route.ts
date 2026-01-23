import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/auth/admin-utils";

/**
 * API route to check if the current user is an admin
 * 
 * Returns { isAdmin: boolean }
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(session.user.id);

    return NextResponse.json({ isAdmin: userIsAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

