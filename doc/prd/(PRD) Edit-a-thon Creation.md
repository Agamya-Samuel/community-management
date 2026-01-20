# Product Requirements Document: Edit-a-thon Creation

| Field | Value |
|-------|-------|
| **Version** | 2.0 |
| **Event Type** | Edit-a-thons |
| **Last Updated** | January 7, 2026 |

---

## 1. Overview

This document defines the event creation flow for **Edit-a-thons** - collaborative editing events where participants contribute to wikis, documentation, or content platforms in a focused, time-bound session.

---

## 2. Event Type Selection

**Purpose:** User selects "Edit-a-thon" from event type options

**Screen:**
```
What type of event are you creating?

[ ] Online Event
[ ] Onsite Event
[ ] Hybrid Event
[ ] Hackathon
[●] Edit-a-thon
[ ] Workshop
[ ] Networking

[Continue]
```

**Rules:**
- Edit-a-thon selection unlocks wiki integration, contribution tracking, and editing goals
- Event type cannot be changed after publishing
- Draft events allow type changes with warnings

---

## 3. Multi-Page Form Structure

### Page 1: Basic Details

**Purpose:** Capture core edit-a-thon information

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Title | Text | Yes | 10-100 characters |
| Short Description | Textarea | Yes | 50-200 characters |
| Full Description | Rich Text | Yes | Min 200 characters |
| Edit-a-thon Theme | Dropdown | Yes | Predefined + Custom |
| Content Focus | Multi-select | Yes | Max 5 topics |
| Target Platform | Dropdown | Yes | Wikipedia/Custom Wiki/Docs |
| Language | Dropdown | Yes | ISO language codes |
| Experience Level | Checkboxes | Yes | Beginner/Intermediate/Advanced |

**Example:**
```
Event Title: [Wikipedia Women in STEM Edit-a-thon     ]

Short Description:
[Join us to improve Wikipedia articles about women 
scientists and engineers]

Full Description:
[Rich text editor... Help bridge the gender gap on 
Wikipedia by creating and improving articles about 
notable women in STEM fields. No prior editing 
experience required - we'll provide training and 
support throughout the event.]

Edit-a-thon Theme: [Gender Gap ▼]
Options: Gender Gap, Local History, Science, Arts & Culture,
         Technology, Health, Education, Environment, Custom

Content Focus:
☑ Biography articles
☑ STEM topics
☐ Historical events
☐ Geography
☐ Arts & Literature

Target Platform: [Wikipedia ▼]
Content Language: [English ▼]

Who can participate?
☑ Beginners welcome (training provided)
☑ Intermediate editors
☑ Advanced contributors

[Save Draft] [Continue →]
```

---

### Page 2: Schedule & Location

**Purpose:** Define event structure, timeline, and location details

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Format | Radio | Yes | In-Person/Virtual/Hybrid |
| Start Date | Date Picker | Yes | Min 3 days ahead |
| Start Time | Time Picker | Yes | HH:MM format |
| End Date | Date Picker | Yes | ≥ start date |
| End Time | Time Picker | Yes | > start time |
| Timezone | Dropdown | Yes | IANA timezone |
| Registration Deadline | DateTime | No | Before event start |
| Training Session | Toggle | No | Boolean |
| Training Duration | Number | Conditional | Minutes (15-120) |

**Venue Fields (shown if In-Person/Hybrid):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Venue Name | Text | Yes | Max 100 characters |
| Address | Text | Yes | Full address |
| City, State, Postal Code, Country | Text/Dropdown | Yes | Standard format |
| WiFi Available | Toggle | Yes | Boolean (required) |
| WiFi Details | Textarea | Conditional | If WiFi available |
| Power Outlets | Toggle | Yes | Boolean |
| Computers Provided | Toggle | No | Boolean |
| Parking/Transport Info | Textarea | No | Max 500 characters |

**Virtual Platform Fields (shown if Virtual/Hybrid):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Video Platform | Radio | Yes | Zoom/Meet/Teams/Other |
| Meeting Link | URL | Yes | Valid HTTPS URL |
| Meeting ID | Text | Conditional | Alphanumeric |
| Passcode | Text | No | Min 4 characters |
| Chat Platform | Dropdown | No | Discord/Slack/Other |
| Chat Link | URL | Conditional | If chat platform selected |

**Example:**
```
Event Format:
(●) In-Person
( ) Virtual (Online only)
( ) Hybrid (Both in-person and virtual)

Date & Time:
Start Date: [March 8, 2026]  Start Time: [10:00 AM]
End Date: [March 8, 2026]    End Time: [4:00 PM]
Timezone: [Asia/Kolkata (IST) ▼]
Duration: 6 hours (calculated)

Registration closes: [March 7, 2026 at 11:59 PM]

Schedule:
☑ Include beginner training session
Training duration: [60] minutes
Topics: Account creation, basic editing, citations

────────────────────────────────────────

Physical Venue:
Venue Name: [Central Public Library              ]
Address: [15 MG Road, Bengaluru, Karnataka 560001]
Country: [India ▼]
Room/Hall: [Community Learning Center    ]

Facilities:
☑ WiFi available (Required)
Network Name: Library_Public
Password: [Will be shared on arrival]

☑ Power outlets at all tables
☑ Computers/laptops provided (10 available)
☐ Parking available
Public Transport: [Metro: MG Road Station - 5 min walk]

[← Back] [Continue →]
```

---

### Page 3: Goals, Resources & Registration

**Purpose:** Define editing objectives, provide resources, and configure registration

**Editing Goals Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Goal Setting | Toggle | No | Boolean |
| New Articles Goal | Number | Conditional | Positive integer |
| Articles to Improve | Number | Conditional | Positive integer |
| Total Edits Target | Number | Conditional | Positive integer |
| Pre-Selected Articles | Dynamic List | No | Article titles/URLs |
| Article Categories | Multi-select | No | Max 10 categories |
| Quality Guidelines | Rich Text | No | Max 1000 characters |
| Citation Requirements | Toggle | No | Boolean |

**Resources Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Training Materials | File Upload | No | PDF, max 10MB |
| Resource Links | Dynamic List | No | URLs with descriptions |
| Mentors Available | Toggle | No | Boolean |
| Mentor Details | Dynamic List | Conditional | Name + Wiki username |
| Help Desk | Toggle | No | Boolean |

**Registration Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Registration Type | Radio | Yes | Free/Paid |
| Event Capacity | Number | Yes | Positive integer |
| Ticket Price | Currency | Conditional | If paid |
| Waitlist Enabled | Toggle | No | Boolean |
| Registration Opens | DateTime | No | Before event |
| Registration Closes | DateTime | No | Before event |
| Custom Questions | Dynamic List | No | Max 10 questions |
| Require Wiki Account | Toggle | No | Boolean |

**Example:**
```
Editing Goals & Targets:
☑ Set contribution goals

Event Goals:
Articles to create: [25] new articles
Articles to improve: [50] existing articles
Total edits target: [200] edits

Pre-Selected Articles (Optional):
┌─────────────────────────────────────┐
│ Article: Marie Curie               │
│ URL: [wikipedia.org/wiki/...]      │
│ Type: [Improvement ▼]             │
│ Priority: High                     │
│ [Remove]                           │
└─────────────────────────────────────┘
[+ Add Article]

Article Categories:
☑ Women scientists
☑ Computer scientists
☑ Mathematicians

Quality Standards:
☑ All articles must include reliable sources
☑ Minimum 3 citations per article
☑ Follow neutral point of view (NPOV)

────────────────────────────────────────

Resources & Support:
Training Materials:
[Upload] wikipedia-editing-basics.pdf (2.1 MB)

Resource Links:
┌─────────────────────────────────────┐
│ Wikipedia Manual of Style           │
│ [https://en.wikipedia.org/wiki/...] │
│ [Remove]                            │
└─────────────────────────────────────┘
[+ Add Resource Link]

☑ Experienced editors available for help
Mentors:
┌─────────────────────────────────────┐
│ Name: [Dr. Priya Sharma          ]  │
│ Wikipedia Username: [@PriyaWiki  ]  │
│ Expertise: [STEM biographies     ]  │
│ [Remove]                            │
└─────────────────────────────────────┘
[+ Add Mentor]

────────────────────────────────────────

Registration:
Registration Type:
(●) Free Event (RSVP)
( ) Paid Event (Ticketing)

Capacity: [50] participants
Registration Period:
Opens: [Now]
Closes: [March 7, 2026 at 11:59 PM]

☑ Enable waitlist when full
Waitlist limit: [20] people

Participant Requirements:
☐ Must have existing Wikipedia account
☑ Laptop/device required

Custom Registration Questions:
1. Do you have a Wikipedia account?
   Type: [Yes/No] ☑ Required
2. Experience level with Wikipedia editing?
   Type: [Dropdown] ☑ Required
[+ Add Question]

[← Back] [Continue →]
```

---

### Page 4: Team, Media & Contact

**Purpose:** Add team members, upload visual assets, and set contact information

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Primary Organizer | Display | Yes | Current user |
| Co-Organizers | User Search | No | Max 10 users |
| Facilitators | Dynamic List | No | Name + Wiki username |
| Volunteers | User Search | No | Max 20 users |
| Partner Organizations | Dynamic List | No | Org name + logo |
| Contact Email | Email | Yes | Valid email |
| Contact Phone | Phone | No | Valid phone format |
| Event Banner | Image Upload | Yes | Max 5MB, 1920x1080px |
| Event Thumbnail | Image Upload | Yes | Max 2MB, 800x800px |
| Event Logo | Image Upload | No | Max 1MB, PNG |
| Promotional Materials | Multi-Upload | No | Max 10 files |

**Example:**
```
Organizing Team:
Primary Organizer: You (Adarsh Suman)
Wikipedia Username: [@AdarshEdit]

Co-Organizers:
• priya@example.com (Accepted)
• rajesh@example.com (Invited)
[+ Add Co-Organizer]

Facilitators (Experienced Wikipedians):
┌─────────────────────────────────────┐
│ Name: [Dr. Priya Sharma          ]  │
│ Wiki Username: [@PriyaWiki       ]  │
│ Role: Lead Trainer                  │
│ [Remove]                            │
└─────────────────────────────────────┘
[+ Add Facilitator]

Volunteers: [Add by email]
Partner Organizations:
┌─────────────────────────────────────┐
│ Organization: [Wikimedia India   ]  │
│ Logo: [Upload] [✓ Uploaded]         │
│ Website: [wikimedia.in]             │
│ [Remove]                            │
└─────────────────────────────────────┘
[+ Add Partner]

────────────────────────────────────────

Contact Information:
Public Contact:
Email: [editathon@example.org]
Phone: [+91 98765 43210] (optional)

────────────────────────────────────────

Event Branding:
Event Banner (Required)
┌─────────────────────────────────────┐
│    [📤 Upload or Drag & Drop]       │
│  Recommended: 1920 x 1080 pixels    │
│  Format: JPG, PNG | Max: 5 MB       │
└─────────────────────────────────────┘

Event Thumbnail (Required)
[Upload] editathon-thumb.jpg (800x800)

Event Logo (Optional)
[Upload] logo.png (500x500)

Promotional Materials:
[poster.pdf] [flyer.jpg] [+ Add]

[← Back] [Continue →]
```

---

### Page 5: Review & Publish

**Purpose:** Final review before publishing

**Layout:**
```
Review Your Edit-a-thon

┌─────────────────────────────────────┐
│ ✓ Basic Details              [Edit] │
│ Title: Wikipedia Women in STEM      │
│ Theme: Gender Gap | Platform: Wikipedia │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Schedule & Location        [Edit] │
│ Format: In-Person                   │
│ Date: March 8, 2026 at 10:00 AM IST │
│ Location: Central Public Library    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Goals & Registration       [Edit] │
│ New articles: 25 | Capacity: 50     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Team & Media               [Edit] │
│ Organizer: Adarsh Suman             │
│ Banner: ✓ Uploaded                  │
└─────────────────────────────────────┘

────────────────────────────────────────

Pre-Submit Check:
✓ All required fields complete
✓ Event date is in future
✓ Venue has WiFi (essential)
✓ Images uploaded
✓ Contact information provided

Publishing Options:
Visibility:
(●) Public
( ) Unlisted (link only)
( ) Private (invited users)

Notifications:
☑ Notify community followers
☑ Submit to Wikimedia event calendar

Integration:
☑ Connect to Wikipedia Dashboard
☑ Enable contribution tracking

[← Save as Draft]  [Publish Event →]
```

**After Publishing:**
```
🎉 Edit-a-thon Published!

Your event is now live at:
https://community.org/events/women-stem-editathon-123

[Copy Link] [Share] [View Event] [Dashboard]

Next Steps:
• Create Wikipedia Event Dashboard
• Share event on Wikimedia channels
• Prepare training materials
• Brief facilitators and volunteers
```

---

## 4. Post-Publishing Features

### 4.1 Wikipedia Integration
- Event Dashboard creation
- Contribution tracking
- Participant statistics
- Real-time edit counter

### 4.2 During Event
- Live contribution feed
- Edit counter dashboard
- Mentor help queue
- Participant check-in

### 4.3 Post-Event
- Contribution summary
- Impact report generation
- Participant certificates
- Follow-up survey

---

## 5. Technical Requirements

### 5.1 Integrations
- Wikipedia API for tracking
- Wikimedia Event Dashboard
- OAuth for Wiki accounts
- Calendar export (ICS)
- Email service provider

### 5.2 Data Storage
- Participant information
- Wiki usernames
- Article assignments
- Edit statistics
- Contribution logs

### 5.3 Tracking Metrics
- Articles created
- Articles improved
- Total edits made
- Bytes added
- Citations added
- Participants active

---

## 6. Validation Rules Summary

**Page 1 - Basic Details:**
- Title: 10-100 chars
- Description: Min 200 chars
- Theme: Required selection
- Platform: Required
- Experience level: At least one

**Page 2 - Schedule & Location:**
- Start date: Min 3 days ahead
- End time: After start time
- Training duration: 15-120 minutes if enabled
- Venue: Full address required, WiFi must be available (for in-person/hybrid)
- Virtual: Meeting link required (for virtual/hybrid)

**Page 3 - Goals, Resources & Registration:**
- Targets: Positive integers if goals enabled
- Article URLs: Valid Wikipedia links
- File uploads: Max 10MB per file
- Capacity: Positive integer required
- Questions: Max 10

**Page 4 - Team, Media & Contact:**
- Contact email: Valid format required
- Banner: Required, max 5MB
- Thumbnail: Required, max 2MB

**Page 5 - Review:**
- All previous pages complete
- Essential integrations configured

---

## 7. Data Model

### Core Tables

**events table:**
```sql
- event_id (UUID, PK)
- event_type (ENUM: 'editathon')
- title (VARCHAR 100)
- short_description (VARCHAR 200)
- full_description (TEXT)
- theme (VARCHAR 50)
- content_focus (JSON)
- target_platform (VARCHAR 50)
- language (VARCHAR 10)
- experience_levels (JSON)
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

**editathon_metadata table:**
```sql
- metadata_id (UUID, PK)
- event_id (UUID, FK)
- event_format (ENUM: 'in_person', 'virtual', 'hybrid')
- training_enabled (BOOLEAN)
- training_duration (INT)
- goal_articles_create (INT)
- goal_articles_improve (INT)
- goal_total_edits (INT)
- goal_bytes_added (INT)
- wiki_dashboard_url (VARCHAR 500)
- quality_guidelines (TEXT)
- citation_required (BOOLEAN)
```

**editathon_venue table** (for in-person/hybrid):
```sql
- venue_id (UUID, PK)
- event_id (UUID, FK)
- venue_name (VARCHAR 100)
- address_line1 (VARCHAR 200)
- address_line2 (VARCHAR 200)
- city (VARCHAR 100)
- state (VARCHAR 100)
- postal_code (VARCHAR 20)
- country (VARCHAR 50)
- room_name (VARCHAR 100)
- wifi_available (BOOLEAN)
- wifi_details (TEXT)
- power_outlets (BOOLEAN)
- computers_provided (INT)
- parking_available (BOOLEAN)
- parking_instructions (TEXT)
- public_transport (TEXT)
```

**editathon_virtual table** (for virtual/hybrid):
```sql
- virtual_id (UUID, PK)
- event_id (UUID, FK)
- video_platform (VARCHAR 50)
- meeting_link (VARCHAR 500)
- meeting_id (VARCHAR 100)
- passcode (VARCHAR 50)
- chat_platform (VARCHAR 50)
- chat_link (VARCHAR 500)
- screen_sharing (BOOLEAN)
- breakout_rooms (BOOLEAN)
```

**Supporting Tables:**
- editathon_articles (event_id, article_title, article_url, type, status, priority)
- editathon_mentors (event_id, name, wiki_username, expertise, languages)
- editathon_resources (event_id, resource_type, file_url, description)
- event_registrations (registration_id, event_id, user_id, wiki_username)
- editathon_contributions (contribution_id, event_id, user_id, article_id, edits_count, bytes_added)
- event_partners (event_id, organization_name, logo_url, role)

---

## 8. Future Enhancements

- AI-suggested articles based on theme
- Automated quality checks
- Real-time leaderboard
- Gamification elements
- Advanced analytics dashboard
- Integration with more wikis
- Mobile app for tracking
- Automated mentor matching

---

**End of Document**
