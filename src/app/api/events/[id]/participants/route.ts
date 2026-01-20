import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/db";
import { events, eventRegistrations, users, communityAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * API Route: Get Event Participants
 *
 * Returns list of participants registered for an event.
 * Only accessible to event organizers.
 *
 * GET /api/events/[id]/participants
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Await params if it's a Promise (Next.js 15+)
        const resolvedParams = await Promise.resolve(params);
        const eventId = resolvedParams.id;

        // Validate event ID exists
        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            );
        }

        // Get session - user must be authenticated to view participants
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in to view participants." },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Verify event exists
        const eventResult = await db
            .select()
            .from(events)
            .where(eq(events.eventId, eventId))
            .limit(1);

        if (eventResult.length === 0) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        const event = eventResult[0];

        // Check if user has permission to view participants
        // User can view participants if they are:
        // 1. Primary organizer of the event
        // 2. Have organizer role in the community (owner, organizer, coorganizer, event_organizer)
        let hasPermission = false;

        // Check if user is primary organizer
        if (event.primaryOrganizerId === userId) {
            hasPermission = true;
        }
        // Check if user has organizer role in the community
        else if (event.communityId) {
            const adminResult = await db
                .select({ role: communityAdmins.role })
                .from(communityAdmins)
                .where(
                    and(
                        eq(communityAdmins.userId, userId),
                        eq(communityAdmins.communityId, event.communityId)
                    )
                )
                .limit(1);

            if (adminResult.length > 0) {
                const userRole = adminResult[0].role;
                const allowedRoles = ["owner", "organizer", "coorganizer", "event_organizer"];
                if (allowedRoles.includes(userRole)) {
                    hasPermission = true;
                }
            }
        }

        if (!hasPermission) {
            return NextResponse.json(
                { error: "You don't have permission to view participants for this event" },
                { status: 403 }
            );
        }

        // Fetch participants with user details
        const participants = await db
            .select({
                registrationId: eventRegistrations.registrationId,
                userId: eventRegistrations.userId,
                status: eventRegistrations.status,
                joinedAt: eventRegistrations.joinedAt,
                guestCount: eventRegistrations.guestCount,
                userName: users.name,
                userEmail: users.email,
                userImage: users.image,
                mediawikiUsername: users.mediawikiUsername,
            })
            .from(eventRegistrations)
            .innerJoin(users, eq(eventRegistrations.userId, users.id))
            .where(
                and(
                    eq(eventRegistrations.eventId, eventId),
                    eq(eventRegistrations.status, "confirmed")
                )
            );

        // Fetch removed (cancelled) participants
        const removedParticipants = await db
            .select({
                registrationId: eventRegistrations.registrationId,
                userId: eventRegistrations.userId,
                status: eventRegistrations.status,
                joinedAt: eventRegistrations.joinedAt,
                cancelledAt: eventRegistrations.cancelledAt,
                guestCount: eventRegistrations.guestCount,
                userName: users.name,
                userEmail: users.email,
                userImage: users.image,
                mediawikiUsername: users.mediawikiUsername,
            })
            .from(eventRegistrations)
            .innerJoin(users, eq(eventRegistrations.userId, users.id))
            .where(
                and(
                    eq(eventRegistrations.eventId, eventId),
                    eq(eventRegistrations.status, "cancelled")
                )
            );

        return NextResponse.json({
            success: true,
            participants,
            removedParticipants,
            count: participants.length,
            removedCount: removedParticipants.length,
        });
    } catch (error) {
        console.error("Error fetching participants:", error);
        return NextResponse.json(
            { error: "Failed to fetch participants" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/events/[id]/participants
 *
 * Remove a participant from an event.
 * Only accessible to event organizers.
 *
 * Body: { registrationId: string }
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Await params if it's a Promise (Next.js 15+)
        const resolvedParams = await Promise.resolve(params);
        const eventId = resolvedParams.id;

        // Validate event ID exists
        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            );
        }

        // Get session - user must be authenticated
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Parse request body
        const body = await request.json();
        const { registrationId } = body;

        if (!registrationId) {
            return NextResponse.json(
                { error: "Registration ID is required" },
                { status: 400 }
            );
        }

        // Verify event exists
        const eventResult = await db
            .select()
            .from(events)
            .where(eq(events.eventId, eventId))
            .limit(1);

        if (eventResult.length === 0) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        const event = eventResult[0];

        // Check if user has permission to remove participants
        let hasPermission = false;

        // Check if user is primary organizer
        if (event.primaryOrganizerId === userId) {
            hasPermission = true;
        }
        // Check if user has organizer role in the community
        else if (event.communityId) {
            const adminResult = await db
                .select({ role: communityAdmins.role })
                .from(communityAdmins)
                .where(
                    and(
                        eq(communityAdmins.userId, userId),
                        eq(communityAdmins.communityId, event.communityId)
                    )
                )
                .limit(1);

            if (adminResult.length > 0) {
                const userRole = adminResult[0].role;
                const allowedRoles = ["owner", "organizer", "coorganizer", "event_organizer"];
                if (allowedRoles.includes(userRole)) {
                    hasPermission = true;
                }
            }
        }

        if (!hasPermission) {
            return NextResponse.json(
                { error: "You don't have permission to remove participants from this event" },
                { status: 403 }
            );
        }

        // Verify registration exists and belongs to this event
        const registrationResult = await db
            .select()
            .from(eventRegistrations)
            .where(
                and(
                    eq(eventRegistrations.registrationId, registrationId),
                    eq(eventRegistrations.eventId, eventId)
                )
            )
            .limit(1);

        if (registrationResult.length === 0) {
            return NextResponse.json(
                { error: "Registration not found" },
                { status: 404 }
            );
        }

        // Update registration status to cancelled
        await db
            .update(eventRegistrations)
            .set({
                status: "cancelled",
                cancelledAt: new Date(),
            })
            .where(eq(eventRegistrations.registrationId, registrationId));

        return NextResponse.json({
            success: true,
            message: "Participant removed successfully",
        });
    } catch (error) {
        console.error("Error removing participant:", error);
        return NextResponse.json(
            { error: "Failed to remove participant" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/events/[id]/participants
 *
 * Restore (whitelist) a removed participant so they can register again.
 * Only accessible to event organizers.
 *
 * Body: { registrationId: string }
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Await params if it's a Promise (Next.js 15+)
        const resolvedParams = await Promise.resolve(params);
        const eventId = resolvedParams.id;

        // Validate event ID exists
        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            );
        }

        // Get session - user must be authenticated
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Parse request body
        const body = await request.json();
        const { registrationId } = body;

        if (!registrationId) {
            return NextResponse.json(
                { error: "Registration ID is required" },
                { status: 400 }
            );
        }

        // Verify event exists
        const eventResult = await db
            .select()
            .from(events)
            .where(eq(events.eventId, eventId))
            .limit(1);

        if (eventResult.length === 0) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        const event = eventResult[0];

        // Check if user has permission to restore participants
        let hasPermission = false;

        // Check if user is primary organizer
        if (event.primaryOrganizerId === userId) {
            hasPermission = true;
        }
        // Check if user has organizer role in the community
        else if (event.communityId) {
            const adminResult = await db
                .select({ role: communityAdmins.role })
                .from(communityAdmins)
                .where(
                    and(
                        eq(communityAdmins.userId, userId),
                        eq(communityAdmins.communityId, event.communityId)
                    )
                )
                .limit(1);

            if (adminResult.length > 0) {
                const userRole = adminResult[0].role;
                const allowedRoles = ["owner", "organizer", "coorganizer", "event_organizer"];
                if (allowedRoles.includes(userRole)) {
                    hasPermission = true;
                }
            }
        }

        if (!hasPermission) {
            return NextResponse.json(
                { error: "You don't have permission to restore participants for this event" },
                { status: 403 }
            );
        }

        // Verify registration exists, belongs to this event, and is cancelled
        const registrationResult = await db
            .select()
            .from(eventRegistrations)
            .where(
                and(
                    eq(eventRegistrations.registrationId, registrationId),
                    eq(eventRegistrations.eventId, eventId),
                    eq(eventRegistrations.status, "cancelled")
                )
            )
            .limit(1);

        if (registrationResult.length === 0) {
            return NextResponse.json(
                { error: "Removed registration not found" },
                { status: 404 }
            );
        }

        // Update registration status back to confirmed
        await db
            .update(eventRegistrations)
            .set({
                status: "confirmed",
                cancelledAt: null,
            })
            .where(eq(eventRegistrations.registrationId, registrationId));

        return NextResponse.json({
            success: true,
            message: "Participant restored successfully",
        });
    } catch (error) {
        console.error("Error restoring participant:", error);
        return NextResponse.json(
            { error: "Failed to restore participant" },
            { status: 500 }
        );
    }
}
