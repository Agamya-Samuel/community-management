"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, UserMinus, UserPlus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Participant {
    registrationId: string;
    userId: string;
    status: string;
    joinedAt: string;
    guestCount: number;
    userName: string | null;
    userEmail: string | null;
    userImage: string | null;
    mediawikiUsername: string | null;
}

interface RemovedParticipant extends Participant {
    cancelledAt: string | null;
}

interface ParticipantsListProps {
    eventId: string;
    canManageParticipants?: boolean;
}

/**
 * ParticipantsList Component
 *
 * Displays a list of participants registered for an event.
 * Allows organizers to remove participants if they have permission.
 */
export function ParticipantsList({
    eventId,
    canManageParticipants = false,
}: ParticipantsListProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [removedParticipants, setRemovedParticipants] = useState<RemovedParticipant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch participants on component mount
    // Fetch participants on component mount
    const fetchParticipants = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/events/${eventId}/participants`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch participants");
            }

            setParticipants(data.participants || []);
            setRemovedParticipants(data.removedParticipants || []);
        } catch (err) {
            console.error("Error fetching participants:", err);
            setError(err instanceof Error ? err.message : "Failed to load participants");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    // Remove participant
    const handleRemoveParticipant = async (registrationId: string, participantName: string) => {
        setRemovingId(registrationId);
        try {
            const response = await fetch(`/api/events/${eventId}/participants`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ registrationId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to remove participant");
            }

            // Remove from local state and add to removed list
            const removedParticipant = participants.find((p) => p.registrationId === registrationId);
            setParticipants((prev) =>
                prev.filter((p) => p.registrationId !== registrationId)
            );
            if (removedParticipant) {
                setRemovedParticipants((prev) => [
                    ...prev,
                    { ...removedParticipant, cancelledAt: new Date().toISOString() } as RemovedParticipant,
                ]);
            }
            toast.success(`${participantName || "Participant"} has been removed from the event`);
        } catch (err) {
            console.error("Error removing participant:", err);
            toast.error(err instanceof Error ? err.message : "Failed to remove participant");
        } finally {
            setRemovingId(null);
        }
    };

    // Restore (whitelist) a removed participant
    const handleRestoreParticipant = async (registrationId: string, participantName: string) => {
        setRestoringId(registrationId);
        try {
            const response = await fetch(`/api/events/${eventId}/participants`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ registrationId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to restore participant");
            }

            // Move from removed list back to participants
            const restoredParticipant = removedParticipants.find((p) => p.registrationId === registrationId);
            setRemovedParticipants((prev) =>
                prev.filter((p) => p.registrationId !== registrationId)
            );
            if (restoredParticipant) {
                setParticipants((prev) => [
                    ...prev,
                    { ...restoredParticipant, status: "confirmed" } as Participant,
                ]);
            }
            toast.success(`${participantName || "Participant"} has been restored and can register again`);
        } catch (err) {
            console.error("Error restoring participant:", err);
            toast.error(err instanceof Error ? err.message : "Failed to restore participant");
        } finally {
            setRestoringId(null);
        }
    };

    // Get display name for participant
    const getDisplayName = (participant: Participant) => {
        return participant.userName || participant.mediawikiUsername || participant.userEmail || "Anonymous";
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            });
        } catch {
            return "Unknown";
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchParticipants}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants
                        <Badge variant="secondary" className="ml-2">
                            {participants.length}
                        </Badge>
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchParticipants}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {participants.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-sm text-muted-foreground">No participants yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {participants.map((participant) => {
                                const displayName = getDisplayName(participant);
                                return (
                                    <div
                                        key={participant.registrationId}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={participant.userImage || undefined}
                                                    alt={displayName}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(displayName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{displayName}</p>
                                                {participant.userEmail && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {participant.userEmail}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {formatDate(participant.joinedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {canManageParticipants && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        disabled={removingId === participant.registrationId}
                                                    >
                                                        {removingId === participant.registrationId ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <UserMinus className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove Participant</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove{" "}
                                                            <strong>{displayName}</strong> from this event? This
                                                            action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleRemoveParticipant(
                                                                    participant.registrationId,
                                                                    displayName
                                                                )
                                                            }
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Removed Participants Section - Only visible to organizers */}
            {
                canManageParticipants && removedParticipants.length > 0 && (
                    <Card className="mt-4 border-destructive/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <UserMinus className="w-5 h-5" />
                                Removed Users
                                <Badge variant="destructive" className="ml-2">
                                    {removedParticipants.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                These users have been removed from the event. Whitelist them to allow them to register again.
                            </p>
                            <div className="space-y-3">
                                {removedParticipants.map((participant) => {
                                    const displayName = getDisplayName(participant);
                                    return (
                                        <div
                                            key={participant.registrationId}
                                            className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Avatar className="h-10 w-10 opacity-60 flex-shrink-0">
                                                    <AvatarImage
                                                        src={participant.userImage || undefined}
                                                        alt={displayName}
                                                    />
                                                    <AvatarFallback className="bg-destructive/10 text-destructive">
                                                        {getInitials(displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-sm text-muted-foreground truncate">{displayName}</p>
                                                    {participant.userEmail && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {participant.userEmail}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-destructive/70">
                                                        Removed {participant.cancelledAt ? formatDate(participant.cancelledAt) : "recently"}
                                                    </p>
                                                </div>
                                            </div>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                                                        disabled={restoringId === participant.registrationId}
                                                    >
                                                        {restoringId === participant.registrationId ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-4 h-4 mr-1" />
                                                                Whitelist
                                                            </>
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Restore Participant</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to whitelist{" "}
                                                            <strong>{displayName}</strong>? They will be restored
                                                            as an attendee and can register for this event again.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleRestoreParticipant(
                                                                    participant.registrationId,
                                                                    displayName
                                                                )
                                                            }
                                                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                        >
                                                            Whitelist
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            }
        </>
    );
}
