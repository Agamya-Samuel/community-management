# Community Event Platform - Authentication System

## Understanding the Core Problem

The fundamental challenge you're facing is that Google, MediaWiki, and Email/Password use completely different types of unique identifiers:

**Google Users**: Identified by email address (e.g., "john.doe@gmail.com"). Google provides email, name, and profile photo, but no MediaWiki username.

**MediaWiki Users**: Identified by MediaWiki username (e.g., "WikiEditor2024"). MediaWiki provides only the MediaWiki username through OAuth, with no email or other profile information.

**Email/Password Users**: Identified by email address (e.g., "user@example.com"). Users provide their own email and password during registration, with no automatic profile information from external providers.

Your platform needs to accommodate all three authentication methods while maintaining a consistent user experience and allowing users to potentially link multiple authentication methods to a single account.

## Solution Architecture

### Design Principle: Flexible Identifier System

Instead of forcing one identifier type onto all authentication methods, we create a flexible schema that acknowledges multiple email and MediaWiki username as potential primary identifiers, depending on how the user authenticated.

The key insight is that every user in your system will have EITHER an email (from Google or Email/Password registration) OR a MediaWiki username (from MediaWiki), but not necessarily both initially. Over time, users can add the missing piece to complete their profile through proper verification.

**Email/Password users** start with an email identifier and can optionally link both Google and MediaWiki accounts to enhance their profile and enable multiple sign-in methods.

---

## Revised Database Schema

### Users Table (`users.ts`)

```typescript
import { mysqlTable, int, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  // Primary key - internal ID (auto incrementing integer)
  id: int("id").autoincrement().primaryKey(),
  
  // EMAIL - Required for Google and Email/Password users, optional for MediaWiki users
  // This is the UNIQUE IDENTIFIER for Google and Email/Password authenticated users
  // For Google: Always populated, serves as primary identifier
  // For Email/Password: Always populated, serves as primary identifier
  // For MediaWiki: Initially null, can be added later via email verification
  email: varchar("email", { length: 255 }).unique(),
  
  // MEDIAWIKI USERNAME - Required for MediaWiki users, optional for Google and Email/Password users  
  // This is the UNIQUE IDENTIFIER for MediaWiki-authenticated users
  // For MediaWiki: Always populated, serves as primary identifier
  // For Google/Email/Password: Initially null, can be connected via MediaWiki OAuth verification
  mediawikiUsername: varchar("mediawiki_username", { length: 255 }).unique(),
  
  // Display name - shown in UI
  // For Google: Uses the name from Google profile
  // For MediaWiki: Initially same as MediaWiki username, can be changed
  // For Email/Password: User provides during registration, can be changed
  name: varchar("name", { length: 255 }),
  
  // Email verification timestamp
  // if user sign up for the first time using google Oauth then use the timestamp of signUp
  emailVerifiedAt: timestamp("email_verified_at", {
    mode: "date"
  }),
  
  // MediaWiki username verification timestamp
  // Set when user successfully connects their MediaWiki account via OAuth
  mediawikiUsernameVerifiedAt: timestamp("mediawiki_username_verified_at", {
    mode: "date",
  }),
  
  // Profile image URL
  // For Google: Profile photo from Google
  // For MediaWiki: null initially, can be uploaded
  // For Email/Password: null initially, can be uploaded
  image: varchar("image", { length: 255 }),

  // Timezone - store as IANA timezone name (e.g. "America/Los_Angeles")
  // Defaults to UTC when not specified; used for scheduling and displaying times
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  
  // Password hash for Email/Password authentication
  // For Email/Password: Always populated (hashed using bcrypt or similar)
  // For Google/MediaWiki: null (OAuth users don't have passwords)
  // IMPORTANT: Never store plain text passwords - always hash them before storing
  password: varchar("password", { length: 255 }),
  
  // Bio or description
  bio: text("bio"),
  
  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  }).defaultNow().notNull(),
  
  updatedAt: timestamp("updated_at", {
    mode: "date",
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdate(() => new Date()),
});
```

**Key Understanding**: Notice that both `email` and `mediawikiUsername` are marked as unique but NOT as `notNull()`. This is crucial because:
- A Google user initially has an email but no MediaWiki username
- An Email/Password user initially has an email but no MediaWiki username
- A MediaWiki user initially has a MediaWiki username but no email
- Either field can be null, but at least one must always be populated
- Each identifier type has its own verification timestamp to track verification status
- The `password` field is only populated for Email/Password users and must be stored as a hash (never plain text)

### Accounts Table (`accounts.ts`)

```typescript
import { mysqlTable, varchar, text, timestamp, int, primaryKey } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const accounts = mysqlTable(
  "accounts",
  {
    // Links to the user in the users table
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Account type: "oauth" for Google and MediaWiki, "credentials" for email+password
    type: varchar("type", { length: 255 }).notNull(),
    
    // Provider name: "google", "mediawiki", or "credentials" (for email+password)
    provider: varchar("provider", { length: 255 }).notNull(),
    
    // The unique ID from the provider
    // For Google: The Google User ID (a long numeric string)
    // For MediaWiki: May be null if MediaWiki doesn't provide a user ID from its database
    providerAccountId: varchar("provider_account_id", { length: 255 }),
    
    // OAuth tokens for Google (prefixed with 'google' to avoid confusion)
    googleRefreshToken: text("google_refresh_token"),
    googleAccessToken: text("google_access_token"),
    googleExpiresAt: int("google_expires_at"),
    googleTokenType: varchar("google_token_type", { length: 255 }),
    googleScope: varchar("google_scope", { length: 255 }),
    googleIdToken: text("google_id_token"),
    googleSessionState: varchar("google_session_state", { length: 255 }),
    
    // OAuth tokens for MediaWiki (if needed)
    mediawikiAccessToken: text("mediawiki_access_token"),
    mediawikiExpiresAt: int("mediawiki_expires_at"),
  },
  (account) => ({
    // Ensures one account per provider per user
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);
```

**Key Understanding**: The `accounts` table serves as a linking table between your internal user records and external authentication providers. One user can have multiple accounts (one for Google, one for MediaWiki, one for Email/Password), which is how account linking works. The actual identifiers (email and MediaWiki username) are stored in the `users` table, not duplicated here.

**Token Field Naming**: Token fields are prefixed with the provider name (e.g., `googleAccessToken`, `googleRefreshToken`) to avoid confusion when a user has multiple OAuth accounts linked. This makes it clear which tokens belong to which provider. For MediaWiki, we use `mediawikiAccessToken` and `mediawikiExpiresAt`.

**Note for Email/Password**: For Email/Password authentication, you may or may not create an entry in the `accounts` table, depending on your implementation. Some systems store password credentials only in the `users` table's `password` field and don't create an `accounts` entry. Others create an `accounts` entry with `provider: "credentials"` and `type: "credentials"` for consistency. Choose the approach that fits your architecture.

### Sessions Table (`sessions.ts`)

```typescript
import { mysqlTable, varchar, timestamp, int } from "drizzle-orm/mysql-core";
import { users } from "./users";

export const sessions = mysqlTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  expires: timestamp("expires", {
    mode: "date",
  }).notNull(),
  
  // Track which provider was used for this specific session
  // Useful for analytics and understanding user behavior
  provider: varchar("provider", { length: 255 }),
  
  // Track the identifier used for this session
  // For Google sessions: the email
  // For MediaWiki sessions: the MediaWiki username
  // For Email/Password sessions: the email
  providerIdentifier: varchar("provider_identifier", { length: 255 }),
});
```

### Verification Tokens Table (`verificationTokens.ts`)

```typescript
import { mysqlTable, varchar, timestamp, primaryKey, int } from "drizzle-orm/mysql-core";

export const verificationTokens = mysqlTable(
  "verification_tokens",
  {
    // Email address that needs verification
    identifier: varchar("identifier", { length: 255 }).notNull(),
    
    // Unique verification token sent to user
    token: varchar("token", { length: 255 }).notNull(),
    
    // Token expiration timestamp
    expires: timestamp("expires", {
      mode: "date",
    }).notNull(),
    
    // User ID this verification is for
    // Helps us link the verification back to the correct user
    userId: int("user_id").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
);
```

### Index File (`index.ts`)

```typescript
export * from "./users";
export * from "./accounts";
export * from "./sessions";
export * from "./verificationTokens";
```

---

## Authentication Flow Cases

### Case 1: New User Signs In with Google

**What Happens:**
When someone clicks "Sign in with Google" for the first time, Google's OAuth flow returns their Google User ID, email address, full name, and profile photo URL. Your system has never seen this Google User ID before, so it knows this is a new user.

The system creates a new user record using the email as the primary identifier. Since Google provides complete profile information, the user can immediately start using the platform without any additional setup.

**Database State After Sign In:**

```
users table:
- id: 1 (auto-incremented integer)
- email: "john.doe@gmail.com" (from Google - PRIMARY IDENTIFIER)
- mediawikiUsername: null (not connected yet)
- name: "John Doe" (from Google)
- emailVerifiedAt: "2024-12-30 10:30:00" (Google confirms the email)
- mediawikiUsernameVerifiedAt: null (not connected yet)
- image: "https://lh3.googleusercontent.com/a/xyz..." (from Google)

accounts table:
- userId: 1
- type: "oauth"
- provider: "google"
- providerAccountId: "1234567890" (Google's internal user ID)
- googleAccessToken: "ya29.a0AfH6..." (for accessing Google APIs)
- googleRefreshToken: "1//0gHd..." (for getting new access tokens)
- googleExpiresAt: 1735567800
```

**What the User Sees:**
The user is immediately taken to your platform's dashboard. They can create events, join communities, and use all features. Their profile shows their Google name and photo. If your UI has a MediaWiki username field, it shows as "Not connected" with a button "Connect MediaWiki Username".

### Case 2: New User Signs In with MediaWiki

**What Happens:**
When someone clicks "Sign in with MediaWiki" for the first time, MediaWiki's OAuth flow returns only their MediaWiki user ID and MediaWiki username (like "WikiEditor2024"). There's no email, no real name, no profile photo. This is a significant difference from Google authentication.

The system creates a new user record using the MediaWiki username as the primary identifier. However, because the profile lacks essential information like email (needed for notifications and account recovery), the system redirects the user to a profile completion page.

**Database State After Sign In:**

```
users table:
- id: 2 (auto-incremented integer)
- email: null (MediaWiki doesn't provide email - can be added later)
- mediawikiUsername: "WikiEditor2024" (from MediaWiki - PRIMARY IDENTIFIER)
- name: "WikiEditor2024" (defaults to MediaWiki username, can be changed)
- emailVerifiedAt: null (no email to verify yet)
- mediawikiUsernameVerifiedAt: "2024-12-30 10:30:00" (verified via OAuth)
- image: null (can be uploaded later)

accounts table:
- userId: 2
- type: "oauth"
- provider: "mediawiki"
- providerAccountId: null (if MediaWiki doesn't provide user ID from its database)
- mediawikiAccessToken: "mw_token_xyz..."
- mediawikiExpiresAt: 1735567800 (token expiration timestamp, if provided by MediaWiki)
```

**What the User Sees:**
After authentication, the user is redirected to a profile completion page that explains: "Welcome WikiEditor2024! To get the most out of our platform, we recommend adding your email address. This helps us send you event notifications and allows account recovery if needed."

The form has fields for email (optional but recommended), display name (optional, defaults to their MediaWiki username), and bio. Importantly, the user can skip this step and still use the platform, but certain features might prompt them to add an email (like event notifications).

### Case 3: Google User Wants to Connect MediaWiki Username

**What Happens:**
A user who originally signed in with Google might want to connect their MediaWiki username for various reasons. Perhaps they want to link their Wikipedia contributions to their platform profile, or they want to participate in features that require MediaWiki authentication.

The user goes to their account settings and clicks "Connect MediaWiki Username". This button initiates a MediaWiki OAuth flow. The user is redirected to MediaWiki where they log in (if not already logged in) and authorize your application. MediaWiki then redirects them back to your platform with their MediaWiki username.

**Important**: The system must verify that this MediaWiki username is not already connected to another user in your system. If it's available, the MediaWiki username is added to their user record and marked as verified.

**Database State After Connecting MediaWiki Username:**

```
users table:
- id: 1
- email: "john.doe@gmail.com" (still the primary identifier)
- mediawikiUsername: "JohnDoeWiki" (newly connected and verified via OAuth)
- name: "John Doe"
- emailVerifiedAt: "2024-12-30 10:30:00"
- mediawikiUsernameVerifiedAt: "2024-12-30 15:45:00" (verified via OAuth)
- image: "https://lh3.googleusercontent.com/..."

accounts table:
- Entry 1 (existing):
  - userId: 1
  - provider: "google"
  - providerAccountId: "1234567890"
  
- Entry 2 (new):
  - userId: 1
  - provider: "mediawiki"
  - providerAccountId: null (if MediaWiki doesn't provide user ID from its database)
  - mediawikiAccessToken: "mw_token_abc..."
  - mediawikiExpiresAt: 1735584300 (token expiration timestamp, if provided by MediaWiki)
```

**Important Note**: The email is still how this user is fundamentally identified in the system. The MediaWiki username is an addition, not a replacement. Now this user can sign in using either Google or MediaWiki, and both authentication methods will lead to the same user account.

**What the User Sees:**
After successfully connecting their MediaWiki username, the user sees a success message: "Successfully connected MediaWiki username: JohnDoeWiki". Their profile now shows both their email and MediaWiki username. They can now sign in using either Google or their MediaWiki account.

### Case 4: New User Signs Up with Email and Password

**What Happens:**
When someone registers with email and password, they provide their email address, a password, and optionally their display name. The system creates a new user record using the email as the primary identifier. The password is hashed using a secure hashing algorithm (like bcrypt) before being stored.

After registration, the user is redirected to a profile completion page where they can optionally link their Google account and MediaWiki username to enhance their profile and enable multiple sign-in methods.

**Database State After Sign Up:**
```
users table:
- id: 3 (auto-incremented integer)
- email: "user@example.com" (from registration - PRIMARY IDENTIFIER)
- mediawikiUsername: null (not connected yet)
- name: "John User" (user provided during registration)
- emailVerifiedAt: null (needs email verification)
- mediawikiUsernameVerifiedAt: null (not connected yet)
- password: "$2b$10$hashed_password_here" (bcrypt hash, never plain text)
- image: null (can be uploaded later)

accounts table:
- (Optional: May or may not create an entry depending on implementation)
- userId: 3
- type: "credentials"
- provider: "credentials"
- providerAccountId: null (not applicable for email/password)
```

**What the User Sees:**
After registration, the user is redirected to a profile completion page that explains: "Welcome! To get the most out of our platform, we recommend verifying your email address and optionally linking your Google or MediaWiki accounts. This allows you to sign in using multiple methods and enhances your profile."

The profile completion page shows:
- **Email Verification Section**: "Verify your email address to receive notifications and enable account recovery" with a "Send Verification Email" button
- **Link Google Account Section**: "Connect your Google account to use your Google profile photo and sign in with Google" with a "Connect Google Account" button
- **Link MediaWiki Account Section**: "Connect your MediaWiki username to link your Wikipedia contributions" with a "Connect MediaWiki Username" button
- **Skip Option**: "Skip for now" button that allows them to proceed without completing these steps

The user can complete any or all of these steps, or skip them entirely and still use the platform.

### Case 5: Email/Password User Links Google Account

**What Happens:**
An Email/Password user clicks "Connect Google Account" on their profile completion page. This initiates a Google OAuth flow. The user is redirected to Google where they log in (if not already logged in) and authorize your application. Google then redirects them back to your platform with their Google User ID, email, name, and profile photo.

**Important**: The system must verify that the Google email matches the user's registered email. If it matches, the Google account is linked. If it doesn't match, the system should offer to update the user's email to the Google email (after verification) or show an error if the Google email belongs to another account.

**Database State After Linking Google:**
```
users table:
- id: 3
- email: "user@example.com" (or updated to Google email if user confirms)
- mediawikiUsername: null
- name: "John User" (or updated to Google name if user prefers)
- emailVerifiedAt: "2024-12-30 16:00:00" (verified via Google OAuth)
- mediawikiUsernameVerifiedAt: null
- password: "$2b$10$hashed_password_here" (still available for email/password login)
- image: "https://lh3.googleusercontent.com/..." (from Google)

accounts table:
- Entry 1 (new):
  - userId: 3
  - type: "oauth"
  - provider: "google"
  - providerAccountId: "1234567890"
  - googleAccessToken: "ya29.a0AfH6..."
  - googleRefreshToken: "1//0gHd..."
```

**What the User Sees:**
After successfully linking their Google account, the user sees a success message: "Successfully connected Google account! You can now sign in using either your email/password or Google." Their profile now shows their Google profile photo and name (if they chose to update it). They can now sign in using either Email/Password or Google, and both authentication methods will lead to the same user account.

### Case 6: Email/Password User Links MediaWiki Username

**What Happens:**
An Email/Password user clicks "Connect MediaWiki Username" on their profile completion page. This initiates a MediaWiki OAuth flow. The user is redirected to MediaWiki where they log in (if not already logged in) and authorize your application. MediaWiki then redirects them back to your platform with their MediaWiki username.

**Important**: The system must verify that this MediaWiki username is not already connected to another user in your system. If it's available, the MediaWiki username is added to their user record and marked as verified.

**Database State After Linking MediaWiki:**
```
users table:
- id: 3
- email: "user@example.com"
- mediawikiUsername: "UserWiki2024" (newly connected and verified via OAuth)
- name: "John User"
- emailVerifiedAt: null (or verified if they verified email)
- mediawikiUsernameVerifiedAt: "2024-12-30 16:30:00" (verified via OAuth)
- password: "$2b$10$hashed_password_here"
- image: null (or Google photo if they linked Google)

accounts table:
- Entry 1 (existing, if Google was linked):
  - userId: 3
  - provider: "google"
  - providerAccountId: "1234567890"
  
- Entry 2 (new):
  - userId: 3
  - type: "oauth"
  - provider: "mediawiki"
  - providerAccountId: null (if MediaWiki doesn't provide user ID)
  - mediawikiAccessToken: "mw_token_xyz..."
  - mediawikiExpiresAt: 1735585800 (token expiration timestamp, if provided by MediaWiki)
```

**What the User Sees:**
After successfully linking their MediaWiki username, the user sees a success message: "Successfully connected MediaWiki username: UserWiki2024". Their profile now shows their MediaWiki username. They can now sign in using Email/Password, Google (if linked), or MediaWiki, and all authentication methods will lead to the same user account.

### Case 7: MediaWiki User Adds and Verifies Email Address

**What Happens:**
A MediaWiki user who initially skipped profile completion decides to add their email address. Maybe they want to receive event notifications, or they've realized it's useful for account recovery.

They go to their profile settings and add "editor@example.com" (this can be any email - Gmail, Yahoo, Outlook, custom domain, etc.). The system saves this email as unverified and immediately sends a verification email with a unique verification link.

**Email Verification Process:**

1. **User enters email**: "editor@example.com"
2. **System creates verification token**: A unique, secure token is generated
3. **Verification record created**: An entry is added to the `verificationTokens` table
4. **Email sent**: The system sends an email to "editor@example.com" with text like:
   ```
   Hello WikiEditor2024,
   
   Please verify your email address by clicking the link below:
   https://yourplatform.com/verify-email?token=abc123xyz789
   
   This link will expire in 24 hours.
   
   If you didn't request this verification, please ignore this email.
   ```
5. **User clicks link**: When they click the verification link, the system:
   - Validates the token exists and hasn't expired
   - Marks the email as verified
   - Updates the `emailVerifiedAt` timestamp
   - Deletes the verification token

**Database State After Adding Email (Before Verification):**

```
users table:
- id: 2
- email: "editor@example.com" (newly added, NOT YET VERIFIED)
- mediawikiUsername: "WikiEditor2024" (still the primary identifier)
- name: "Wiki Editor" (user also updated their display name)
- emailVerifiedAt: null (waiting for verification)
- mediawikiUsernameVerifiedAt: "2024-12-30 10:30:00"
- image: null

verificationTokens table:
- identifier: "editor@example.com"
- token: "abc123xyz789def456" (secure random token)
- expires: "2024-12-31 14:30:00" (24 hours from now)
- userId: 2
```

**Database State After Email Verification (User Clicked Link):**

```
users table:
- id: 2
- email: "editor@example.com"
- mediawikiUsername: "WikiEditor2024"
- name: "Wiki Editor"
- emailVerifiedAt: "2024-12-30 14:45:00" (NOW VERIFIED!)
- mediawikiUsernameVerifiedAt: "2024-12-30 10:30:00"
- image: null

verificationTokens table:
- (verification token deleted after successful verification)
```

**What the User Sees:**

**Before Verification:**
After entering their email, they see a message: "We've sent a verification email to editor@example.com. Please check your inbox and click the verification link to complete the process. The link will expire in 24 hours."

Their profile shows the email as "Pending verification" with options to "Resend verification email" or "Change email address".

**After Verification:**
When they click the verification link in their email, they're redirected to a success page: "Email verified successfully! Your email editor@example.com is now confirmed." Their profile now shows the email as verified, and they can receive email notifications for events and other platform activities.

### Case 8: Handling Identifier Conflicts

**Scenario A: Email Conflict**
A MediaWiki user tries to add an email address ("john.doe@gmail.com"), but this email already belongs to another user who signed in with Google.

**What Should Happen:**
The system detects the conflict and shows a message: "This email address is already associated with another account. If this is your account, you can link them together. Would you like to review and merge these accounts?"

If the user confirms they own both accounts, they should be redirected to sign in with Google to prove ownership. After successful authentication, the system can merge the accounts by updating the MediaWiki user's account to include both authentication methods.

**Database State After Merging:**

```
users table (merged):
- id: 1 (keeping the Google user's ID)
- email: "john.doe@gmail.com" (from Google account)
- mediawikiUsername: "WikiEditor2024" (from MediaWiki account)
- name: "John Doe" (from Google, or user's choice)
- emailVerifiedAt: "2024-12-30 10:30:00" (from Google)
- mediawikiUsernameVerifiedAt: "2024-12-30 10:30:00" (from MediaWiki)
- image: "https://lh3.googleusercontent.com/..." (from Google)

accounts table:
- Entry 1:
  - userId: 1
  - provider: "google"
  - providerAccountId: "1234567890"
  
- Entry 2:
  - userId: 1
  - provider: "mediawiki"
  - providerAccountId: null (if MediaWiki doesn't provide user ID)
  - mediawikiAccessToken: "mw_token_xyz..." (from MediaWiki account)
  - mediawikiExpiresAt: 1735567800 (token expiration timestamp, if provided by MediaWiki)
```

**Scenario B: Username Conflict**
A Google user tries to connect a MediaWiki username ("WikiEditor2024"), but this username already belongs to a MediaWiki user.

**What Should Happen:**
The system shows an error: "This username is already taken. Please choose another username."

Unlike email conflicts, username conflicts typically should NOT trigger account merging, because usernames are public identifiers that might coincidentally be the same. The Google user simply needs to choose a different username or the system should prevent the connection.

### Case 9: Smart Account Detection and Merging

**What Happens:**
When a user attempts to add an identifier (email or MediaWiki username) that already exists in the system, the system should:

1. **Detect the conflict** during the verification process
2. **Present options** to the user:
   - If they own both accounts: Offer to merge accounts
   - If they don't own the other account: Show error and prevent the action
3. **Verify ownership** before merging:
   - For email conflicts: Require the user to sign in with the provider that owns that email (Google, Email/Password, or the original provider)
   - For MediaWiki username conflicts: Require the user to sign in with MediaWiki to prove ownership
4. **Merge accounts** by:
   - Keeping one user record (typically the one with more complete profile)
   - Moving all accounts from the merged user to the primary user
   - Updating all foreign key references (sessions, events, etc.)
   - Deleting the duplicate user record

**Implementation Considerations:**
- Always verify ownership before merging
- Preserve all data from both accounts
- Notify the user of what will be merged
- Log all merge operations for audit purposes
- Handle edge cases (e.g., both accounts have different MediaWiki usernames)

---

## Key Verification Differences

### Email Verification (For MediaWiki Users Adding Email, and Email/Password Users)
- **Method**: Verification link sent to email
- **Reason**: Email can be any provider (Gmail, Yahoo, Outlook, custom domain, etc.), so we need to verify ownership through that email provider
- **Process**: 
  - For MediaWiki users: User enters email → System sends verification link → User clicks link in their email → Email verified
  - For Email/Password users: User registers → System sends verification link → User clicks link in their email → Email verified
- **Security**: Ensures the user actually has access to the email address they're claiming
- **Note**: Email/Password users should verify their email during registration or immediately after, but can still use the platform with unverified email (with limited features)

### MediaWiki Username Verification (For Google and Email/Password Users Connecting MediaWiki)
- **Method**: OAuth authentication with MediaWiki
- **Reason**: We can verify MediaWiki username ownership directly through MediaWiki's OAuth system
- **Process**: User clicks "Connect MediaWiki Username" → Redirected to MediaWiki OAuth → User logs in to MediaWiki → Authorizes app → Redirected back with verified username
- **Security**: Ensures the user actually owns the MediaWiki account they're connecting

### Google Account Linking (For Email/Password Users)
- **Method**: OAuth authentication with Google
- **Reason**: We can verify Google account ownership directly through Google's OAuth system
- **Process**: User clicks "Connect Google Account" → Redirected to Google OAuth → User logs in to Google → Authorizes app → Redirected back with verified Google account
- **Security**: Ensures the user actually owns the Google account they're connecting
- **Email Matching**: If the Google email matches the user's registered email, automatically verify the email. If it doesn't match, offer to update the email or show an error if the Google email belongs to another account.

---

## Profile Completion States

### Google User Profile States

1. **Initial State (Just signed in with Google)**
   - ✅ Email (verified)
   - ❌ MediaWiki username (not connected)
   - Status: Profile complete (can use all features)

2. **Enhanced State (Connected MediaWiki username)**
   - ✅ Email (verified)
   - ✅ MediaWiki username (verified via OAuth)
   - Status: Profile complete with full integration

### Email/Password User Profile States

1. **Initial State (Just registered with Email/Password)**
   - ⏳ Email (registered but not verified)
   - ❌ MediaWiki username (not connected)
   - ❌ Google account (not linked)
   - Status: Profile incomplete (recommended to verify email and optionally link accounts)

2. **Email Verified State**
   - ✅ Email (verified)
   - ❌ MediaWiki username (not connected)
   - ❌ Google account (not linked)
   - Status: Profile complete (can use all features)

3. **Enhanced State (Linked Google Account)**
   - ✅ Email (verified via Google OAuth or email verification)
   - ❌ MediaWiki username (not connected)
   - ✅ Google account (linked via OAuth)
   - Status: Profile complete with Google integration

4. **Enhanced State (Linked MediaWiki Username)**
   - ✅ Email (verified)
   - ✅ MediaWiki username (verified via OAuth)
   - ❌ Google account (not linked)
   - Status: Profile complete with MediaWiki integration

5. **Complete State (All Linked)**
   - ✅ Email (verified)
   - ✅ MediaWiki username (verified via OAuth)
   - ✅ Google account (linked via OAuth)
   - Status: Profile complete with full integration (can sign in with any method)

### MediaWiki User Profile States

1. **Initial State (Just signed in with MediaWiki)**
   - ❌ Email (not added)
   - ✅ MediaWiki username (verified via OAuth)
   - Status: Profile incomplete (recommended to add email)

2. **Email Added, Pending Verification**
   - ⏳ Email (added but not verified)
   - ✅ MediaWiki username (verified via OAuth)
   - Status: Profile incomplete (waiting for email verification)

3. **Complete State (Email verified)**
   - ✅ Email (verified)
   - ✅ MediaWiki username (verified via OAuth)
   - Status: Profile complete

---

## Implementation Guidelines

### For Email/Password Registration

```typescript
// When user registers with email and password
async function registerWithEmailPassword(email: string, password: string, name?: string) {
  // 1. Check if email is already in use
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  
  if (existingUser) {
    throw new Error("This email is already registered");
  }
  
  // 2. Hash the password (NEVER store plain text passwords)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 3. Create user record with unverified email
  const [newUser] = await db.insert(users).values({
    email: email,
    password: hashedPassword,
    name: name || email.split('@')[0], // Default name from email if not provided
    emailVerifiedAt: null
  }).returning();
  
  // 4. Create verification token
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await db.insert(verificationTokens).values({
    identifier: email,
    token: token,
    expires: expiresAt,
    userId: newUser.id
  });
  
  // 5. Send verification email
  await sendVerificationEmail(email, token);
  
  return newUser;
}

// When user signs in with email and password
async function signInWithEmailPassword(email: string, password: string) {
  // 1. Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  
  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }
  
  // 2. Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }
  
  // 3. Create session
  const sessionToken = generateSecureToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await db.insert(sessions).values({
    sessionToken: sessionToken,
    userId: user.id,
    expires: expires,
    provider: "credentials",
    providerIdentifier: email
  });
  
  return { user, sessionToken };
}
```

### For Email Verification

```typescript
// When MediaWiki user adds email OR Email/Password user needs to verify
async function addEmailToProfile(userId: number, email: string) {
  // 1. Check if email is already in use
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  
  if (existingUser) {
    throw new Error("This email is already registered");
  }
  
  // 2. Update user record with unverified email
  await db.update(users)
    .set({ 
      email: email,
      emailVerifiedAt: null
    })
    .where(eq(users.id, userId));
  
  // 3. Create verification token
  const token = generateSecureToken(); // Use crypto.randomBytes or similar
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await db.insert(verificationTokens).values({
    identifier: email,
    token: token,
    expires: expiresAt,
    userId: userId
  });
  
  // 4. Send verification email
  await sendVerificationEmail(email, token);
}

// When user clicks verification link
async function verifyEmail(token: string) {
  // 1. Find verification token
  const verification = await db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.token, token),
      gt(verificationTokens.expires, new Date())
    )
  });
  
  if (!verification) {
    throw new Error("Invalid or expired verification token");
  }
  
  // 2. Update user record
  await db.update(users)
    .set({ 
      emailVerifiedAt: new Date()
    })
    .where(eq(users.id, verification.userId));
  
  // 3. Delete verification token
  await db.delete(verificationTokens)
    .where(eq(verificationTokens.token, token));
}
```

### For Google Account Linking (Email/Password Users)

```typescript
// When Email/Password user clicks "Connect Google Account"
async function initiateGoogleConnection(userId: number) {
  // 1. Generate OAuth state for security
  const state = generateSecureToken();
  
  // 2. Store state temporarily (in session or cache)
  await storeOAuthState(userId, state);
  
  // 3. Redirect to Google OAuth
  const oauthUrl = buildGoogleOAuthUrl(state);
  return oauthUrl; // Redirect user to this URL
}

// When Google redirects back with authorization
async function handleGoogleCallback(code: string, state: string) {
  // 1. Verify state
  const userId = await verifyOAuthState(state);
  
  // 2. Exchange code for access token and user info
  const { accessToken, refreshToken, expiresIn, googleEmail, googleName, googleImage, googleUserId } = 
    await exchangeGoogleCode(code);
  
  // 3. Get current user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // 4. Check if Google email matches user's email
  if (user.email === googleEmail) {
    // Email matches - automatically verify email and link Google account
    await db.update(users)
      .set({ 
        emailVerifiedAt: new Date(),
        name: googleName || user.name, // Update name if user prefers
        image: googleImage || user.image // Update image if user prefers
      })
      .where(eq(users.id, userId));
  } else {
    // Email doesn't match - check if Google email belongs to another account
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, googleEmail)
    });
    
    if (existingUser) {
      throw new Error("This Google account is already linked to another user");
    }
    
    // Offer to update email to Google email (requires user confirmation)
    // This would typically be handled in the UI with a confirmation dialog
  }
  
  // 5. Check if Google account is already linked to another user
  const existingAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.provider, "google"),
      eq(accounts.providerAccountId, googleUserId)
    )
  });
  
  if (existingAccount && existingAccount.userId !== userId) {
    throw new Error("This Google account is already linked to another user");
  }
  
  // 6. Calculate expiration timestamp
  const googleExpiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  
  // 7. Create account link with google-prefixed token fields
  await db.insert(accounts).values({
    userId: userId,
    type: "oauth",
    provider: "google",
    providerAccountId: googleUserId,
    googleAccessToken: accessToken,
    googleRefreshToken: refreshToken,
    googleExpiresAt: googleExpiresAt
  });
}

// When Google user clicks "Connect MediaWiki Username" OR Email/Password user clicks "Connect MediaWiki Username"
async function initiateMediaWikiConnection(userId: number) {
  // 1. Generate OAuth state for security
  const state = generateSecureToken();
  
  // 2. Store state temporarily (in session or cache)
  await storeOAuthState(userId, state);
  
  // 3. Redirect to MediaWiki OAuth
  const oauthUrl = buildMediaWikiOAuthUrl(state);
  return oauthUrl; // Redirect user to this URL
}

// When MediaWiki redirects back with authorization
async function handleMediaWikiCallback(code: string, state: string) {
  // 1. Verify state
  const userId = await verifyOAuthState(state);
  
  // 2. Exchange code for access token and user info
  const { accessToken, expiresIn, mediawikiUsername, mediawikiUserId } = 
    await exchangeMediaWikiCode(code);
  
  // 3. Check if MediaWiki username is already connected to another user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.mediawikiUsername, mediawikiUsername)
  });
  
  if (existingUser && existingUser.id !== userId) {
    throw new Error("This MediaWiki username is already connected to another account");
  }
  
  // 4. Update user record
  await db.update(users)
    .set({ 
      mediawikiUsername: mediawikiUsername,
      mediawikiUsernameVerifiedAt: new Date()
    })
    .where(eq(users.id, userId));
  
  // 5. Calculate expiration timestamp (if MediaWiki provides expiresIn)
  const mediawikiExpiresAt = expiresIn 
    ? Math.floor(Date.now() / 1000) + expiresIn 
    : null;
  
  // 6. Create account link with mediawiki-prefixed token fields
  await db.insert(accounts).values({
    userId: userId,
    type: "oauth",
    provider: "mediawiki",
    providerAccountId: mediawikiUserId, // May be null if MediaWiki doesn't provide user ID
    mediawikiAccessToken: accessToken,
    mediawikiExpiresAt: mediawikiExpiresAt
  });
}
```

---

## UI/UX Recommendations

### For Google Users
- **Initial Sign In**: Seamless experience, no interruptions
- **Profile Page**: Show "Connect MediaWiki Username" button prominently
- **Button Text**: "Connect Your MediaWiki Account" or "Link Wikipedia Profile"
- **After Connection**: Show success message with connected MediaWiki username

### For Email/Password Users
- **Initial Registration**: 
  - Registration form with email, password, and optional display name
  - After registration, redirect to profile completion page
- **Profile Completion Page**: 
  - Welcoming message: "Welcome! Complete your profile to get the most out of our platform"
  - **Email Verification Section**: 
    - "Verify your email address to receive notifications and enable account recovery"
    - "Send Verification Email" button
    - Show email status (pending verification)
  - **Link Google Account Section**: 
    - "Connect your Google account to use your Google profile photo and sign in with Google"
    - "Connect Google Account" button
  - **Link MediaWiki Account Section**: 
    - "Connect your MediaWiki username to link your Wikipedia contributions"
    - "Connect MediaWiki Username" button
  - "Skip for now" option (but encourage completion)
- **After Linking**: 
  - Success messages for each linked account
  - Show all available sign-in methods
  - Option to unlink accounts (with confirmation)

### For MediaWiki Users
- **Initial Sign In**: Redirect to profile completion page
- **Profile Completion Page**: 
  - Welcoming message using their MediaWiki username
  - Clear explanation of why email is recommended
  - Email input field with "Send Verification Email" button
  - "Skip for now" option (but encourage email addition)
- **Email Verification**: 
  - Clear instructions to check email
  - Resend verification option
  - Option to change email if they made a mistake
- **After Verification**: Congratulations message and redirect to dashboard

### Account Settings Page (For All Users)
```
Profile Information
├─ Display Name: [John Doe] ✏️
├─ Email: john.doe@gmail.com ✅ Verified
│  └─ (or) editor@example.com ⏳ Pending verification [Resend]
│  └─ (or) [Add Email Address] (for MediaWiki users)
├─ Sign-In Methods:
│  ├─ Email/Password: ✅ Active [Change Password]
│  │  └─ (or) [Set Password] (for OAuth-only users)
│  ├─ Google: ✅ Connected [Disconnect]
│  │  └─ (or) [Connect Google Account] (for Email/Password and MediaWiki users)
│  └─ MediaWiki: ✅ Connected [Disconnect]
│     └─ (or) [Connect MediaWiki Username] (for Google and Email/Password users)
├─ MediaWiki Username: JohnDoeWiki ✅ Connected
│  └─ (or) [Connect MediaWiki Username] (for Google and Email/Password users)
│  └─ (or) WikiEditor2024 ✅ Verified (for MediaWiki users)
└─ Profile Photo: [Upload] or [Use Google Photo]
```

---

## Security Considerations

1. **Email Verification Tokens**
   - Use cryptographically secure random tokens (minimum 32 bytes)
   - Set expiration (24 hours recommended)
   - Delete tokens immediately after use
   - Rate limit verification email sends (prevent spam)

2. **OAuth State Parameter**
   - Always use state parameter for OAuth flows
   - Verify state on callback to prevent CSRF attacks
   - Store state securely (in session or encrypted cookie)

3. **Duplicate Prevention**
   - Always check if email/MediaWiki username is already in use
   - Handle race conditions properly (use database constraints)
   - Provide clear error messages for duplicate attempts

4. **Password Security**
   - Always hash passwords using bcrypt or similar (minimum 10 rounds)
   - Never store plain text passwords
   - Never log passwords in any form
   - Implement password strength requirements (minimum length, complexity)
   - Provide password reset functionality via email verification
   - Rate limit login attempts to prevent brute force attacks

5. **Account Linking**
   - Never allow linking if target identifier already belongs to another user
   - Require active session for linking operations
   - Verify ownership before linking (especially for Google account linking)
   - Log all account linking events for audit purposes
   - Allow users to unlink accounts (with appropriate warnings)

---

## Summary

This triple authentication system provides:

✅ **Flexibility**: Users can sign in with Email/Password, Google, or MediaWiki  
✅ **Security**: Proper verification for email and MediaWiki usernames, secure password hashing  
✅ **User Choice**: Optional profile enhancement without forcing users  
✅ **Account Linking**: Users can connect multiple authentication methods to one account  
✅ **Clear Verification**: Different verification methods appropriate to each identifier type  
✅ **Profile Completion**: Email/Password users can enhance their profile by linking Google and MediaWiki accounts  

### Key Features:

1. **Three Authentication Methods**:
   - Email/Password: Traditional registration with email verification
   - Google OAuth: Quick sign-in with Google account
   - MediaWiki OAuth: Sign-in with MediaWiki username

2. **Flexible Profile Completion**:
   - Email/Password users can link Google and MediaWiki accounts
   - Google users can link MediaWiki accounts
   - MediaWiki users can add and verify email addresses

3. **Multiple Sign-In Options**:
   - Once accounts are linked, users can sign in using any connected method
   - Provides convenience and account recovery options

4. **Security Best Practices**:
   - Passwords are always hashed (never plain text)
   - Email verification via secure tokens
   - OAuth verification for Google and MediaWiki
   - Proper conflict detection and account merging

The key innovation is recognizing that:
- Email verification requires email-based verification (sending a link)
- MediaWiki username verification leverages OAuth authentication directly with MediaWiki
- Google account linking uses OAuth and can automatically verify matching emails
- All three methods can be linked to create a unified user account with multiple sign-in options