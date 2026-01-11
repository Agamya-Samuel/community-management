# Product Requirements Document: Hybrid Event Creation

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Event Type** | Hybrid Events |
| **Last Updated** | January 7, 2026 |

---

## 1. Overview

This document defines the multi-page event creation flow specifically for **Hybrid Events** where organizers host events with both physical (onsite) and virtual (online) attendance options simultaneously.

---

## 2. Event Type Selection (Entry Point)

**Screen:**
```
What type of event are you creating?

[ ] Online Event - Virtual events via video platforms
[ ] Onsite Event - In-person gatherings
[●] Hybrid Event - Combined online and onsite
[ ] Hackathon - Competitive coding events
[ ] Edit-a-thon - Collaborative editing sessions
[ ] Workshop - Training sessions
[ ] Networking - Social meetups

[Continue]
```

**Rules:**
- User MUST select event type first
- Hybrid combines online + onsite features
- Once published, event type cannot be changed
- Draft events allow type changes with warnings

---

## 3. Multi-Page Form (Hybrid Events)

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
Event Title: [Global Tech Summit 2026                  ]

Short Description:
[Join us in-person or online for the biggest tech event
of the year featuring industry leaders and innovators]

Full Description:
[Rich text editor...
Experience the future of technology either from our
state-of-the-art venue in Mumbai or from the comfort
of your home. Network with 500+ attendees, attend
workshops, and hear from top speakers...]

Category: [Technology ▼]
Tags: [Tech Summit] [AI] [Innovation] [Networking]
Language: [English ▼]

Accessibility Features:
☑ Wheelchair accessible venue (onsite)
☑ Live captions (online & onsite)
☑ Sign language interpretation (onsite)
☑ Screen reader friendly (online)

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
| Doors Open Time | Time Picker | No | For onsite attendees |
| Online Access Opens | Time Picker | No | For virtual attendees |
| Registration Deadline | DateTime | No | Before event start |
| Is Recurring | Toggle | No | Boolean |

**Example:**
```
Start Date: [March 15, 2026]  Start Time: [10:00 AM]
End Date: [March 15, 2026]    End Time: [6:00 PM]

Timezone: [Asia/Kolkata (IST) ▼]
Duration: 8 hours (calculated)

Display time to attendees in:
( ) Organizer timezone (IST)
(●) Their local timezone (Recommended for hybrid)

Onsite Access:
Doors Open: [9:00 AM] (1 hour before start)

Online Access:
Virtual Platform Opens: [9:45 AM] (15 min before)

Registration closes: [March 14, 2026 at 11:59 PM]

Is this a recurring event? [ No ▼]

[← Back] [Continue →]
```

---

### Page 3: Attendance Mode Selection (Hybrid Specific)

**Purpose:** Configure how attendees can participate

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Attendance Options | Checkboxes | Yes | At least one required |
| Onsite Capacity | Number | Conditional | If onsite enabled |
| Online Capacity | Number | Conditional | If online enabled |
| Pricing Model | Radio | Yes | Single selection |
| Allow Mode Switching | Toggle | No | Boolean |
| Mode Switch Deadline | DateTime | Conditional | If switching allowed |

**Example:**
```
Attendance Mode Configuration:

How can attendees participate?
☑ In-Person (Onsite)
☑ Virtual (Online)

Note: Attendees will choose their preferred mode
during registration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Capacity Management:

Onsite Capacity: [300] people
Expected onsite: [250] (83%)

Online Capacity: [500] people
Expected online: [400] (80%)

Total Event Capacity: 800 attendees

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pricing Model:

How will pricing work?

(●) Different pricing for each mode
    In-person: ₹2,999
    Virtual: ₹999

( ) Same price for both modes
    ₹1,999 (choose mode later)

( ) Free for both modes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Attendance Mode Switching:

☑ Allow attendees to switch between modes

Switching allowed until: [March 10, 2026]
(5 days before event)

Rules:
• In-person to Virtual: Allowed anytime
• Virtual to In-person: Subject to capacity
• Price difference will be adjusted

☐ Charge fee for mode switching: [₹500]

[← Back] [Continue →]
```

---

### Page 4: Venue Details (Onsite Component)

**Purpose:** Configure physical venue for in-person attendees

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Venue Name | Text | Yes | Max 100 characters |
| Address Line 1 | Text | Yes | Max 200 characters |
| Address Line 2 | Text | No | Max 200 characters |
| City | Text | Yes | Max 100 characters |
| State/Province | Text | Yes | Max 100 characters |
| Postal Code | Text | Yes | Max 20 characters |
| Country | Dropdown | Yes | ISO country codes |
| Venue Type | Dropdown | Yes | Predefined types |
| Room/Hall Name | Text | No | Max 100 characters |
| Parking Available | Toggle | No | Boolean |
| Parking Instructions | Textarea | Conditional | If parking available |
| Public Transport | Textarea | No | Max 500 characters |
| Google Maps Link | Text | No | Valid URL |

**Example:**
```
Physical Venue (For In-Person Attendees):

Venue Name: [Jio World Convention Centre           ]

Venue Type: [Conference Center ▼]

Address:
Street Address: [Bandra Kurla Complex, BKC         ]
Apartment/Suite: [Hall 1 & 2                       ]
City: [Mumbai                 ]
State: [Maharashtra           ]
Postal Code: [400051              ]
Country: [India ▼]

Specific Location:
Room/Hall: [Grand Ballroom & Tech Hall     ]
Floor: [Ground Floor                  ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Map Integration:
┌─────────────────────────────────────┐
│ [📍 Map Preview]                    │
│  Jio World Convention Centre        │
│  Mumbai, Maharashtra                │
└─────────────────────────────────────┘

Google Maps: [https://maps.google.com/...  ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Getting There (For Onsite Attendees):

Parking:
☑ Parking available
[Multi-level parking. Show registration 
confirmation for discounted rate: ₹200/day]

Public Transport:
[Metro: BKC Metro Station - 10 min walk
Bus: Route 217, 218 stop at BKC Junction
Airport: 30 min drive from Mumbai Airport]

Landmark: [Opposite MMRDA Grounds, next to 
Trident Hotel]

[← Back] [Continue →]
```

---

### Page 5: Virtual Platform Setup (Online Component)

**Purpose:** Configure online platform for virtual attendees

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Platform Type | Radio | Yes | Single selection |
| Meeting Link | Text | Yes | Valid HTTPS URL |
| Meeting ID | Text | Conditional | Alphanumeric |
| Passcode | Text | No | Min 4 characters |
| Streaming URL | Text | No | Valid URL for broadcast |
| Waiting Room | Toggle | No | Boolean |
| Max Online Participants | Number | No | Positive integer |
| Recording Enabled | Toggle | No | Boolean |
| Recording Access | Radio | Conditional | If recording enabled |
| Interactive Features | Checkboxes | No | Multiple selection |

**Example:**
```
Virtual Platform (For Online Attendees):

Platform:
(●) Zoom Webinar
( ) Zoom Meeting
( ) Google Meet
( ) Microsoft Teams
( ) YouTube Live
( ) Custom Platform

Meeting Link: [https://zoom.us/j/987654321      ]
Meeting ID: [987 654 321] (auto-extracted)
Passcode: [summit2026]

Streaming:
☑ Enable live streaming for larger audience
YouTube Live URL: [https://youtube.com/live/...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Online Platform Settings:

Features:
☑ Enable waiting room
☑ Auto-admit registered attendees
Max Online Participants: [500]

Interactive Features:
☑ Live Q&A
☑ Chat enabled
☑ Polls and surveys
☑ Virtual hand raise
☑ Breakout rooms for networking

Recording:
☑ Record entire event

Recording available to:
(●) Both onsite and online attendees
( ) Online attendees only
( ) Everyone (public)
( ) Organizers only

Recording Duration: [90 days ▼]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hybrid Integration Features:

☑ Live stream venue to online attendees
☑ Display online Q&A on venue screens
☑ Allow online attendees to participate in polls
☑ Show online attendee count to onsite audience

[← Back] [Continue →]
```

---

### Page 6: Onsite Safety & Check-in

**Purpose:** Configure venue safety and onsite check-in

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Check-in Required | Toggle | No | Boolean |
| Check-in Method | Radio | Conditional | If check-in required |
| Entry Requirements | Checkboxes | No | Multiple selection |
| ID Verification | Toggle | No | Boolean |
| Age Restriction | Dropdown | No | Predefined options |
| COVID-19 Protocols | Checkboxes | No | Multiple selection |
| Items Not Allowed | Textarea | No | Max 500 characters |
| Emergency Contact | Phone | Yes | Valid phone format |
| First Aid Available | Toggle | No | Boolean |

**Example:**
```
Onsite Attendance Management:

Check-in (For In-Person Attendees Only):
☑ Require check-in at venue

Check-in Method:
(●) QR Code Scan (Recommended)
( ) Manual Verification
( ) NFC Badge Tap

Entry Requirements (Onsite):
☑ Valid Photo ID required
☑ Registration confirmation (email/SMS)
☑ Printed or digital ticket
☐ Vaccination certificate
☐ RT-PCR negative report

ID Verification:
☑ Verify ID at entry

Age Restrictions:
[18+ Only ▼]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Safety & Health (Onsite):

Health Protocols:
☐ Mandatory masks
☑ Temperature screening
☑ Hand sanitizer stations
☐ Social distancing markers

Items Not Allowed (Onsite):
[Outside food and beverages
Large bags (coat check available)
Professional recording equipment
Weapons of any kind]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Emergency Information (Onsite):

Emergency Contact: [+91 22 6666 7777]
Venue Security: [+91 22 6666 7778]

☑ First aid room available
☑ Trained medical staff on premises
☑ Defibrillator available

Emergency Exits: 6
Fire Assembly Point: Parking Area B

Note: Virtual attendees automatically logged when
they join the online platform.

[← Back] [Continue →]
```

---

### Page 7: Registration & Tickets

**Purpose:** Configure registration for both attendance modes

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Registration Type | Radio | Yes | Free/Paid |
| Ticket Tiers | Dynamic List | Conditional | If paid, by mode |
| Custom Questions | Dynamic List | No | Max 10 questions |
| Waitlist Settings | Object | No | Separate for each mode |
| Registration Opens | DateTime | No | Before event |
| Registration Closes | DateTime | No | Before event |
| Require Approval | Toggle | No | Boolean |

**Example (Paid Hybrid Event):**
```
Registration Configuration:

Registration Type:
( ) Free Event (RSVP)
(●) Paid Event (Ticketing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket Tiers - IN-PERSON ATTENDANCE:

┌─────────────────────────────────────┐
│ Onsite Early Bird                   │
│ Price: ₹2,499  Available: 100       │
│ Sales: Feb 1 - Feb 20, 2026         │
│ Includes: Full venue access, lunch, │
│          networking, swag bag        │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Onsite Regular                      │
│ Price: ₹2,999  Available: 150       │
│ Sales: Feb 21 - March 14, 2026      │
│ Includes: Full venue access, lunch  │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Onsite VIP                          │
│ Price: ₹4,999  Available: 50        │
│ Sales: Feb 1 - March 14, 2026       │
│ Includes: VIP lounge, priority      │
│          seating, exclusive dinner  │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

[+ Add Onsite Ticket Tier]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket Tiers - VIRTUAL ATTENDANCE:

┌─────────────────────────────────────┐
│ Virtual Early Bird                  │
│ Price: ₹799  Available: 200         │
│ Sales: Feb 1 - Feb 20, 2026         │
│ Includes: Live access, Q&A, chat    │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Virtual Regular                     │
│ Price: ₹999  Available: 250         │
│ Sales: Feb 21 - March 14, 2026      │
│ Includes: Live access, recordings   │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Virtual Premium                     │
│ Price: ₹1,499  Available: 50        │
│ Sales: Feb 1 - March 14, 2026       │
│ Includes: VIP breakout sessions,    │
│          exclusive content access   │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

[+ Add Virtual Ticket Tier]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Capacity Summary:
Onsite: 300 tickets total
Virtual: 500 tickets total
Total Revenue Potential: ₹13,94,100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Waitlist Configuration:

Onsite Waitlist:
☑ Enable when onsite capacity full
Max waitlist: [100]

Virtual Waitlist:
☑ Enable when virtual capacity full
Max waitlist: [150]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Custom Registration Questions:

1. Which attendance mode do you prefer?
   Type: [Radio Buttons]
   Options: In-Person, Virtual
   ☑ Required
   (Auto-populated based on ticket selection)

2. Dietary preferences? (For onsite attendees)
   Type: [Multiple Choice]
   Display: Only if attendance_mode = "in-person"
   Options: Vegetarian, Vegan, Non-Veg, Jain
   ☑ Required

3. T-shirt size? (For onsite attendees)
   Type: [Dropdown]
   Display: Only if attendance_mode = "in-person"
   ☐ Required

4. What topics interest you most?
   Type: [Checkboxes]
   Display: For all attendees
   Options: AI, Cloud, DevOps, Web3, IoT
   ☐ Required

[+ Add Question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cancellation & Refund Policy:

Onsite Tickets:
[Full refund if cancelled 14+ days before ▼]

Virtual Tickets:
[Full refund if cancelled 7+ days before ▼]

Mode Switching:
☑ Allow free switch from onsite to virtual
☑ Charge difference when switching virtual to onsite

[← Back] [Continue →]
```

---

### Page 8: Organizers & Roles

**Purpose:** Add team members for both onsite and online management

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Primary Organizer | Display | Yes | Current user |
| Co-Organizers | User Search | No | Max 10 users |
| Speakers | Dynamic List | No | Name + mode |
| Onsite Coordinators | User Search | No | Max 20 users |
| Virtual Moderators | User Search | No | Max 10 users |
| Tech Support Team | User Search | No | Max 10 users |
| Contact Email | Email | Yes | Valid email |
| Onsite Contact | Phone | Yes | Valid phone |
| Virtual Support Email | Email | Yes | Valid email |

**Example:**
```
Team Management:

Primary Organizer: You (Adarsh Suman)

Co-Organizers:
• rajesh@example.com (Accepted) - Onsite Lead
• priya@example.com (Accepted) - Virtual Lead
[+ Add Co-Organizer]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Speakers/Presenters:

┌─────────────────────────────────────┐
│ Name: [Sundar Pichai             ]  │
│ Title: [CEO, Google              ]  │
│ Presentation Mode: [In-Person ▼] │
│ Session: [Keynote: Future of AI  ]  │
│ Time: [10:00 AM - 11:00 AM]        │
│ Visible to: (●) Both  ( ) Onsite only│
│ [Remove Speaker]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Name: [Satya Nadella             ]  │
│ Title: [CEO, Microsoft           ]  │
│ Presentation Mode: [Virtual ▼]   │
│ Session: [Cloud Innovation       ]  │
│ Time: [2:00 PM - 3:00 PM]          │
│ Visible to: (●) Both  ( ) Virtual only│
│ [Remove Speaker]                    │
└─────────────────────────────────────┘

[+ Add Speaker]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Onsite Team (Venue Management):

Onsite Coordinators:
• coordinator1@example.com - Registration Desk
• coordinator2@example.com - Venue Setup
• coordinator3@example.com - Guest Relations
[+ Add Onsite Coordinator]

Onsite Volunteers:
• volunteer1@example.com
• volunteer2@example.com
[+ Add Volunteer]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Virtual Team (Online Management):

Virtual Moderators:
• moderator1@example.com - Q&A Management
• moderator2@example.com - Chat Moderation
[+ Add Virtual Moderator]

Tech Support (Both Modes):
• techsupport1@example.com
• techsupport2@example.com
[+ Add Tech Support]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:

General Inquiries:
Email: [info@globaltechsummit.com]
Phone: [+91 22 6666 9999]

Onsite Support (Day of Event):
Phone: [+91 22 6666 8888]
Contact: Rajesh Kumar

Virtual Support:
Email: [virtual@globaltechsummit.com]
Phone: [+91 22 6666 7777]
Contact: Priya Sharma

[← Back] [Continue →]
```

---

### Page 9: Media & Branding

**Purpose:** Upload images and assets for both modes

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Banner | Image Upload | Yes | Max 5MB, 1920x1080px |
| Event Thumbnail | Image Upload | Yes | Max 2MB, 800x800px |
| Event Logo | Image Upload | No | Max 1MB, PNG |
| Venue Photos | Multi-Upload | No | Max 10 images |
| Virtual Background | Image Upload | No | 1920x1080px for Zoom |
| Promotional Video | URL/Upload | No | Max 100MB |
| Event Poster | PDF/Image | No | Max 10MB |
| Brand Color | Color Picker | No | Hex code |

**Example:**
```
Event Branding:

Event Banner (Required)
[Upload] global-tech-summit-banner.jpg
[✓ Uploaded - 1920x1080]

Event Thumbnail (Required)
[Upload] summit-thumb.jpg
[✓ Uploaded - 800x800]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Venue Media (For Onsite Promotion):

Venue Photos:
[venue1] [venue2] [venue3] [venue4] [+ Add]

Event Poster (Printable):
[Upload] poster-v3.pdf (3.2 MB)
[✓ Uploaded]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Virtual Platform Assets:

Virtual Background (For Zoom):
[Upload] zoom-background.jpg
Recommended: 1920x1080, brand colors
[✓ Uploaded]

Lobby Image (While waiting):
[Upload] lobby-screen.jpg
Shown to online attendees before event
[✓ Uploaded]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Promotional Content:

Promotional Video:
(●) YouTube Link
[https://youtube.com/watch?v=summit2026]

Event Trailer (30 sec):
Shows both onsite venue and virtual experience

Brand Color: [#00669A] 🎨

[← Back] [Continue →]
```

---

### Page 10: Hybrid Experience Settings

**Purpose:** Configure integration between onsite and online experiences

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Cross-Mode Networking | Toggle | No | Boolean |
| Unified Q&A | Toggle | No | Boolean |
| Shared Chat | Toggle | No | Boolean |
| Virtual Lobby | Toggle | No | Boolean |
| Post-Event Access | Checkboxes | No | Multiple selection |

**Example:**
```
Hybrid Experience Integration:

How should onsite and online attendees interact?

Cross-Mode Networking:
☑ Enable networking between all attendees

Features:
• Virtual attendees can see onsite attendee profiles
• Onsite attendees can message virtual participants
• Shared networking sessions via breakout rooms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q&A Integration:
☑ Unified Q&A for all attendees

How it works:
• Online Q&A displayed on venue screens
• Onsite questions visible to virtual audience
• Speakers answer questions from both modes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chat & Communication:
☑ Shared event chat (moderated)

Settings:
• Virtual attendees chat via platform
• Onsite attendees can use mobile app
• Moderated to ensure quality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Virtual Lobby (Before Event):
☑ Enable virtual lobby 30 min before

Features:
• Welcome video playing
• Countdown to event start
• Chat with other early joiners
• Sponsor advertisements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Post-Event Access:

What content should be available after event?

Onsite Attendees Get:
☑ Event recording access (7 days)
☑ Presentation slides download
☑ Networking contact list
☑ Certificate of attendance

Virtual Attendees Get:
☑ Event recording access (30 days)
☑ Presentation slides download
☑ Networking contact list
☑ Certificate of attendance

Recording Access:
[30 days ▼] for all attendees

[← Back] [Continue →]
```

---

### Page 11: Review & Publish

**Purpose:** Final review before publishing

**Layout:**
```
Review Your Hybrid Event

┌─────────────────────────────────────┐
│ ✓ Basic Details              [Edit] │
│ Title: Global Tech Summit 2026      │
│ Category: Technology                │
│ Duration: 8 hours                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Attendance Modes           [Edit] │
│ Onsite: 300 capacity                │
│ Virtual: 500 capacity               │
│ Total: 800 attendees                │
│ Mode switching: Allowed             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Venue (Onsite)             [Edit] │
│ Jio World Convention Centre         │
│ Mumbai, Maharashtra                 │
│ Parking: Available                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Virtual Platform           [Edit] │
│ Platform: Zoom Webinar              │
│ Recording: Enabled                  │
│ Interactive: Q&A, Chat, Polls       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Registration               [Edit] │
│ Type: Paid (Hybrid Pricing)         │
│ Onsite: ₹2,499 - ₹4,999            │
│ Virtual: ₹799 - ₹1,499             │
│ Total Potential: ₹13,94,100        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Team                       [Edit] │
│ Organizers: 3                       │
│ Speakers: 2 (1 onsite, 1 virtual)   │
│ Onsite Coordinators: 3              │
│ Virtual Moderators: 2               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Hybrid Integration         [Edit] │
│ Cross-mode networking: Enabled      │
│ Unified Q&A: Enabled                │
│ Shared chat: Enabled                │
│ Recording access: 30 days           │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-Flight Check:
✓ All required fields complete
✓ Both venue and virtual platform configured
✓ Onsite capacity matches venue capacity
✓ Virtual platform link is valid
✓ Pricing configured for both modes
✓ Emergency contacts provided
✓ Media assets uploaded

⚠️ Warnings:
• Consider testing hybrid setup 1 week before
• Ensure venue has stable internet for streaming
• Coordinate tech team for both modes

Publishing Options:
Visibility:
(●) Public
( ) Unlisted
( ) Private

Notifications:
☑ Notify community followers
☑ Submit to event directories
☑ Share on social media

Display Options