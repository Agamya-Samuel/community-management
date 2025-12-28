import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Wikimedia OAuth 2.0 custom provider
function Wikimedia<P extends Record<string, unknown>>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "wikimedia",
    name: "Wikimedia",
    type: "oauth",
    authorization: {
      url: "https://meta.wikimedia.org/w/rest.php/oauth2/authorize",
      params: {
        scope: "mwoauth-authonly",
      },
    },
    token: "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
    userinfo: "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile",
    client: {
      id: options.clientId!,
      secret: options.clientSecret!,
    },
    profile(profile: any) {
      return {
        id: profile.sub || profile.id,
        name: profile.username || profile.name,
        email: profile.email,
        image: profile.picture || profile.avatar,
      };
    },
    ...options,
  } as OAuthConfig<P>;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts as any,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Wikimedia({
      clientId: process.env.WIKIMEDIA_CLIENT_ID!,
      clientSecret: process.env.WIKIMEDIA_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6f65f9f6-9dfc-499e-9cee-44e215e11d47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:66',message:'Credentials authorize called',data:{hasEmail:!!credentials?.email,hasPassword:!!credentials?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (!credentials?.email || !credentials?.password) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/6f65f9f6-9dfc-499e-9cee-44e215e11d47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:70',message:'Missing credentials',data:{hasEmail:!!credentials?.email,hasPassword:!!credentials?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return null;
        }

        // Find user by email using Drizzle query syntax
        const userResults = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6f65f9f6-9dfc-499e-9cee-44e215e11d47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:81',message:'User query result',data:{userCount:userResults.length,foundUser:userResults.length>0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        if (userResults.length === 0) {
          return null;
        }

        const user = userResults[0];

        // Check if user has a password (for credentials-based auth)
        if (!user.password) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/6f65f9f6-9dfc-499e-9cee-44e215e11d47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:92',message:'User has no password',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6f65f9f6-9dfc-499e-9cee-44e215e11d47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:103',message:'Password verification result',data:{isValidPassword},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        if (!isValidPassword) {
          return null;
        }

        // Return user object for Auth.js
        const result = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6f65f9f6-9dfc-499e-9cee-44e215e11d47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:117',message:'Returning user',data:{userId:result.id,hasEmail:!!result.email},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return result;
      },
    }),
  ] as any,
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;
