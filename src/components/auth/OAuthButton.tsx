"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface OAuthButtonProps {
  provider: "google" | "wikimedia";
  children: React.ReactNode;
}

export function OAuthButton({ provider, children }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("OAuth sign-in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <span className="text-gray-600">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
}


