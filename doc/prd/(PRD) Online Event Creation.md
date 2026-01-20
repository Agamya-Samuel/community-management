# Product Requirements Document: Online Event Creation

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Event Type** | Online Events |
| **Last Updated** | January 7, 2026 |

---

## 1. Overview

This document defines the multi-page event creation flow specifically for **Online Events** where organizers host virtual events via video platforms.

---

## 2. Event Creation Flow

### Step 1: Event Type Selection (Entry Point)

**Screen:**
```
What type of event are you creating?

[ ] Online Event - Virtual events via video platforms
[ ] Onsite Event - In-person gatherings
[ ] Hybrid Event - Combined online and onsite
[ ] Hackathon - Competitive coding events
[ ] Edit-a-thon - Collaborative editing sessions
[ ] Workshop - Training sessions
[ ] Networking - Social meetups

[Continue]
```

**Rules:**
- User MUST select event type first
- Selection determines which pages appear next
- Once published, event type cannot be changed
- Draft events allow type changes with data migration warnings

---

## 3. Multi-Page Form (Online Events)

### Page 1: Basic Event Details

**Purpose:** Capture core event information

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Title | Text | Yes | 10-100 characters |
| Short Description | Textarea | Yes | 50-200 characters |
| Full Description | Rich Text | Yes | Min 200 characters |
| Category | Dropdown | Yes | From predefined list |
| Tags | Multi-select | No | Max 5 tags |
| Language | Dropdown | Yes | ISO language codes |
| Accessibility | Checkboxes | No | Multiple options |

**Example:**
```
Event Title: [Introduction to React Hooks          ]
Short Description:
[Learn React Hooks from basics to advanced patterns]

Full Description:
[Rich text editor with formatting options...]

Category: [Technology ▼]
Tags: [React] [JavaScript] [Beginner-friendly]
Language: [English ▼]

Accessibility Features:
☑ Live captions
☐ Sign language interpretation
☑ Screen reader friendly

[Save Draft] [Continue →]
```

---

### Page 2: Date & Time

**Purpose:** Define when the event occurs

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Start Date | Date Picker | Yes | Future date (min 2 hours ahead) |
| Start Time | Time Picker | Yes | HH:MM format |
| End Date | Date Picker | Yes | Must be ≥ start date |
| End Time | Time Picker | Yes | Must be > start time |
| Timezone | Dropdown | Yes | IANA timezone database |
| Display Timezone | Radio | Yes | Organizer/Attendee Local |
| Registration Deadline | DateTime | No | Before event start |
| Is Recurring | Toggle | No | Boolean |

**Example:**
```
Start Date: [Feb 15, 2026]  Start Time: [3:00 PM]
End Date: [Feb 15, 2026]    End Time: [5:30 PM]

Timezone: [Asia/Kolkata (IST) ▼]
Duration: 2 hours 30 minutes (calculated)

Display time to attendees in:
( ) Organizer timezone (IST)
(●) Their local timezone

Registration closes: [Feb 15, 2026 at 1:00 PM]

Is this a recurring event? [ No ▼]

[← Back] [Continue →]
```

---

### Page 3: Platform & Access (Online Event Specific)

**Purpose:** Configure virtual meeting platform and access control

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Platform Type | Radio | Yes | Single selection |
| Meeting Link | Text | Yes | Valid HTTPS URL |
| Meeting ID | Text | Conditional | Alphanumeric |
| Passcode | Text | No | Min 4 characters |
| Access Control | Radio | Yes | Single selection |
| Waiting Room | Toggle | No | Boolean |
| Max Participants | Number | No | Positive integer |
| Recording Enabled | Toggle | No | Boolean |
| Recording Access | Radio | Conditional | If recording enabled |

**Example:**
```
Platform:
(●) Zoom
( ) Google Meet
( ) Microsoft Teams
( ) YouTube Live
( ) Custom Platform

Meeting Link: [https://zoom.us/j/123456789      ]
Meeting ID: [123 456 789] (auto-extracted)
Passcode: [abc123]

Access Control:
( ) Public - Anyone with link can join
(●) Registered Users Only - Must RSVP first
( ) Approved Registrations - Manual approval
( ) Private/Invite-Only

Features:
☑ Enable waiting room
☐ Auto-admit registered users
Max Participants: [500]

Recording:
☑ Enable recording
Recording available to:
(●) Registered attendees only
( ) Everyone
( ) Only attendees who joined
( ) Organizers only

[← Back] [Continue →]
```

---

### Page 4: Registration & Tickets

**Purpose:** Configure attendee registration and capacity

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Registration Type | Radio | Yes | Free/Paid |
| Event Capacity | Number | No | Positive integer |
| Ticket Tiers | Dynamic List | Conditional | If paid |
| Custom Questions | Dynamic List | No | Max 10 questions |
| Waitlist Enabled | Toggle | No | Boolean |
| Registration Opens | DateTime | No | Before event |
| Registration Closes | DateTime | No | Before event |
| Require Approval | Toggle | No | Boolean |

**Example (Free Event):**
```
Registration Type:
(●) Free Event (RSVP)
( ) Paid Event (Ticketing)

Capacity: [500] attendees
☑ Enable waitlist when full (max 100)

Registration Period:
Opens: [Now] or [Select Date/Time]
Closes: [Feb 15, 2026 at 1:00 PM]

Custom Questions:
1. What's your experience level?
   Type: [Multiple Choice]
   Options: Beginner, Intermediate, Advanced
   ☑ Required

2. Any specific topics you want covered?
   Type: [Short Text]
   ☐ Required

[+ Add Question]

☐ Require manual approval for registrations

[← Back] [Continue →]
```

**Example (Paid Event):**
```
Registration Type:
( ) Free Event (RSVP)
(●) Paid Event (Ticketing)

Ticket Tiers:
┌─────────────────────────────────────┐
│ Early Bird                          │
│ Price: ₹299  Available: 50 tickets  │
│ Sales: Jan 10 - Jan 20, 2026        │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ General Admission                   │
│ Price: ₹499  Available: 200 tickets │
│ Sales: Jan 21 - Feb 15, 2026        │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

[+ Add Ticket Tier]

Total Capacity: 250 attendees

[← Back] [Continue →]
```

---

### Page 5: Organizers & Roles

**Purpose:** Add team members and define roles

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Primary Organizer | Display | Yes | Current user (read-only) |
| Co-Organizers | User Search | No | Max 10 users |
| Speakers | Dynamic List | No | Name + details |
| Event Managers | User Search | No | Max 20 users |
| Moderators | User Search | No | Max 10 users |
| Contact Email | Email | Yes | Valid email |
| Contact Phone | Phone | No | Valid phone format |

**Example:**
```
Primary Organizer: You (Adarsh Suman)

Co-Organizers:
[Search by email...]
• rajesh@example.com (Invited)
• priya@example.com (Accepted)
[+ Add Co-Organizer]

Speakers:
┌─────────────────────────────────────┐
│ Name: [Vikram Mehta              ]  │
│ Title: [Sr. Engineer, Google     ]  │
│ Bio: [Vikram has 10+ years...]      │
│ Session Topic: [React Best Practices]│
│ Duration: [45] minutes              │
│ [Remove Speaker]                    │
└─────────────────────────────────────┘
[+ Add Speaker]

Event Managers: (can manage registrations)
[Search by email...]

Moderators: (can manage Q&A and chat)
[Search by email...]

Public Contact:
Email: [events@community.org]
Phone: [+91 98765 43210] (optional)

[← Back] [Continue →]
```

---

### Page 6: Media & Branding

**Purpose:** Upload images and branding assets

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Banner | Image Upload | Yes | Max 5MB, 1920x1080px |
| Event Thumbnail | Image Upload | Yes | Max 2MB, 800x800px |
| Event Logo | Image Upload | No | Max 1MB, 500x500px PNG |
| Gallery Images | Multi-Upload | No | Max 10 images |
| Promotional Video | URL/Upload | No | YouTube/Vimeo or max 100MB |
| Brand Color | Color Picker | No | Hex code |

**Example:**
```
Event Banner (Required)
┌─────────────────────────────────────┐
│    [📁 Upload or Drag & Drop]       │
│                                     │
│  Recommended: 1920 x 1080 pixels    │
│  Format: JPG, PNG | Max: 5 MB       │
└─────────────────────────────────────┘
[Browse Stock Images]

Event Thumbnail (Required)
[Upload] banner-thumb.jpg (800x800)
[✓ Uploaded]

Gallery Images (Optional)
[img1] [img2] [img3] [+ Add]

Promotional Video (Optional)
(●) YouTube/Vimeo Link
[https://youtube.com/watch?v=...]

( ) Upload Video

Brand Color:
[#00669A] 🎨 (optional)

[← Back] [Continue →]
```

---

### Page 7: Review & Publish

**Purpose:** Final review before publishing

**Layout:**
```
Review Your Event

┌─────────────────────────────────────┐
│ ✓ Basic Details              [Edit] │
│ Title: Introduction to React Hooks  │
│ Category: Technology                │
│ Language: English                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Date & Time                [Edit] │
│ Feb 15, 2026 at 3:00 PM IST        │
│ Duration: 2 hours 30 minutes        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Platform & Access          [Edit] │
│ Platform: Zoom                      │
│ Access: Registered Users Only       │
│ Recording: Enabled                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Registration               [Edit] │
│ Type: Free Event                    │
│ Capacity: 500 attendees             │
│ Waitlist: Enabled                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Team                       [Edit] │
│ Organizer: Adarsh Suman             │
│ Co-Organizers: 2                    │
│ Speakers: 1                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Media                      [Edit] │
│ Banner: ✓ Uploaded                  │
│ Thumbnail: ✓ Uploaded               │
│ Gallery: 3 images                   │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-Submit Check:
✓ All required fields complete
✓ Event date is in future
✓ Platform link is valid
✓ Images uploaded
⚠️ Consider adding speaker bio

Publishing Options:
Visibility:
(●) Public
( ) Unlisted
( ) Private

☑ Notify community followers
☑ Submit to discovery feeds

[← Save as Draft]  [Publish Event →]
```

**After Publishing:**
```
🎉 Event Published!

Your event is now live at:
https://community.org/events/react-hooks-123

[Copy Link] [Share] [View Event] [Dashboard]
```

---

## 4. Page Navigation Rules

**Navigation Controls:**
- "Continue" button: Validates current page, advances to next
- "Back" button: Returns to previous page, no validation
- "Save Draft" button: Available on all pages, saves progress
- Progress indicator: Shows "Page X of 7" at top
- Breadcrumb: Allows jumping to completed pages

**Validation:**
- Inline validation on field blur (immediate feedback)
- Page-level validation on "Continue" click
- Cannot advance if required fields missing
- Error summary appears at top of page
- Auto-scroll to first error field

**Draft Auto-Save:**
- Auto-saves every 30 seconds
- Saves on page navigation
- Shows "Draft saved at [time]" indicator
- Resume from last edited page

---

## 5. Data Model

### Core Tables

**events table:**
```sql
- event_id (UUID, PK)
- event_type (ENUM: 'online', 'onsite', etc.)
- title (VARCHAR 100)
- short_description (VARCHAR 200)
- full_description (TEXT)
- category_id (UUID, FK)
- language (VARCHAR 10)
- start_datetime (TIMESTAMP)
- end_datetime (TIMESTAMP)
- timezone (VARCHAR 50)
- registration_type (ENUM: 'free', 'paid')
- capacity (INT)
- status (ENUM: 'draft', 'published', 'cancelled')
- primary_organizer_id (UUID, FK)
- contact_email (VARCHAR 255)
- banner_url (VARCHAR 500)
- thumbnail_url (VARCHAR 500)
- slug (VARCHAR 200, UNIQUE)
- created_at (TIMESTAMP)
- published_at (TIMESTAMP)
```

**online_event_metadata table:**
```sql
- metadata_id (UUID, PK)
- event_id (UUID, FK)
- platform_type (ENUM: 'zoom', 'google_meet', etc.)
- meeting_link (VARCHAR 500)
- meeting_id (VARCHAR 100)
- passcode (VARCHAR 50)
- access_control (ENUM)
- waiting_room_enabled (BOOLEAN)
- max_participants (INT)
- recording_enabled (BOOLEAN)
- recording_availability (ENUM)
- recording_url (VARCHAR 500)
```

**Supporting Tables:**
- event_tags (event_id, tag)
- event_team (event_id, user_id, role)
- event_speakers (event_id, name, bio, etc.)
- registration_questions (event_id, question_text, type)
- ticket_tiers (event_id, tier_name, price, quantity)
- event_registrations (registration_id, event_id, user_id)
- event_feedback (event_id, user_id, rating, comment)
- event_gallery (event_id, image_url)

---

## 6. Notifications

### Automated Emails

| Trigger | Recipient | Timing | Content |
|---------|-----------|--------|---------|
| Event Published | Organizer | Immediate | Confirmation + URL |
| User Registered | Attendee | Immediate | Confirmation + Calendar invite |
| User Registered | Organizer | Immediate | New registration alert |
| 7 Days Before | Attendee | 7 days | Early reminder |
| 24 Hours Before | Attendee | 24 hours | Day-before reminder |
| 1 Hour Before | Attendee | 1 hour | Join link + instructions |
| Event Started | Organizer | On start | Dashboard link |
| 2 Hours After | Attendee | 2 hours | Thank you + feedback survey |
| Recording Ready | Attendee | On upload | Recording link |

---

## 7. Validation Rules Summary

**All Pages:**
- Required fields must be filled
- Field-level validation on blur
- Cannot continue with errors
- Error messages in red below fields
- Success indicators (green checkmarks)

**Page 1 - Basic Details:**
- Title: 10-100 chars
- Short description: 50-200 chars
- Full description: Min 200 chars
- Category: Must select from list
- Tags: Max 5, each 20 chars max

**Page 2 - Date & Time:**
- Start date: Min 2 hours in future
- End time: Must be after start time
- Max event duration: 7 days
- Registration deadline: Before event start

**Page 3 - Platform:**
- Meeting link: Valid HTTPS URL
- Platform-specific validation (Zoom, Meet, etc.)
- Passcode: Min 4 chars if provided
- Max participants: Must be positive integer

**Page 4 - Registration:**
- Capacity: Must be positive if set
- Ticket tiers: Min 1 if paid event
- Each tier: Name, price, quantity required
- Custom questions: Max 10

**Page 5 - Team:**
- Contact email: Valid format
- Co-organizers: Max 10
- Speakers: Max 20
- Each speaker: Name required, bio max 300 chars

**Page 6 - Media:**
- Banner: Required, max 5MB, JPG/PNG
- Thumbnail: Required, max 2MB, square preferred
- Gallery: Max 10 images, 3MB each
- Video: Max 100MB or valid URL

**Page 7 - Review:**
- All previous pages must be complete
- All required validations must pass
- Event date must still be in future

---

## 8. Success Metrics

**Event Creation:**
- Form completion rate: Target >75%
- Average time to create: Target <10 minutes
- Draft save rate: Target >40%
- Page-by-page drop-off rates

**Event Performance:**
- Registration conversion: Target >60%
- Attendance rate: Target >70%
- Feedback submission: Target >50%
- Average rating: Target >4.2/5.0

---

## 9. Future Enhancements

- AI-generated descriptions
- Event cloning feature
- Calendar integrations (Google, Outlook)
- Live event analytics dashboard
- Automated post-event reports
- Integration with more platforms (Discord, Twitch)
- Multi-language support for forms
- Advanced custom branding options

---

**End of Document**