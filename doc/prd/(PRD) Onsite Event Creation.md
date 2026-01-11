# Product Requirements Document: Onsite Event Creation

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Event Type** | Onsite/Offline Events |
| **Last Updated** | January 7, 2026 |

---

## 1. Overview

This document defines the multi-page event creation flow specifically for **Onsite Events** where organizers host in-person gatherings at physical venues.

---

## 2. Event Creation Flow

### Step 1: Event Type Selection (Entry Point)

**Screen:**
```
What type of event are you creating?

[ ] Online Event - Virtual events via video platforms
[●] Onsite Event - In-person gatherings
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

## 3. Multi-Page Form (Onsite Events)

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
Event Title: [Tech Meetup Delhi - January Edition    ]

Short Description:
[Monthly tech meetup featuring lightning talks and networking]

Full Description:
[Rich text editor with formatting options...
Join us for an evening of technology talks, networking,
and community building. This month we're featuring 
speakers on AI, Cloud Computing, and Web3...]

Category: [Technology ▼]
Tags: [Tech Meetup] [Networking] [AI] [Cloud]
Language: [English ▼]

Accessibility Features:
☑ Wheelchair accessible venue
☑ Sign language interpretation
☐ Assistive listening devices
☑ Reserved seating for people with disabilities

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
| Doors Open Time | Time Picker | No | Before start time |
| Registration Deadline | DateTime | No | Before event start |
| Is Recurring | Toggle | No | Boolean |

**Example:**
```
Start Date: [Feb 20, 2026]  Start Time: [6:00 PM]
End Date: [Feb 20, 2026]    End Time: [9:00 PM]

Timezone: [Asia/Kolkata (IST) ▼]
Duration: 3 hours (calculated)

Doors Open: [5:30 PM] (optional)
Allows early arrivals for registration/networking

Registration closes: [Feb 20, 2026 at 4:00 PM]

Is this a recurring event? [ No ▼]

[← Back] [Continue →]
```

---

### Page 3: Venue & Location (Onsite Event Specific)

**Purpose:** Configure physical venue details and location

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
| Floor Number | Text | No | Max 20 characters |
| Parking Available | Toggle | No | Boolean |
| Parking Instructions | Textarea | Conditional | If parking available |
| Public Transport | Textarea | No | Max 500 characters |
| Landmark | Text | No | Max 100 characters |
| Google Maps Link | Text | No | Valid URL |
| Coordinates | Auto-filled | Display | Lat/Long from address |

**Example:**
```
Venue Details:

Venue Name: [TechHub Innovation Center            ]

Venue Type: [Coworking Space ▼]
Options: Conference Center, Coworking Space, Hotel,
         Restaurant, Cafe, University, Office Building,
         Community Center, Library, Outdoor Venue, Other

Address:
Street Address: [Plot No. 123, Sector 62          ]
Apartment/Suite: [3rd Floor                       ]
City: [Noida                  ]
State: [Uttar Pradesh         ]
Postal Code: [201301          ]
Country: [India ▼]

Specific Location:
Room/Hall: [Innovation Hall A          ]
Floor: [3rd Floor                  ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Map Integration:
┌─────────────────────────────────────┐
│ [📍 Map Preview]                    │
│                                     │
│  TechHub Innovation Center          │
│  Noida, Uttar Pradesh               │
│                                     │
│  Lat: 28.6273  Long: 77.3726        │
└─────────────────────────────────────┘

[📍 Adjust Pin Location]
[🔗 Add Google Maps Link]

Google Maps Link: [https://maps.google.com/...  ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Getting There:

Parking:
☑ Parking available
Parking Instructions:
[Free parking available in basement. 
Enter from Gate 2. Visitor parking on Level B1.]

Public Transport:
[Metro: Sector 62 Station (Blue Line) - 5 min walk
Bus: Route 311, 312 stop at Sector 62 Market]

Nearby Landmark:
[Next to Sector 62 Metro Station, opposite 
City Mall]

[← Back] [Continue →]
```

---

### Page 4: Capacity & Safety (Onsite Event Specific)

**Purpose:** Configure venue capacity, safety measures, and entry requirements

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Venue Capacity | Number | Yes | Positive integer |
| Expected Attendance | Number | No | ≤ Venue capacity |
| Seating Arrangement | Dropdown | Yes | Predefined options |
| Check-in Required | Toggle | No | Boolean |
| Check-in Method | Radio | Conditional | If check-in required |
| Entry Requirements | Checkboxes | No | Multiple selection |
| ID Verification | Toggle | No | Boolean |
| Age Restriction | Dropdown | No | Predefined options |
| Minimum Age | Number | Conditional | If age restricted |
| COVID-19 Protocols | Checkboxes | No | Multiple selection |
| Dress Code | Dropdown | No | Predefined options |
| Items Not Allowed | Textarea | No | Max 500 characters |
| Emergency Contact | Phone | Yes | Valid phone format |
| First Aid Available | Toggle | No | Boolean |

**Example:**
```
Venue Capacity & Safety:

Venue Capacity: [200] people (maximum allowed)
Expected Attendance: [150] people

Seating Arrangement:
[Theater Style ▼]
Options: Theater, Classroom, Boardroom, U-Shape,
         Banquet Rounds, Cocktail/Standing, Mixed, Other

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check-in & Entry:

☑ Require check-in at venue

Check-in Method:
(●) QR Code Scan (Recommended)
( ) Manual Name Verification
( ) Registration List Check-off

Entry Requirements:
☑ Valid Photo ID required
☑ Registration confirmation (email/SMS)
☐ Vaccination certificate
☐ Invitation letter

ID Verification:
☑ Verify ID at entry
Accepted IDs: Government ID, Passport, Driver's License

Age Restrictions:
[18+ Only ▼]
Options: All Ages, 18+, 21+, 13+, Custom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Safety & Protocols:

Health & Safety:
☑ Mask optional
☐ Temperature check at entry
☐ Hand sanitizer stations
☑ Social distancing guidelines

Dress Code: [Casual ▼]
Options: Formal, Business Casual, Casual, 
         Smart Casual, No Restriction

Items Not Allowed:
[Outside food and beverages
Professional recording equipment
Weapons of any kind
Large bags (lockers available)]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Emergency Information:

Emergency Contact: [+91 98765 43210]
Name: [Security Desk           ]

☑ First aid kit available on premises
☑ Trained first responder present

Venue Emergency Exits: 4
Fire extinguishers: Available on each floor

[← Back] [Continue →]
```

---

### Page 5: Registration & Tickets

**Purpose:** Configure attendee registration and capacity

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Registration Type | Radio | Yes | Free/Paid |
| Event Capacity | Number | Yes | Positive integer (from Page 4) |
| Ticket Tiers | Dynamic List | Conditional | If paid |
| Custom Questions | Dynamic List | No | Max 10 questions |
| Waitlist Enabled | Toggle | No | Boolean |
| Registration Opens | DateTime | No | Before event |
| Registration Closes | DateTime | No | Before event |
| Require Approval | Toggle | No | Boolean |
| Allow Guest Registration | Toggle | No | Boolean |
| Max Guests Per Registration | Number | Conditional | If guests allowed |

**Example (Free Event):**
```
Registration Type:
(●) Free Event (RSVP)
( ) Paid Event (Ticketing)

Capacity: [200] attendees (from venue capacity)
Current Registrations: 0

☑ Enable waitlist when full
Waitlist Limit: [50] people

Registration Period:
Opens: [Now] or [Select Date/Time]
Closes: [Feb 20, 2026 at 4:00 PM]

Guest Registration:
☑ Allow attendees to bring guests
Max guests per registration: [1]

Custom Registration Questions:

1. Dietary restrictions/preferences?
   Type: [Multiple Choice]
   Options: None, Vegetarian, Vegan, Halal, 
            Gluten-Free, Other
   ☑ Required

2. T-shirt size (if applicable)?
   Type: [Dropdown]
   Options: XS, S, M, L, XL, XXL
   ☐ Required

3. Any accessibility needs?
   Type: [Long Text]
   ☐ Required

[+ Add Question]

☐ Require manual approval for registrations

Terms & Conditions:
☑ Attendees must agree to code of conduct
☑ Photo/video consent for event coverage

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
│ Price: ₹499  Available: 50 tickets  │
│ Sales: Jan 20 - Feb 5, 2026         │
│ Includes: Entry + Snacks + Swag     │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Regular Admission                   │
│ Price: ₹799  Available: 100 tickets │
│ Sales: Feb 6 - Feb 20, 2026         │
│ Includes: Entry + Snacks            │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Student Discount                    │
│ Price: ₹299  Available: 50 tickets  │
│ Sales: Jan 20 - Feb 20, 2026        │
│ Requires: Valid Student ID          │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

[+ Add Ticket Tier]

Total Capacity: 200 attendees
Estimated Revenue: ₹1,09,450

Cancellation Policy:
[Full refund 7 days before ▼]

[← Back] [Continue →]
```

---

### Page 6: Organizers & Roles

**Purpose:** Add team members and define roles

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Primary Organizer | Display | Yes | Current user (read-only) |
| Co-Organizers | User Search | No | Max 10 users |
| Speakers | Dynamic List | No | Name + details |
| Event Volunteers | User Search | No | Max 50 users |
| Moderators | User Search | No | Max 10 users |
| Contact Email | Email | Yes | Valid email |
| Contact Phone | Phone | Yes | Valid phone format |
| On-Site Contact | Phone | Yes | Valid phone format |

**Example:**
```
Primary Organizer: You (Adarsh Suman)

Co-Organizers:
[Search by email...]
• rajesh@example.com (Accepted)
• priya@example.com (Invited)
[+ Add Co-Organizer]

Speakers/Presenters:
┌─────────────────────────────────────┐
│ Name: [Vikram Mehta              ]  │
│ Title: [CTO, TechStartup India   ]  │
│ Bio: [Vikram is a technology leader │
│       with 15+ years experience...]  │
│ Talk Title: [AI in Modern Apps   ]  │
│ Duration: [30] minutes              │
│ Time Slot: [6:30 PM - 7:00 PM]     │
│ [Remove Speaker]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Name: [Neha Sharma               ]  │
│ Title: [Lead Engineer, CloudCorp ]  │
│ Bio: [Neha specializes in cloud... ]│
│ Talk Title: [Serverless at Scale ]  │
│ Duration: [30] minutes              │
│ Time Slot: [7:15 PM - 7:45 PM]     │
│ [Remove Speaker]                    │
└─────────────────────────────────────┘

[+ Add Speaker]

Event Volunteers (for on-site support):
[Search by email...]
• volunteer1@example.com (Registration Desk)
• volunteer2@example.com (General Support)
[+ Add Volunteer]

Roles: Registration, Check-in, Ushering, 
       Photography, Tech Support, Catering

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:

General Inquiries:
Email: [events@community.org]
Phone: [+91 98765 43210]

On-Site Emergency Contact:
Phone: [+91 98765 43210]
Name: [Adarsh Suman          ]

This number will be shared with attendees
for day-of-event queries.

[← Back] [Continue →]
```

---

### Page 7: Media & Branding

**Purpose:** Upload images and branding assets

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Banner | Image Upload | Yes | Max 5MB, 1920x1080px |
| Event Thumbnail | Image Upload | Yes | Max 2MB, 800x800px |
| Event Logo | Image Upload | No | Max 1MB, 500x500px PNG |
| Venue Photos | Multi-Upload | No | Max 10 images |
| Promotional Video | URL/Upload | No | YouTube/Vimeo or max 100MB |
| Event Poster | PDF/Image | No | Max 10MB |
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
[Upload] tech-meetup-thumb.jpg (800x800)
[✓ Uploaded]

Venue Photos (Recommended)
Show attendees what to expect!
[venue1] [venue2] [venue3] [+ Add]

Event Poster (Optional)
For printing and social media
[Upload PDF or Image]
poster-v2.pdf (2.3 MB) [✓ Uploaded]

Promotional Video (Optional)
(●) YouTube/Vimeo Link
[https://youtube.com/watch?v=...]

( ) Upload Video

Brand Color:
[#00669A] 🎨 (optional)

[← Back] [Continue →]
```

---

### Page 8: Agenda & Schedule (Optional for Onsite)

**Purpose:** Create detailed event schedule

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Enable Agenda | Toggle | No | Boolean |
| Agenda Items | Dynamic List | Conditional | If agenda enabled |

**Example:**
```
Event Agenda:

☑ Add detailed schedule

┌─────────────────────────────────────┐
│ 5:30 PM - 6:00 PM                   │
│ Registration & Networking           │
│ Location: Lobby Area                │
│ Description: Check-in and welcome   │
│ refreshments                        │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 6:00 PM - 6:15 PM                   │
│ Welcome & Introduction              │
│ Speaker: Adarsh Suman               │
│ Location: Main Hall                 │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 6:30 PM - 7:00 PM                   │
│ Talk: AI in Modern Applications     │
│ Speaker: Vikram Mehta               │
│ Location: Main Hall                 │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 7:15 PM - 7:45 PM                   │
│ Talk: Serverless at Scale           │
│ Speaker: Neha Sharma                │
│ Location: Main Hall                 │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 8:00 PM - 9:00 PM                   │
│ Networking & Dinner                 │
│ Location: Dining Area               │
│ [Edit] [Remove]                     │
└─────────────────────────────────────┘

[+ Add Agenda Item]

[← Back] [Continue →]
```

---

### Page 9: Review & Publish

**Purpose:** Final review before publishing

**Layout:**
```
Review Your Event

┌─────────────────────────────────────┐
│ ✓ Basic Details              [Edit] │
│ Title: Tech Meetup Delhi            │
│ Category: Technology                │
│ Language: English                   │
│ Accessibility: Wheelchair accessible│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Date & Time                [Edit] │
│ Feb 20, 2026 at 6:00 PM IST        │
│ Duration: 3 hours                   │
│ Doors Open: 5:30 PM                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Venue & Location           [Edit] │
│ Venue: TechHub Innovation Center    │
│ Address: Plot 123, Sector 62, Noida │
│ Room: Innovation Hall A, 3rd Floor  │
│ Parking: Available                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Capacity & Safety          [Edit] │
│ Venue Capacity: 200 people          │
│ Check-in: QR Code Required          │
│ Entry: Valid ID Required            │
│ Age: 18+ Only                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Registration               [Edit] │
│ Type: Free Event                    │
│ Capacity: 200 attendees             │
│ Waitlist: Enabled (50)              │
│ Guest Registration: Allowed (1 max) │
│ Custom Questions: 3                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Team                       [Edit] │
│ Organizer: Adarsh Suman             │
│ Co-Organizers: 2                    │
│ Speakers: 2                         │
│ Volunteers: 2                       │
│ On-Site Contact: +91 98765 43210    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Media                      [Edit] │
│ Banner: ✓ Uploaded                  │
│ Thumbnail: ✓ Uploaded               │
│ Venue Photos: 3 images              │
│ Event Poster: ✓ Uploaded            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Agenda                     [Edit] │
│ Schedule Items: 5                   │
│ Duration: 5:30 PM - 9:00 PM        │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-Flight Check:
✓ All required fields complete
✓ Event date is in future
✓ Venue address is valid
✓ Venue capacity set
✓ Images uploaded
✓ Emergency contact provided
⚠️ Consider adding more venue photos
💡 Enable reminder notifications

Publishing Options:
Visibility:
(●) Public
( ) Unlisted
( ) Private

Notifications:
☑ Notify community followers (1,234)
☑ Submit to local event listings
☑ Share on social media

Map Display:
☑ Show venue location on event page
☑ Provide directions link

[← Save as Draft]  [Publish Event →]
```

**After Publishing:**
```
🎉 Event Published!

Your event "Tech Meetup Delhi - January Edition"
is now live!

Event URL:
https://community.org/events/tech-meetup-delhi-123

[Copy Link] [Share] [View Event] [Dashboard]

Next Steps:
• Download QR codes for check-in
• Print event posters
• Brief volunteers on their roles
• Test check-in system
• Prepare venue setup checklist

[Generate Check-in QR Codes]
[Download Attendee List]
[Print Event Materials]
```

---

## 4. Page Navigation Rules

**Navigation Controls:**
- "Continue" button: Validates current page, advances to next
- "Back" button: Returns to previous page, no validation
- "Save Draft" button: Available on all pages, saves progress
- Progress indicator: Shows "Page X of 9" at top
- Breadcrumb: Allows jumping to completed pages

**Validation:**
- Inline validation on field blur
- Page-level validation on "Continue" click
- Cannot advance if required fields missing
- Error summary at top of page
- Auto-scroll to first error field

**Draft Auto-Save:**
- Auto-saves every 30 seconds
- Saves on page navigation
- Shows "Draft saved at [time]"
- Resume from last edited page

---

## 5. Data Model

### Core Tables

**events table:**
```sql
- event_id (UUID, PK)
- event_type (ENUM: 'onsite')
- title (VARCHAR 100)
- short_description (VARCHAR 200)
- full_description (TEXT)
- category_id (UUID, FK)
- language (VARCHAR 10)
- accessibility_features (JSON)
- start_datetime (TIMESTAMP)
- end_datetime (TIMESTAMP)
- timezone (VARCHAR 50)
- doors_open_time (TIME)
- registration_type (ENUM: 'free', 'paid')
- capacity (INT)
- status (ENUM: 'draft', 'published', 'cancelled')
- primary_organizer_id (UUID, FK)
- contact_email (VARCHAR 255)
- contact_phone (VARCHAR 20)
- emergency_contact (VARCHAR 20)
- banner_url (VARCHAR 500)
- thumbnail_url (VARCHAR 500)
- slug (VARCHAR 200, UNIQUE)
- created_at (TIMESTAMP)
- published_at (TIMESTAMP)
```

**onsite_event_metadata table:**
```sql
- metadata_id (UUID, PK)
- event_id (UUID, FK)
- venue_name (VARCHAR 100)
- venue_type (VARCHAR 50)
- address_line1 (VARCHAR 200)
- address_line2 (VARCHAR 200)
- city (VARCHAR 100)
- state (VARCHAR 100)
- postal_code (VARCHAR 20)
- country (VARCHAR 50)
- room_name (VARCHAR 100)
- floor_number (VARCHAR 20)
- latitude (DECIMAL 10,8)
- longitude (DECIMAL 11,8)
- google_maps_link (VARCHAR 500)
- landmark (VARCHAR 100)
- parking_available (BOOLEAN)
- parking_instructions (TEXT)
- public_transport (TEXT)
- venue_capacity (INT)
- seating_arrangement (VARCHAR 50)
- check_in_required (BOOLEAN)
- check_in_method (ENUM)
- id_verification (BOOLEAN)
- age_restriction (VARCHAR 20)
- minimum_age (INT)
- dress_code (VARCHAR 50)
- items_not_allowed (TEXT)
- first_aid_available (BOOLEAN)
- created_at (TIMESTAMP)
```

**Supporting Tables:**
- event_tags (event_id, tag)
- event_team (event_id, user_id, role)
- event_speakers (event_id, name, bio, talk_title, time_slot)
- event_volunteers (event_id, user_id, role)
- registration_questions (event_id, question_text, type)
- ticket_tiers (event_id, tier_name, price, quantity)
- event_registrations (registration_id, event_id, user_id, guest_count)
- event_check_ins (check_in_id, registration_id, checked_in_at)
- event_feedback (event_id, user_id, rating, comment)
- venue_photos (event_id, image_url)
- event_agenda (event_id, time_slot, title, description, speaker_id)

---

## 6. Notifications

### Automated Emails

| Trigger | Recipient | Timing | Content |
|---------|-----------|--------|---------|
| Event Published | Organizer | Immediate | Confirmation + checklist |
| User Registered | Attendee | Immediate | Confirmation + venue details |
| User Registered | Organizer | Immediate | New registration alert |
| 7 Days Before | Attendee | 7 days | Reminder + directions |
| 24 Hours Before | Attendee | 24 hours | Final reminder + parking info |
| Event Day Morning | Attendee | Day of | Last reminder + check-in details |
| Event Started | Organizer | On start | Check-in dashboard link |
| 2 Hours After | Attendee | 2 hours | Thank you + feedback survey |

### SMS Notifications (Optional)

- 1 day before: Venue address + parking details
- Day of event: Check-in QR code

---

## 7. Check-in System

### QR Code Generation
- Unique QR code per registration
- Sent via email confirmation
- Available in mobile app
- Can be printed

### On-Site Check-in
- Organizer/volunteer scans QR codes
- Manual name lookup option
- Real-time dashboard updates
- Duplicate check-in prevention
- Guest check-in support

**Check-in Dashboard:**
```
Live Check-ins: 87 / 200 registered

Recent Check-ins:
• Amit Kumar - 6:05 PM ✓
• Sarah Johnson - 6:04 PM ✓
• Raj Patel - 6:03 PM ✓

[Scan QR Code] [Manual Check-in]
```

---

## 8. Validation Rules Summary

**Page 1 - Basic Details:**
- Title: 10-100 chars
- Short description: 50-200 chars
- Full description: Min 200 chars
- Category required
- Accessibility features optional

**Page 2 - Date & Time:**
- Start date: Min 2 hours in future
- End time: After start time
- Doors open: Before start time
- Registration deadline: Before start

**Page 3 - Venue:**
- Venue name: Required, max 100 chars
- Full address: All fields required
- Coordinates: Auto-generated from address
- Parking/transport: Optional details

**Page 4 - Capacity & Safety:**
- Venue capacity: Required, positive integer
- Check-in method: If check-in enabled
- Emergency contact: Required, valid phone
- Age restriction: Optional

**Page 5 - Registration:**
- Capacity: Must match venue capacity
- Guest count: If guests allowed
- Custom questions: Max 10
- Ticket tiers: If paid event

**Page 6 - Team:**
- Contact email: Valid format
- Contact