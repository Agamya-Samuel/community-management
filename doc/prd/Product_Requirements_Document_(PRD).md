# Product Requirements Document (PRD): Community & Event Management Platform

| **Document Version** | 1.1 |
| :--- | :--- |
| **Status** | **Draft / Planning** |
| **Project Type** | Web Application (SaaS / Community Platform) |
| **Reference Models** | Meetup.com, Bevy.com, Google Developers Groups |

---

## 1. Executive Summary
To build a scalable, hierarchy-based community management platform that empowers users to build "Chapters" (communities) and organize diverse "Events." The platform focuses on deep community engagement through advanced profiles, sub-chapter hierarchies with intelligent data inheritance, and robust event management tools (ticketing, check-ins, feedback).

---

## 2. User Roles & Permissions

### 2.1. Platform Level
* **Registered User:** Can join chapters, RSVP to events, and manage their profile.
* **Premium Subscriber:** User with a paid platform subscription. **Privilege:** Authorized to create new Chapters.

### 2.2. Chapter Level (Scoped to specific communities)

The platform operates on a tiered permission system where each role has **separate, distinct controls**:

* **Organizer:** The Chapter owner. Full control over settings, team management, role assignments, and deletion. Can manage multiple communities with a single user account.

* **Co-Organizer:** High-level admin assigned by Organizer. Can manage members, events, and content, but cannot delete the chapter or modify Organizer role assignments.

* **Event Manager:** Restricted role assigned by Organizer or Co-Organizer. Can create, edit, and manage events and attendees only. Cannot access member management or chapter settings.

* **Moderator:** Community health role assigned by Organizer or Co-Organizer. Can manage discussions and members (ban/mute) but cannot alter events, settings, or role assignments.

* **Member:** Standard participant within the chapter.

#### 2.2.1. Role Assignment Process
- Organizers can assign Co-Organizers, Event Managers, and Moderators from the chapter's member list
- Each role has a dedicated permissions dashboard showing exactly what they can/cannot do
- Role changes are logged in an audit trail for transparency

---

## 3. Multi-Community Management

### 3.1. Single Identity Across Communities
**Core Principle:** One user account can manage multiple communities without creating duplicate accounts.

**Implementation:**
* When a Premium Subscriber creates multiple communities, they use the **same user ID/account**
* Dashboard features a "Community Switcher" to navigate between managed communities
* User profile remains unified across all communities they've created or joined
* Single login session provides access to all communities

**User Experience:**
```
Dashboard View:
┌─────────────────────────────────┐
│ My Communities                   │
│ ├─ Wikimedia India (Organizer)  │
│ ├─ Tech Meetup Delhi (Organizer)│
│ └─ Python Learners (Member)     │
└─────────────────────────────────┘
```

### 3.2. Hierarchical Communities with Data Inheritance

**Parent-Child Chapter Relationship:**

When creating sub-chapters (child communities) under a parent community, the system automatically **fetches and inherits** organizer details from the parent - eliminating data duplication.

**Inheritance Rules:**
1. **Organizer Identity:** Child chapters automatically inherit the parent's Organizer(s)
2. **Branding (Optional):** Logo, banner, and color scheme can be inherited
3. **Guidelines (Optional):** Code of conduct and community rules can cascade down
4. **No Data Duplication:** Organizer information is referenced, not copied

**Example Structure:**
```
Parent: "Wikimedia India" (Organizer: Rajesh Kumar)
  ↳ Child: "WikiClub Tech SHUATS" (Auto-inherits Rajesh as Organizer)
  ↳ Child: "WikiClub Tech IIITH" (Auto-inherits Rajesh as Organizer)
  ↳ Child: "WikiClub BHU" (Auto-inherits Rajesh as Organizer)
```

**Child Chapter Flexibility:**
- Child chapters can add **additional local Co-Organizers** specific to that chapter
- Local Event Managers and Moderators can be assigned independently
- Child chapters can customize their own events, descriptions, and local settings
- Parent Organizer always retains top-level access to all child chapters

**Benefits:**
- Update organizer information once, reflects across all child chapters
- Consistent leadership identity across the hierarchy
- Simplified management for umbrella organizations
- Clear organizational structure for members

---

## 4. Event Typology
Events are the core interaction unit. Below is the expanded list of supported event types.

**Standard Types:**
1.  **Conference:** Large-scale, multi-session event.
2.  **Info Session:** Brief informational meeting.
3.  **Watch Party:** Group video viewing.
4.  **Integrated Virtual Conference:** (Native video integration or Bevy-style implementation).
5.  **External Ticketing:** Redirects to third-party sites (e.g., Eventbrite).
6.  **Hackathon:** Competition-based coding/creation event.
7.  **Workshop / Study Group:** Hands-on learning.
8.  **Speaker Session / Tech Talk:** Expert presentation.
9.  **Social / Networking:** Informal gathering.
10. **Test Event:** Sandbox mode for organizers to test layouts.

**Additional Suggested Types:**
11. **AMA (Ask Me Anything):** Q&A focused session.
12. **Panel Discussion:** Multiple speakers debating a topic.
13. **Demo Day:** Showcasing projects or startups.
14. **Office Hours:** Drop-in mentorship sessions.
15. **Career Fair:** Recruiting and networking focus.

**Event Modalities:**
* **Online:** Virtual link provided.
* **Hybrid:** Physical location + Virtual link.
* **In-Person:** Physical location (Map integration).

---

## 5. Functional Requirements

### 5.1. User & Identity
* **OAuth Registration:** One-click sign-up/login via **Wikimedia**, Google, and Email/Password.
* **Advanced User Profile:**
    * **Basic:** Name, Bio, Profile Picture, Banner Image.
    * **Social:** Links to Portfolio, LinkedIn, Twitter, GitHub.
    * **Skills & Interests:** Tag-based input (e.g., "React," "Public Speaking"). *Crucial for discovery and networking.*
* **Personal Dashboard:**
    * **My Communities:** List of all chapters (with role badges: Organizer, Co-Organizer, Member)
    * **Community Switcher:** Quick navigation between managed communities
    * **Calendar:** "My Upcoming Events" with visual timeline.
    * **Inbox:** Pending invites and direct messages.
    * **Feed:** Global notifications (event updates, announcements).

### 5.2. Community Management

#### 5.2.1. Chapter Creation Wizard
* Step-by-step UI for Premium users to define Name, Description, Logo, Banner, and Location/Timezone
* Option to create as **Standalone** or **Child Chapter** (under existing parent)
* If creating a child chapter, automatically inherits parent organizer details

#### 5.2.2. Sub-Chapters (Hierarchy)
* **Parent Chapter Selection:** When creating a child chapter, select from user's existing communities
* **Auto-Inheritance Display:** Clear UI showing which details are inherited vs. customizable
* **Inheritance Settings:**
  * Organizer identity (always inherited, cannot be changed at child level)
  * Branding (optional toggle)
  * Guidelines (optional toggle)
* **Local Customization:** Child chapters can add local team members and customize events

#### 5.2.3. Privacy Settings
* **Public:** Discoverable in search; anyone can view and join.
* **Private:** Discoverable; users must "Request to Join" (Organizer approval required).
* **Unlisted:** Hidden from search; accessible via direct Invite Link only.

#### 5.2.4. Team Management
* **Role Assignment Interface:** Organizers can promote members to Co-Organizer, Event Manager, or Moderator
* **Permissions Matrix:** Clear display of what each role can do
* **Audit Log:** Track all role changes and administrative actions

#### 5.2.5. Chapter Features
* **Member Directory:** Searchable list within the chapter. Filters: *Name, Skills, Interests.*
* **User Management:** Ban/Suspend capabilities for Organizers, Co-Organizers, and Moderators
* **Analytics Dashboard:**
  * Total Events Hosted
  * Total Members
  * Growth metrics over time
* **Financial Overview:** 
  * Total Tickets Sold
  * Total Revenue
  * Payment breakdowns (available to Organizers and Co-Organizers only)

### 5.3. Event Management
* **Rich Event Creator:**
    * WYSIWYG Editor / Markdown support for descriptions.
    * Media upload (Banner Image/Video).
    * **Agenda Builder:** Tool to create schedules (Time slots + Speaker assignment).
    * **Location:** Google Maps API integration for physical venues.
    * **Creator Role Check:** Event Managers, Co-Organizers, and Organizers can create events
* **Ticketing System:**
    * **Free (RSVP):** Counter for capacity limits + Automated Waitlist management.
    * **Paid:** Integration with **Razorpay** (India focus) and **Stripe** (Global).
    * **Tiering:** Ability to create "Early Bird," "VIP," "Student," "General Admission."
* **Attendee Management:**
    * Dashboard to view list of RSVPs (accessible to Event Managers, Co-Organizers, Organizers)
    * **Check-in:** Browser-based list check-in OR QR Code scanner via mobile view.
    * **Communication:** "Email Attendees" feature (filters: All, Checked-in, No-show).
* **Post-Event Automation:**
    * **Reminders:** Automated emails/push notifications sent 24h and 1h before start.
    * **Feedback Loop:** Automated survey email sent 2h after end time (Rating 1-5 stars + Comment).

### 5.4. Discovery & Engagement
* **Global Search:** ElasticSearch (or similar) implementation to query Chapters, Events, and Users simultaneously.
* **Categorization:** Robust tagging system (e.g., "JavaScript," "Hiking," "Mental Health").
* **Recommendation Engine:** "Events you might like" widget on Dashboard based on User Skills + Location.
* **Hierarchy Browsing:** Ability to view parent-child chapter relationships visually
* **Announcements:**
    * "Pinned Post" logic for Chapter feeds.
    * Trigger email notifications to all chapter members.

---

## 6. Monetization & Admin

### 6.1. Business Model
1.  **Platform Subscription (SaaS):**
    * **Pro Tier:** Charge Organizers/Companies for:
      * Creating chapters
      * Accessing advanced analytics
      * Using the "Sub-chapter" hierarchy feature
      * Managing multiple communities from single account
      * Priority support

---

## 7. UI/UX & Design Guidelines
The design should evoke trust, growth, and community.

**Color Palette:**
* **Primary (Calming Blue):** `#00669A` (Headers, Primary Buttons, Branding)
* **Secondary (Growth Green):** `#2F9A67` (Success states, Join buttons, Accents)
* **Alert/Action (Tint of Red):** `#9B0000` (Delete actions, Errors, Important Notifications)
* **Neutral:** White backgrounds, light grey for cards/sections.

**Design Principles:**
* **Clean & Spacious:** Avoid clutter; focus on readability of event details.
* **Mobile First:** Ensure the Ticket Check-in and Event Discovery work seamlessly on mobile browsers.
* **Clear Role Indicators:** Visual badges showing user roles in each community
* **Hierarchy Visualization:** Tree-view or nested card design for parent-child chapters

---

## 8. Technical Considerations

### 8.1. Technology Stack
* **Package Manager:** Pnpm
* **Monorepo:** Turborepo
* **Frontend:** Next.js (for SEO on public event pages)
* **Backend:** Next.js API Routes
* **Authentication:** Auth.js with providers for Email, Wikimedia, and Google
* **Database:** MySQL (Relational data for Users/Chapters/Events is critical)
* **Data Modeling:** Drizzle ORM for MySQL
* **Storage:** S3 (Amazon Simple Storage Service)
* **Maps:** Google Maps API or Mapbox
* **Payments:** Razorpay (India) & Stripe (Global)
* **Email:** NodeMailer and Resend

### 8.2. Database Design Considerations

**Key Relationships:**
* **User ↔ Chapters:** Many-to-many (a user can be in multiple chapters with different roles)
* **Chapters ↔ Parent/Child:** Self-referencing relationship with `parent_chapter_id`
* **User ↔ Organizer Role:** One user can be organizer of multiple chapters (same `user_id`)
* **Chapter Roles:** Junction table storing user_id, chapter_id, role_type

**Data Inheritance Implementation:**
* Child chapters store `parent_chapter_id` as foreign key
* Organizer queries use recursive lookup to parent chapter
* Branding/guidelines use inheritance flags (boolean) with fallback to parent data

---

## 9. Key User Flows

### 9.1. Multi-Community Management Flow
```
1. User logs in (single account)
2. Dashboard shows "My Communities" with role badges
3. User clicks "Create New Community"
4. Chooses: "Standalone" or "Child of [existing community]"
5. If child: System auto-fills organizer from parent
6. User customizes local settings
7. Community created, appears in dashboard switcher
```

### 9.2. Hierarchical Chapter Creation Flow
```
1. Organizer of "Wikimedia India" wants to create sub-chapter
2. Clicks "Create Child Chapter"
3. System automatically:
   - Inherits organizer identity (Rajesh Kumar)
   - Offers to inherit branding/guidelines
4. Organizer names it "WikiClub Tech SHUATS"
5. Can add local Co-Organizers specific to SHUATS
6. Child chapter is live, linked to parent
```

---

## 10. Success Metrics
* **User Engagement:** Average events attended per user per month
* **Community Growth:** New chapters created monthly
* **Hierarchy Adoption:** % of chapters using parent-child structure
* **Multi-Community Management:** Average communities managed per organizer
* **Event Success:** Average attendance rate, feedback scores
* **Revenue:** Premium subscription conversion rate

---

## Document Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Base PRD |
| 2.0 | Dec 22, 2025 | Added multi-community management with single identity, hierarchical data inheritance, removed volunteer role, clarified role permissions |