import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better-Auth API route handler
 * 
 * This route handles all better-auth endpoints including:
 * - OAuth callbacks (Google, MediaWiki)
 * - Email/Password authentication
 * - Session management
 * - Account linking
 * - Email verification
 * 
 * The route uses the catch-all pattern [...all] to handle all better-auth paths
 */
export const { GET, POST } = toNextJsHandler(auth);

