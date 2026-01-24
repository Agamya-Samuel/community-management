# Community Event Management Platform - Complete Features Documentation

**Version:** 1.0  
**Last Updated:** January 2025  
**Platform Type:** Web Application (SaaS / Community Platform)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Authentication & User Management](#authentication--user-management)
3. [Community Management](#community-management)
4. [Event Management](#event-management)
5. [Subscription & Premium Features](#subscription--premium-features)
6. [User Roles & Permissions](#user-roles--permissions)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Technical Stack](#technical-stack)

---

## Executive Summary

This is a comprehensive, hierarchy-based community event management platform that enables users to create and manage "Chapters" (communities) and organize diverse events. The platform emphasizes deep community engagement through advanced profiles, sub-chapter hierarchies with intelligent data inheritance, and robust event management tools including ticketing, check-ins, and feedback systems.

**Reference Models:** Meetup.com, Bevy.com, Google Developers Groups

---

## 1. Authentication & User Management

### 1.1. Multi-Provider Authentication

The platform supports three authentication methods:

#### **Google OAuth**
- One-click sign-up/login via Google account
- Automatically populates user profile (name, email, profile picture)
- Email is the primary identifier
- Email verification is automatic upon first login

#### **Email/Password Authentication**
- Traditional email and password registration
- Email verification required via verification link
- Password hashing using bcrypt
- Email serves as primary identifier

#### **MediaWiki OAuth**
- One-click sign-up/login via Wikimedia account
- MediaWiki username is the primary identifier
- Email is optional initially (can be added later)
- Supports Wikimedia contributor verification

### 1.2. User Profile System

#### **Basic Profile Information**
- **Name:** Display name (editable)
- **Email:** Primary contact email (required for Google/Email users, optional for MediaWiki)
- **MediaWiki Username:** For Wikimedia-authenticated users
- **Profile Picture:** URL to user's avatar image
- **Bio:** Text description of the user
- **Timezone:** IANA timezone name (e.g., "America/Los_Angeles") for scheduling

#### **Profile Completion Flow**
- MediaWiki users without email are prompted to complete profile
- Users can skip email prompt (stored in `emailSkippedAt`)
- Profile completion page guides users through adding missing information
- Email verification system for MediaWiki users who add email later

#### **Account Linking**
- Users can link multiple authentication providers to one account
- Supports linking Google and MediaWiki accounts
- Account unlinking functionality
- View all linked accounts in settings

### 1.3. Email Verification System

- **Verification Tokens:** Secure token-based email verification
- **Resend Verification:** Users can request new verification emails
- **Verification Status:** Tracks `emailVerified` boolean and `emailVerifiedAt` timestamp
- **Auto-Verification:** Google OAuth users are automatically verified

### 1.4. User Types

- **registered_user:** Default free tier (can join communities and events)
- **premium_subscriber:** Paid or approved subscription (can create communities)
- **platform_admin:** Platform-wide administrative access

---

## 2. Community Management

### 2.1. Community Creation

#### **Creation Requirements**
- **Premium Subscription Required:** Only users with active premium subscriptions can create communities
- **Step-by-Step Wizard:** Guided creation process
- **Required Fields:**
  - Community name (max 255 characters)
  - Description (optional text)
  - Photo/Logo URL (optional)
  - Parent community selection (optional, for child communities)

#### **Parent-Child Hierarchy**
- **Parent Communities:** Standalone communities with `parentCommunityId = NULL`
- **Child Communities:** Sub-chapters that reference a parent community
- **Hierarchy Rules:**
  - Only organizers of parent communities can create child communities
  - Child communities automatically inherit organizer identity from parent
  - Optional inheritance of branding and guidelines
  - Child communities can add local team members independently

#### **Community Structure Example**
```
Parent: "Wikimedia India" (Organizer: Rajesh Kumar)
  ↳ Child: "WikiClub Tech SHUATS" (Auto-inherits Rajesh as Organizer)
  ↳ Child: "WikiClub Tech IIITH" (Auto-inherits Rajesh as Organizer)
  ↳ Child: "WikiClub BHU" (Auto-inherits Rajesh as Organizer)
```

### 2.2. Community Privacy Settings

- **Public:** Discoverable in search; anyone can view and join
- **Private:** Discoverable; users must "Request to Join" (organizer approval required)
- **Unlisted:** Hidden from search; accessible via direct invite link only

### 2.3. Community Membership

#### **Joining Communities**
- Users can join public communities directly
- Private communities require approval from organizers
- Unlisted communities require invite link
- Membership tracked in `communityMembers` table with role "member" by default

#### **Member Directory**
- Searchable list of all community members
- Filters available:
  - Name search
  - Skills filter
  - Interests filter
- Shows member roles and join dates

### 2.4. Community Administration

#### **Admin Roles (Hierarchy from Highest to Lowest)**
1. **Owner:** Full control, can delete communities
2. **Organizer:** High-level permissions, manage members/events
3. **Coorganizer:** Assists organizers
4. **Event Organizer:** Focused on event management
5. **Admin:** General administrative role
6. **Moderator:** Community health role (ban/mute members)
7. **Mentor:** Supportive role

#### **Role Assignment**
- Organizers can promote members to various roles
- Role changes are logged in audit trail
- Permissions matrix shows what each role can do
- Organizers can demote or remove admins

#### **Team Management Features**
- View all admins and their roles
- Assign new admin roles
- Remove admin privileges
- Change admin role types
- Track role assignment history

### 2.5. Community Features

#### **Community Pages**
- Public-facing community detail pages
- Display community name, description, photo
- Show upcoming events
- Member count and activity metrics
- Community settings management (for admins)

#### **Community Settings**
- Edit community name, description, photo
- Manage privacy settings
- Configure community guidelines
- Branding customization (for parent communities)

#### **Analytics Dashboard** (Premium Feature)
- Total events hosted
- Total members count
- Growth metrics over time
- Member engagement statistics

#### **Financial Overview** (Organizers/Co-Organizers Only)
- Total tickets sold
- Total revenue
- Payment breakdowns by event
- Transaction history

---

## 3. Event Management

### 3.1. Event Types

The platform supports four primary event types:

#### **1. Online Events**
- Virtual events via video platforms (Zoom, Google Meet, Microsoft Teams)
- Meeting link and access control
- Platform-specific settings (waiting room, recording, passcodes)
- Maximum participants limit

#### **2. Onsite Events**
- In-person gatherings at physical venues
- Venue details (name, address, coordinates)
- Google Maps integration
- Parking and transportation information
- Accessibility features
- Check-in requirements

#### **3. Hybrid Events**
- Combined online and onsite components
- Both meeting link and venue information
- Separate capacity limits for online and onsite
- Dual registration options

#### **4. Hackathon Events**
- Competitive coding/creation events
- Special hackathon-specific details
- Can be online, onsite, or hybrid
- Team formation support

### 3.2. Event Creation Process

#### **Creation Requirements**
- User must be organizer of the community
- Events must be created within a community (no standalone events)
- Multi-step form based on event type

#### **Event Creation Flow**
1. **Type Selection:** Choose event type (online, onsite, hybrid, hackathon)
2. **Basic Details:** Title, short description, full description, category
3. **Date & Time:** Start/end datetime with timezone
4. **Type-Specific Details:**
   - **Online:** Platform type, meeting link, access control
   - **Onsite:** Venue details, address, coordinates, parking info
   - **Hybrid:** Both online and onsite information
   - **Hackathon:** Special hackathon details
5. **Media:** Banner image, thumbnail image
6. **Registration Settings:** Free or paid, capacity limits
7. **Review & Publish:** Final review before publishing

#### **Event Status**
- **Draft:** Event is being created, not yet published
- **Published:** Event is live and visible to users
- **Cancelled:** Event has been cancelled

### 3.3. Event Registration System

#### **Registration Types**
- **Free (RSVP):** No payment required
  - Capacity limits with automated waitlist
  - First-come-first-served basis
- **Paid:** Payment required to register
  - Integration with Razorpay (India) and Stripe (Global)
  - Multiple ticket tiers (Early Bird, VIP, Student, General)

#### **Registration Process**
- Users must be authenticated to register
- Duplicate registration prevention
- Capacity checking before registration
- Automatic waitlist management when capacity is reached
- Registration confirmation with event details

#### **Registration Tracking**
- All registrations stored in `eventRegistrations` table
- Tracks: user_id, event_id, community_id, joined_at (compulsory fields)
- Registration status: confirmed, cancelled, waitlisted
- Guest count support for events allowing guests

### 3.4. Event Attendee Management

#### **Attendee Dashboard**
- View list of all registered attendees
- Filter by: All, Checked-in, No-show
- Search attendees by name
- Export attendee list

#### **Check-In System**
- **Browser-Based:** Manual list check-in for organizers
- **QR Code Scanner:** Mobile view with QR code scanning
- Check-in status tracking
- Real-time attendance updates

#### **Communication Features**
- Email all attendees
- Email filtered groups (checked-in, no-show)
- Automated reminder emails (24h and 1h before event)
- Post-event feedback survey emails (2h after end time)

### 3.5. Event Details & Display

#### **Event Pages**
- Public-facing event detail pages
- Display event title, description, date/time
- Show event type badge (Online, Onsite, Hybrid, Hackathon)
- Registration button (if published and not at capacity)
- Share button for social media
- Map integration for onsite/hybrid events

#### **Event Discovery**
- Browse all published events
- Filter by event type
- Search by title, description, tags
- Sort by date (upcoming first)
- Category-based filtering

#### **Event Tags**
- Multiple tags per event for categorization
- Tags help with discovery and search
- Examples: "JavaScript", "Hiking", "Mental Health", "Tech Talk"

### 3.6. Post-Event Automation

#### **Automated Reminders**
- **24 Hours Before:** Email reminder with event details
- **1 Hour Before:** Final reminder with meeting link/venue info

#### **Feedback System**
- Automated survey email sent 2 hours after event end
- Rating system (1-5 stars)
- Comment/feedback text field
- Feedback aggregation for organizers

---

## 4. Subscription & Premium Features

### 4.1. Subscription System Overview

The platform uses a dual-path subscription system:

#### **Path 1: Standard Paid Subscription**
- For Google/Email authenticated users
- Self-service payment flow
- Immediate activation upon payment success
- Automated renewals and cancellations

#### **Path 2: Request-Based Approval**
- For Wikimedia authenticated users
- Complimentary access upon admin approval
- Manual review process (48-72 hours)
- No payment required

### 4.2. Subscription Plans

#### **Monthly Plan**
- Price: ₹499/month ($6/month USD)
- Auto-renewal enabled by default
- Billing cycle: Monthly

#### **Annual Plan**
- Price: ₹4,999/year ($60/year USD)
- Savings: Equivalent to 2 months free
- Auto-renewal enabled by default
- Billing cycle: Annual

#### **Wikimedia Complimentary**
- Free subscription for approved Wikimedia contributors
- No payment required
- Granted by platform admins
- Same features as paid plans

### 4.3. Premium Features

Users with active premium subscriptions can:

- **Create Unlimited Communities:** No limit on community creation
- **Sub-Chapter Hierarchy:** Create and manage parent-child community structures
- **Multi-Community Management:** Manage multiple communities from single account
- **Advanced Analytics:** Access detailed community and event analytics
- **Financial Overview:** View revenue and payment tracking
- **Priority Support:** Faster response times for support requests
- **Early Access:** Get new features before general release

### 4.4. Subscription Management

#### **User Subscription Dashboard**
- View current subscription status
- See plan type (Monthly/Annual/Wikimedia Complimentary)
- Check next billing date (for paid plans)
- View billing history with invoice downloads
- Update payment method
- Change plan (upgrade/downgrade)
- Cancel subscription

#### **Subscription Status Values**
- **Active:** Subscription is currently active
- **Expired:** Subscription has expired
- **Cancelled:** User cancelled (active until end_date)
- **Payment Failed:** Payment failed, subscription inactive
- **Pending:** Payment pending, subscription not yet active

#### **Cancellation Process**
- Users can cancel paid subscriptions
- Subscription remains active until end_date
- Auto-renewal is disabled
- User downgrades to registered_user on expiration
- Optional feedback collection on cancellation

### 4.5. Wikimedia Request System

#### **Request Form Fields**
- Wikimedia Username (pre-filled, read-only)
- Wikimedia Profile URL (pre-filled, read-only)
- Years Active on Wikimedia
- Contribution Type (Editor, Administrator, Bureaucrat, Organizer, Developer, Other)
- Purpose Statement (required, 500 char limit)
- Edit Count (optional)
- Contributions URL (optional)
- Notable Projects (optional, 300 char limit)
- Alternative Email (optional)
- Phone Number (optional)

#### **Request Status**
- **Pending:** Awaiting admin review
- **Approved:** Admin approved, subscription created
- **Rejected:** Admin rejected the request

#### **Admin Review Process**
- Platform admins review requests at `/admin/subscription-requests`
- View applicant information and Wikimedia credentials
- Approve or reject with admin notes
- Upon approval: Create complimentary subscription, update user role
- Email notifications sent to users

### 4.6. Payment Integration

#### **Razorpay (India)**
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- Net Banking
- Wallets

#### **Stripe (International)**
- Credit/Debit Cards
- Apple Pay, Google Pay
- Bank transfers (ACH, SEPA)

#### **Payment Processing**
- Secure payment gateway integration
- Webhook handling for payment confirmations
- Transaction tracking in `paymentTransactions` table
- Automatic subscription activation on successful payment

---

## 5. User Roles & Permissions

### 5.1. Platform-Level Roles

#### **Registered User**
- Can join chapters
- Can RSVP to events
- Can manage profile
- Cannot create communities (requires premium)

#### **Premium Subscriber**
- All registered user features
- Can create new chapters
- Access to premium features
- Can manage multiple communities

#### **Platform Admin**
- All premium subscriber features
- Can review subscription requests
- Platform-wide administrative access
- Can approve/reject Wikimedia requests

### 5.2. Community-Level Roles

#### **Owner**
- Full control over community
- Can delete communities
- Can manage all settings
- Can assign any role
- Complete control over the community

#### **Organizer**
- High-level permissions
- Can manage members, events, content
- Cannot delete the chapter
- Cannot modify owner role assignments
- Can assign Co-Organizer, Event Manager, Moderator roles

#### **Co-Organizer**
- Assists organizers
- Can manage members, events, content
- Limited access to critical settings
- Cannot delete community or modify organizer roles

#### **Event Manager**
- Focused on event management
- Can create, edit, and manage events
- Can manage attendees
- Cannot access member management
- Cannot access community settings

#### **Moderator**
- Community health role
- Can manage discussions
- Can ban/mute members
- Cannot alter events, settings, or role assignments

#### **Mentor**
- Supportive role
- Focused on member engagement and support
- Limited administrative permissions

#### **Member**
- Standard participant
- Can view community and events
- Can register for events
- No administrative privileges

### 5.3. Permission Matrix

| Action | Owner | Organizer | Co-Organizer | Event Manager | Moderator | Member |
|--------|-------|-----------|-------------|---------------|-----------|--------|
| Delete Community | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Settings | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| Create Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ban/Mute Members | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Join Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

✅ = Full Access | ⚠️ = Limited Access | ❌ = No Access

---

## 6. API Endpoints

### 6.1. Authentication Endpoints

```
POST   /api/auth/[...all]              - Better-auth catch-all route
GET    /api/auth/accounts              - Get user's linked accounts
POST   /api/auth/link-google           - Link Google account
POST   /api/auth/link-mediawiki        - Link MediaWiki account
POST   /api/auth/unlink-account        - Unlink authentication account
POST   /api/auth/add-email             - Add email to account
POST   /api/auth/verify-email          - Verify email address
POST   /api/auth/resend-verification   - Resend verification email
POST   /api/auth/skip-email            - Skip email prompt
GET    /api/auth/check-admin           - Check if user is platform admin
GET    /api/auth/linked-accounts       - Get all linked accounts
```

### 6.2. Community Endpoints

```
POST   /api/communities/create                    - Create new community
GET    /api/communities/[id]                      - Get community details
PUT    /api/communities/[id]/update               - Update community
POST   /api/communities/[id]/join                 - Join community
GET    /api/communities/[id]/members              - Get community members
POST   /api/communities/[id]/members/[memberId]/promote  - Promote member
GET    /api/communities/[id]/admins               - Get community admins
PUT    /api/communities/[id]/admins/[adminId]/role - Change admin role
```

### 6.3. Event Endpoints

```
POST   /api/events/create              - Create/publish event
POST   /api/events/draft               - Save event as draft
GET    /api/events/[id]                - Get event details
PUT    /api/events/[id]                - Update event
POST   /api/events/[id]/register      - Register for event
GET    /api/events/[id]/register      - Check registration status
GET    /api/events/[id]/participants  - Get event participants
```

### 6.4. Subscription Endpoints

```
POST   /api/subscriptions/request      - Submit subscription request (Wikimedia)
GET    /api/subscriptions/request      - Get user's subscription request status
GET    /api/subscriptions/me           - Get user's subscription details
GET    /api/subscriptions/check        - Check subscription status
PUT    /api/subscriptions/cancel       - Cancel subscription
```

### 6.5. Admin Endpoints

```
GET    /api/admin/subscription-requests                    - List all requests
GET    /api/admin/subscription-requests/[requestId]        - Get request details
PUT    /api/admin/subscription-requests/[requestId]       - Approve/reject request
```

---

## 7. Database Schema

### 7.1. Core Tables

#### **Users Table**
- `id` (VARCHAR, Primary Key)
- `email` (VARCHAR, Unique)
- `mediawikiUsername` (VARCHAR, Unique)
- `name` (VARCHAR)
- `emailVerified` (BOOLEAN)
- `emailVerifiedAt` (TIMESTAMP)
- `mediawikiUsernameVerifiedAt` (TIMESTAMP)
- `image` (VARCHAR) - Profile picture URL
- `timezone` (VARCHAR)
- `password` (VARCHAR) - Hashed password
- `bio` (TEXT)
- `emailSkippedAt` (TIMESTAMP)
- `role` (VARCHAR) - "user" or "admin"
- `userType` (VARCHAR) - "registered_user", "premium_subscriber", "platform_admin"
- `subscriptionId` (VARCHAR, Foreign Key)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Communities Table**
- `id` (INT, Primary Key, Auto-increment)
- `name` (VARCHAR)
- `description` (TEXT)
- `photo` (VARCHAR) - Logo/photo URL
- `parentCommunityId` (INT, Foreign Key, Nullable)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Community Admins Table**
- `id` (INT, Primary Key, Auto-increment)
- `userId` (VARCHAR, Foreign Key)
- `communityId` (INT, Foreign Key)
- `role` (VARCHAR) - "owner", "organizer", "coorganizer", etc.
- `assignedAt` (TIMESTAMP)

#### **Community Members Table**
- `id` (INT, Primary Key, Auto-increment)
- `userId` (VARCHAR, Foreign Key)
- `communityId` (INT, Foreign Key)
- `role` (VARCHAR) - "member", "co-organizer", etc.
- `joinedAt` (TIMESTAMP)

#### **Events Table**
- `eventId` (VARCHAR, Primary Key, UUID)
- `eventType` (VARCHAR) - "online", "onsite", "hybrid", "hackathon"
- `title` (VARCHAR)
- `shortDescription` (VARCHAR)
- `fullDescription` (TEXT)
- `categoryId` (VARCHAR)
- `language` (VARCHAR)
- `startDatetime` (TIMESTAMP)
- `endDatetime` (TIMESTAMP)
- `timezone` (VARCHAR)
- `registrationType` (VARCHAR) - "free" or "paid"
- `capacity` (INT, Nullable)
- `status` (VARCHAR) - "draft", "published", "cancelled"
- `primaryOrganizerId` (VARCHAR, Foreign Key)
- `communityId` (INT, Foreign Key)
- `contactEmail` (VARCHAR)
- `contactPhone` (VARCHAR)
- `bannerUrl` (VARCHAR)
- `thumbnailUrl` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `accessibilityFeatures` (TEXT)
- `doorsOpenTime` (VARCHAR)
- `createdAt`, `publishedAt`, `updatedAt` (TIMESTAMP)

#### **Online Event Metadata Table**
- `metadataId` (VARCHAR, Primary Key, UUID)
- `eventId` (VARCHAR, Foreign Key)
- `platformType` (VARCHAR) - "zoom", "google_meet", etc.
- `meetingLink` (VARCHAR)
- `meetingId` (VARCHAR)
- `passcode` (VARCHAR)
- `accessControl` (VARCHAR)
- `waitingRoomEnabled` (BOOLEAN)
- `maxParticipants` (INT)
- `recordingEnabled` (BOOLEAN)
- `recordingAvailability` (VARCHAR)
- `recordingUrl` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Onsite Event Metadata Table**
- `metadataId` (VARCHAR, Primary Key, UUID)
- `eventId` (VARCHAR, Foreign Key)
- `venueName` (VARCHAR)
- `venueType` (VARCHAR)
- `addressLine1`, `addressLine2` (VARCHAR)
- `city`, `state`, `postalCode`, `country` (VARCHAR)
- `roomName`, `floorNumber` (VARCHAR)
- `latitude`, `longitude` (DECIMAL)
- `googleMapsLink` (VARCHAR)
- `landmark` (VARCHAR)
- `parkingAvailable` (BOOLEAN)
- `parkingInstructions` (TEXT)
- `publicTransport` (TEXT)
- `venueCapacity` (INT)
- `seatingArrangement` (VARCHAR)
- `checkInRequired` (BOOLEAN)
- `checkInMethod` (VARCHAR)
- `idVerification` (BOOLEAN)
- `ageRestriction` (VARCHAR)
- `minimumAge` (INT)
- `dressCode` (VARCHAR)
- `itemsNotAllowed` (TEXT)
- `firstAidAvailable` (BOOLEAN)
- `emergencyContact` (VARCHAR)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Event Tags Table**
- `id` (INT, Primary Key, Auto-increment)
- `eventId` (VARCHAR, Foreign Key)
- `tag` (VARCHAR)
- `createdAt` (TIMESTAMP)

#### **Event Registrations Table**
- `registrationId` (VARCHAR, Primary Key, UUID)
- `eventId` (VARCHAR, Foreign Key, Required)
- `userId` (VARCHAR, Foreign Key, Required)
- `communityId` (INT, Foreign Key, Required)
- `joinedAt` (TIMESTAMP, Required)
- `status` (VARCHAR) - "confirmed", "cancelled", "waitlisted"
- `guestCount` (INT)
- `registeredAt` (TIMESTAMP) - Legacy field
- `cancelledAt` (TIMESTAMP)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Subscriptions Table**
- `subscriptionId` (VARCHAR, Primary Key, UUID)
- `userId` (VARCHAR, Foreign Key)
- `planType` (VARCHAR) - "monthly", "annual", "wikimedia_complimentary"
- `status` (VARCHAR) - "active", "expired", "cancelled", "payment_failed", "pending"
- `paymentGateway` (VARCHAR) - "razorpay", "stripe", "admin_grant"
- `startDate` (TIMESTAMP)
- `endDate` (TIMESTAMP, Nullable)
- `amountPaid` (DECIMAL)
- `currency` (VARCHAR)
- `transactionId` (VARCHAR)
- `autoRenew` (BOOLEAN)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Subscription Requests Table**
- `requestId` (VARCHAR, Primary Key, UUID)
- `userId` (VARCHAR, Foreign Key)
- `wikimediaUsername` (VARCHAR)
- `wikimediaProfileUrl` (VARCHAR)
- `yearsActive` (INT)
- `contributionType` (VARCHAR)
- `purposeStatement` (TEXT)
- `editCount` (INT)
- `contributionsUrl` (VARCHAR)
- `notableProjects` (TEXT)
- `alternativeEmail` (VARCHAR)
- `phoneNumber` (VARCHAR)
- `status` (VARCHAR) - "pending", "approved", "rejected"
- `submittedAt` (TIMESTAMP)
- `reviewedAt` (TIMESTAMP)
- `reviewedBy` (VARCHAR, Foreign Key)
- `adminNotes` (TEXT)
- `createdAt`, `updatedAt` (TIMESTAMP)

#### **Payment Transactions Table**
- `transactionId` (VARCHAR, Primary Key, UUID)
- `subscriptionId` (VARCHAR, Foreign Key)
- `gatewayTransactionId` (VARCHAR)
- `paymentGateway` (VARCHAR) - "razorpay" or "stripe"
- `amount` (DECIMAL)
- `currency` (VARCHAR)
- `status` (VARCHAR) - "pending", "success", "failed", "refunded"
- `paymentMethod` (VARCHAR)
- `gatewayResponse` (TEXT) - JSON string
- `createdAt`, `updatedAt` (TIMESTAMP)

### 7.2. Authentication Tables (Better-Auth)

- **Accounts Table:** OAuth provider accounts
- **Sessions Table:** User sessions
- **Verification Tokens Table:** Email verification tokens

---

## 8. Technical Stack

### 8.1. Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives
- **Form Handling:** React Hook Form with Zod validation
- **Maps:** Leaflet with React Leaflet (OpenStreetMap)
- **Icons:** Lucide React
- **Theme:** next-themes (dark/light mode support)

### 8.2. Backend
- **Framework:** Next.js API Routes
- **Authentication:** Better-Auth (formerly NextAuth)
- **Database:** MySQL
- **ORM:** Drizzle ORM
- **Validation:** Zod

### 8.3. External Services
- **Storage:** Amazon S3 (for file uploads)
- **Maps:** Google Maps API / OpenStreetMap
- **Payments:** 
  - Razorpay (India)
  - Stripe (Global)
- **Email:** NodeMailer (SMTP)

### 8.4. Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Database Migrations:** Drizzle Kit
- **Database GUI:** Drizzle Studio

### 8.5. Key Libraries
- `better-auth` - Authentication system
- `drizzle-orm` - Type-safe ORM
- `mysql2` - MySQL driver
- `zod` - Schema validation
- `react-hook-form` - Form management
- `date-fns` - Date utilities
- `nodemailer` - Email sending
- `bcryptjs` - Password hashing
- `leaflet` & `react-leaflet` - Map integration

---

## 9. Key User Flows

### 9.1. User Registration Flow
1. User visits platform
2. Clicks "Sign Up"
3. Chooses authentication method (Google/Email/MediaWiki)
4. Completes OAuth or email verification
5. Redirected to profile completion (if needed)
6. User lands on dashboard

### 9.2. Community Creation Flow
1. User clicks "Create Community" (requires premium)
2. Subscription check (redirect to upgrade if needed)
3. Community creation wizard:
   - Enter name, description, photo
   - Choose: Standalone or Child Chapter
   - If child: Select parent community
4. Community created, user becomes organizer
5. Redirected to community management page

### 9.3. Event Creation Flow
1. User navigates to community
2. Clicks "Create Event"
3. Selects event type (Online/Onsite/Hybrid/Hackathon)
4. Multi-step form:
   - Basic details
   - Date & time
   - Type-specific details
   - Media upload
   - Registration settings
5. Review and publish
6. Event goes live

### 9.4. Event Registration Flow
1. User browses events
2. Clicks on event
3. Views event details
4. Clicks "Register" button
5. System checks:
   - User authentication
   - Event capacity
   - Duplicate registration
6. Registration confirmed
7. Confirmation email sent

### 9.5. Subscription Upgrade Flow (Standard)
1. User clicks "Upgrade to Premium"
2. Subscription form:
   - Plan selection (Monthly/Annual)
   - Billing information
   - Payment method
3. Payment processing
4. Subscription activated
5. User gains premium features

### 9.6. Subscription Request Flow (Wikimedia)
1. Wikimedia user clicks "Request Access"
2. Request form:
   - Wikimedia credentials (pre-filled)
   - Contribution details
   - Purpose statement
3. Request submitted (status: pending)
4. Admin reviews request
5. Approval/Rejection with admin notes
6. If approved: Complimentary subscription created
7. User notified via email

---

## 10. Additional Features & Capabilities

### 10.1. Multi-Community Management
- Single user account can manage multiple communities
- Community switcher in dashboard
- Unified profile across all communities
- Single login session for all communities

### 10.2. Event Discovery
- Global search across chapters, events, and users
- Categorization with robust tagging system
- Recommendation engine based on user skills and location
- Hierarchy browsing for parent-child relationships

### 10.3. Communication Features
- Email notifications for event updates
- Automated reminder emails
- Post-event feedback surveys
- Announcement system with email notifications

### 10.4. Analytics & Reporting
- Community growth metrics
- Event attendance tracking
- Revenue and payment analytics
- Member engagement statistics

### 10.5. Mobile Responsiveness
- Mobile-first design
- Responsive event pages
- Mobile-friendly check-in system
- QR code scanning for check-ins

### 10.6. Accessibility
- Accessibility features for onsite events
- Screen reader support
- Keyboard navigation
- WCAG compliance considerations

---

## 11. Security Features

### 11.1. Authentication Security
- Secure OAuth flows
- Password hashing with bcrypt
- Email verification system
- Session management
- CSRF protection

### 11.2. Authorization
- Role-based access control (RBAC)
- Permission checks on all API routes
- Community-level and platform-level permissions
- Secure admin access

### 11.3. Data Protection
- SQL injection prevention (via Drizzle ORM)
- Input validation with Zod
- Secure file upload handling
- Payment data never stored (handled by gateways)

### 11.4. Privacy
- User data encryption
- Secure session storage
- Privacy settings for communities
- GDPR compliance considerations

---

## 12. Future Enhancements (Planned)

Based on PRD and codebase analysis:

- **Advanced Event Types:** Conference, Workshop, AMA, Panel Discussion, Demo Day, Office Hours, Career Fair
- **Ticketing System:** Advanced ticketing with tiered pricing
- **Agenda Builder:** Tool to create event schedules with time slots and speaker assignments
- **Global Search:** ElasticSearch implementation for advanced search
- **Recommendation Engine:** AI-powered event suggestions
- **Mobile App:** Native mobile applications
- **Team Subscriptions:** Organization-level subscriptions
- **Enterprise Features:** Custom tiers for large organizations
- **Referral Program:** User referral system
- **Gift Subscriptions:** Gift premium access to others
- **Multi-Currency:** Expanded currency support
- **Cryptocurrency Payments:** Crypto payment options

---

## Conclusion

This Community Event Management Platform is a comprehensive solution for organizing and managing communities and events. It provides:

- **Flexible Authentication:** Multiple OAuth providers and email/password
- **Hierarchical Communities:** Parent-child relationships with data inheritance
- **Diverse Event Types:** Online, onsite, hybrid, and hackathon events
- **Premium Subscription System:** Dual-path (paid and request-based) subscription model
- **Robust Permissions:** Multi-level role system for fine-grained access control
- **Complete Event Management:** From creation to post-event feedback
- **Payment Integration:** Razorpay and Stripe support
- **Analytics & Reporting:** Comprehensive tracking and insights

The platform is built with modern technologies, follows best practices, and provides a scalable foundation for community-driven event management.

---

**Document End**

