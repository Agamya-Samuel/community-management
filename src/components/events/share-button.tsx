"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Share2,
    Link2,
    Copy,
    Check,
    Twitter,
    Facebook,
    Linkedin,
    Mail,
    MessageCircle,
} from "lucide-react";

interface ShareButtonProps {
    title: string;
    description?: string;
    className?: string;
}

export function ShareButton({ title, description, className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [supportsNativeShare, setSupportsNativeShare] = useState(false);

    useEffect(() => {
        // Check if native share is supported (only on client)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSupportsNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    }, []);

    const getShareUrl = () => {
        if (typeof window !== "undefined") {
            return window.location.href;
        }
        return "";
    };

    const handleCopyLink = async () => {
        const url = getShareUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const shareOnTwitter = () => {
        const url = getShareUrl();
        const text = `Check out this event: ${title}`;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            "_blank",
            "width=550,height=420"
        );
    };

    const shareOnFacebook = () => {
        const url = getShareUrl();
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
            "width=550,height=420"
        );
    };

    const shareOnLinkedIn = () => {
        const url = getShareUrl();
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            "_blank",
            "width=550,height=420"
        );
    };

    const shareOnWhatsApp = () => {
        const url = getShareUrl();
        const text = `Check out this event: ${title} - ${url}`;
        window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    };

    const shareViaEmail = () => {
        const url = getShareUrl();
        const subject = `Check out this event: ${title}`;
        const body = `I thought you might be interested in this event:\n\n${title}\n${description || ""}\n\nEvent link: ${url}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleNativeShare = async () => {
        const url = getShareUrl();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: description || `Check out this event: ${title}`,
                    url: url,
                });
            } catch {
                // User cancelled or error occurred
                console.log("Share cancelled or failed");
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={className}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {/* Copy Link - Most Important */}
                <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="cursor-pointer"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 mr-3 text-green-500" />
                            <span className="text-green-500 font-medium">Link Copied!</span>
                        </>
                    ) : (
                        <>
                            <Link2 className="w-4 h-4 mr-3" />
                            <span>Copy Event Link</span>
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Social Media Options */}
                <DropdownMenuItem
                    onClick={shareOnTwitter}
                    className="cursor-pointer"
                >
                    <Twitter className="w-4 h-4 mr-3" />
                    <span>Share on Twitter</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={shareOnFacebook}
                    className="cursor-pointer"
                >
                    <Facebook className="w-4 h-4 mr-3" />
                    <span>Share on Facebook</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={shareOnLinkedIn}
                    className="cursor-pointer"
                >
                    <Linkedin className="w-4 h-4 mr-3" />
                    <span>Share on LinkedIn</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={shareOnWhatsApp}
                    className="cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    <span>Share on WhatsApp</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={shareViaEmail}
                    className="cursor-pointer"
                >
                    <Mail className="w-4 h-4 mr-3" />
                    <span>Share via Email</span>
                </DropdownMenuItem>

                {/* Native Share (for mobile) */}
                {supportsNativeShare && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleNativeShare}
                            className="cursor-pointer"
                        >
                            <Copy className="w-4 h-4 mr-3" />
                            <span>More Options...</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
