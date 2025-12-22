# Product Requirements Document (PRD): Community & Event Management Platform

| **Document Version** | 1.0 |
| :--- | :--- |
| **Status** | **Draft / Planning** |
| **Project Type** | Web Application (SaaS / Community Platform) |
| **Reference Models** | Meetup.com, Bevy.com, Google Developers Groups |

---

## 1. Executive Summary
To build a scalable, hierarchy-based community management platform that empowers users to build "Chapters" (communities) and organize diverse "Events." The platform focuses on deep community engagement through advanced profiles, sub-chapter hierarchies (parent-child relationships), and robust event management tools (ticketing, check-ins, feedback).

---

## 2. User Roles & Permissions
The platform operates on a tiered permission system.

### 2.1. Platform Level
* **Registered User:** Can join chapters, RSVP to events, and manage their profile.
* **Premium Subscriber:** User with a paid platform subscription. **Privilege:** Authorized to create new Chapters.

### 2.2. Chapter Level (Scoped to specific communities)
* **Organizer:** The Chapter owner. Full control over settings, team management, and deletion.
* **Co-Organizer:** High-level admin. Can manage members, events, and content, but cannot delete the chapter.
* **Event Manager:** Restricted role. Can create, edit, and manage events/attendees only.
* **Moderator:** Community health role. Can manage discussions and members (ban/mute) but cannot alter events or settings.
* **Member:** Standard participant within the chapter.

---

## 3. Event Typology
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

## 4. Functional Requirements

### 4.1. User & Identity
* **OAuth Registration:** One-click sign-up/login via **Wikimedia**, Google, and Email/Password.
* **Advanced User Profile:**
    * **Basic:** Name, Bio, Profile Picture, Banner Image.
    * **Social:** Links to Portfolio, LinkedIn, Twitter, GitHub.
    * **Skills & Interests:** Tag-based input (e.g., "React," "Public Speaking"). *Crucial for discovery and networking.*
* **Personal Dashboard:**
    * **My Communities:** List of joined chapters.
    * **Calendar:** "My Upcoming Events" with visual timeline.
    * **Inbox:** Pending invites and direct messages.
    * **Feed:** Global notifications (event updates, announcements).

### 4.2. Community Management
* **Chapter Creation Wizard:** Step-by-step UI for Premium users to define Name, Description, Logo, Banner, and Location/Timezone.
* **Sub-Chapters (Hierarchy):**
    * *Logic:* Parent Chapter (e.g., "Wikimedia India") $\rightarrow$ Child Chapters (e.g., "WikiClub Tech SHUATS," "WikiClub Tech IIITH").
    * *Inheritance:* Child chapters can inherit branding or guidelines from the Parent.
* **Privacy Settings:**
    * **Public:** Discoverable in search; anyone can view and join.
    * **Private:** Discoverable; users must "Request to Join" (Organizer approval required).
    * **Unlisted:** Hidden from search; accessible via direct Invite Link only.
* **Member Directory:** Searchable list within the chapter. Filters: *Name, Skills, Interests.*
* **User Management:** Ban/Suspend.
* **Analytics:** Total Events Hosted, Total Members.
* **Financial Overview:** Total Tickets Sold, Total Revenue.

### 4.3. Event Management
* **Rich Event Creator:**
    * WYSIWYG Editor / Markdown support for descriptions.
    * Media upload (Banner Image/Video).
    * **Agenda Builder:** Tool to create schedules (Time slots + Speaker assignment).
    * **Location:** Google Maps API integration for physical venues.
* **Ticketing System:**
    * **Free (RSVP):** Counter for capacity limits + Automated Waitlist management.
    * **Paid:** Integration with **Razorpay** (India focus) and **Stripe** (Global).
    * **Tiering:** Ability to create "Early Bird," "VIP," "Student," "General Admission."
* **Attendee Management:**
    * Dashboard to view list of RSVPs.
    * **Check-in:** Browser-based list check-in OR QR Code scanner via mobile view.
    * **Communication:** "Email Attendees" feature (filters: All, Checked-in, No-show).
* **Post-Event Automation:**
    * **Reminders:** Automated emails/push notifications sent 24h and 1h before start.
    * **Feedback Loop:** Automated survey email sent 2h after end time (Rating 1-5 stars + Comment).

### 4.4. Discovery & Engagement
* **Global Search:** ElasticSearch (or similar) implementation to query Chapters, Events, and Users simultaneously.
* **Categorization:** Robust tagging system (e.g., "JavaScript," "Hiking," "Mental Health").
* **Recommendation Engine:** "Events you might like" widget on Dashboard based on User Skills + Location.
* **Announcements:**
    * "Pinned Post" logic for Chapter feeds.
    * Trigger email notifications to all chapter members.

---

## 5. Monetization & Admin

### 5.1. Business Model
1.  **Platform Subscription (SaaS):**
    * **Pro Tier:** Charge Organizers/Companies for creating chapters, accessing analytics, and using the "Sub-chapter" feature.

---

## 6. UI/UX & Design Guidelines
The design should evoke trust, growth, and community.

**Color Palette:**
* **Primary (Calming Blue):** `#00669A` (Headers, Primary Buttons, Branding)
* **Secondary (Growth Green):** `#2F9A67` (Success states, Join buttons, Accents)
* **Alert/Action (Tint of Red):** `#9B0000` (Delete actions, Errors, Important Notifications)
* **Neutral:** White backgrounds, light grey for cards/sections.

**Design Principles:**
* **Clean & Spacious:** Avoid clutter; focus on readability of event details.
* **Mobile First:** Ensure the Ticket Check-in and Event Discovery work seamlessly on mobile browsers.

---

## 7. Technical Considerations (Suggested)
* **Package Manager:** Pnpm
* **Monorepo:** Turborepo
* **Frontend:** Next.js (for SEO on public event pages).
* **Backend:** Next.js API Routes.
* **Authentication:** Auth.js with provider for Email, Wikimedia and Google.
* **Database:** MySQL (Relational data for Users/Chapters/Events is critical).
* **Data Modeling:** Drizzle ORM for MySQL.
* **Storage:** S3 (Amazon Simple Storage Service)
* **Maps:** Google Maps API or Mapbox.
* **Payments:** Razorpay (India) & Stripe (Global).
* **Email:** NodeMailer and Resend.
