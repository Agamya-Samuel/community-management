import { createAuthClient } from "better-auth/client";
import { genericOAuthClient } from "better-auth/client/plugins";

/**
 * Better-Auth client for client-side authentication
 * 
 * This client is used in React components and client-side code
 * to interact with the authentication system.
 * 
 * Includes genericOAuthClient plugin for custom OAuth providers like MediaWiki
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
           process.env.NEXT_PUBLIC_AUTH_URL || 
           (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  plugins: [
    genericOAuthClient(), // Required for MediaWiki OAuth (generic OAuth provider)
  ],
});

// Export types for use in components
export type ClientSession = typeof authClient.$Infer.Session;

