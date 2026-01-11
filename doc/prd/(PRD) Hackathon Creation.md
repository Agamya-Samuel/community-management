# Product Requirements Document: Hackathon Creation

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Event Type** | Hackathons |
| **Last Updated** | January 7, 2026 |

---

## 1. Overview

This document defines the multi-page event creation flow for **Hackathons** - competitive coding and innovation events where participants work individually or in teams to build projects within a set timeframe.

---

## 2. Event Type Selection

**Purpose:** User selects "Hackathon" from event type options

**Rules:**
- Hackathon selection unlocks specific features: team formation, project submission, judging, prizes
- Event type cannot be changed after publishing
- Draft events allow type changes with warnings

---

## 3. Multi-Page Form Structure

### Page 1: Basic Details

**Purpose:** Capture core hackathon information

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Hackathon Name | Text | Yes | 10-100 characters |
| Tagline | Text | Yes | 20-80 characters |
| Description | Rich Text | Yes | Min 300 characters |
| Theme/Focus Area | Dropdown | Yes | Predefined + Custom |
| Problem Statement | Rich Text | No | Min 100 characters |
| Difficulty Level | Radio | Yes | Beginner/Intermediate/Advanced |
| Target Audience | Multi-select | Yes | Students/Professionals/All |
| Technology Stack | Multi-select | No | Max 10 tags |
| Language | Dropdown | Yes | ISO language codes |

---

### Page 2: Format & Duration

**Purpose:** Define structure and timeline

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Hackathon Format | Radio | Yes | In-Person/Virtual/Hybrid |
| Start Date | Date Picker | Yes | Min 7 days ahead |
| Start Time | Time Picker | Yes | HH:MM format |
| End Date | Date Picker | Yes | ≥ start date |
| End Time | Time Picker | Yes | > start time |
| Timezone | Dropdown | Yes | IANA timezone |
| Registration Opens | DateTime | Yes | Before event start |
| Registration Closes | DateTime | Yes | Before event start |
| Team Formation Deadline | DateTime | No | Before/at event start |
| Submission Deadline | DateTime | Yes | Before judging |
| Judging Period | Date Range | Yes | After submission |
| Winner Announcement | DateTime | Yes | After judging |

**Validation:**
- Total duration recommended: 24-72 hours
- Submission deadline must be before judging starts

---

### Page 3: Team Configuration

**Purpose:** Define team structure and rules

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Participation Mode | Radio | Yes | Individual/Team/Both |
| Min Team Size | Number | Conditional | 2-10 if teams enabled |
| Max Team Size | Number | Conditional | 2-10 if teams enabled |
| Team Formation | Radio | Yes | Self-Formed/Assigned/Hybrid |
| Cross-Organization Teams | Toggle | No | Boolean |
| Team Formation Timeline | Checkboxes | No | Before/At start/During |
| Max Teams | Number | No | Positive integer |
| Max Participants | Number | Yes | Positive integer |

**Features:**
- Team chat/communication channel
- Team leader designation
- Invite system for team formation
- Team matching board

---

### Page 4: Venue Details (In-Person/Hybrid)

**Purpose:** Configure physical venue

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
| Hacking Area Description | Text | No | Room/zone details |
| Workspace Type | Checkboxes | No | Tables/Open spaces/Meeting rooms |
| Internet Speed | Text | No | Bandwidth info |
| Power Outlets | Text | No | Availability details |
| Sleeping Area Available | Toggle | No | For 24+ hour events |
| Food Service Details | Textarea | No | Meal schedule |
| Parking Available | Toggle | No | Boolean |
| Parking Instructions | Textarea | Conditional | If parking available |

---

### Page 5: Virtual Platform (Online/Hybrid)

**Purpose:** Configure online infrastructure

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Communication Platform | Radio | Yes | Discord/Slack/Teams/Other |
| Server/Workspace Link | URL | Yes | Valid invite link |
| Video Platform | Radio | No | Zoom/Meet/Teams/YouTube |
| Meeting Links | Text | Conditional | For ceremonies/workshops |
| Code Repository Platform | Dropdown | Yes | GitHub/GitLab/Bitbucket |
| Organization/Workspace | Text | Yes | Repo organization name |
| Submission Platform | Radio | Yes | Devpost/Custom/Forms |
| Submission URL | URL | Yes | Valid submission link |
| Collaboration Tools | Multi-select | No | Figma/Miro/Google Workspace |

**Repository Rules:**
- Public repository requirement
- Commit activity during event required
- README with setup instructions mandatory
- Demo video/screenshots required

---

### Page 6: Prizes & Recognition

**Purpose:** Define prize structure

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Total Prize Pool | Currency | No | Positive number |
| Main Track Prizes | Dynamic List | Yes | Min 1 prize tier |
| Prize Position | Dropdown | Per prize | 1st/2nd/3rd/etc |
| Prize Amount | Currency | Per prize | Positive number |
| Prize Description | Text | Per prize | Cash/Credits/Items |
| Winners Count | Number | Per prize | 1-10 |
| Special Category Prizes | Dynamic List | No | Theme-specific awards |
| Sponsor Prizes | Dynamic List | No | Sponsor-provided awards |
| Participation Certificates | Toggle | Yes | Boolean |
| Swag for Participants | Toggle | No | Boolean |

**Recognition Options:**
- Website feature
- Social media shoutouts
- Press release
- Case study opportunity
- Job/internship fast-track

---

### Page 7: Judging Criteria

**Purpose:** Define evaluation process

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Judging Criteria | Dynamic List | Yes | Min 3 criteria |
| Criterion Name | Text | Per criterion | Max 50 characters |
| Criterion Weight | Percentage | Per criterion | Total must = 100% |
| Criterion Description | Text | Per criterion | Max 200 characters |
| Judging Format | Radio | Yes | Live/Video/Hybrid |
| Demo Duration | Number | Yes | Minutes (1-15) |
| Q&A Duration | Number | No | Minutes (1-10) |
| Number of Judges | Number | Yes | Min 3 |
| Judge Details | Dynamic List | No | Name + Title + Expertise |
| Scoring Method | Radio | Yes | Average/Weighted/Consensus |
| Tie-Breaker Rule | Dropdown | Yes | Predefined options |

**Common Criteria:**
- Innovation & Creativity
- Technical Implementation
- Impact & Feasibility
- User Experience & Design
- Presentation Quality
- Use of Technology

---

### Page 8: Schedule & Activities

**Purpose:** Define event timeline

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Opening Ceremony | DateTime + Duration | Yes | Date/time/minutes |
| Hacking Start Time | DateTime | Yes | Auto after ceremony |
| Workshops | Dynamic List | No | Title/Speaker/Time/Location |
| Mentor Sessions | Toggle | No | Boolean |
| Mentor Availability | Text | Conditional | Schedule description |
| Meals/Breaks | Dynamic List | No | For in-person events |
| Checkpoint Demos | Dynamic List | No | Optional milestones |
| Final Presentations | DateTime + Duration | Yes | Must be after submission |
| Closing Ceremony | DateTime + Duration | Yes | Winner announcement |

**Workshop Fields:**
- Title
- Speaker Name & Bio
- Start Time & Duration
- Location/Link
- Capacity (optional)

---

### Page 9: Registration & Eligibility

**Purpose:** Configure participant registration

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Registration Fee | Currency | Yes | 0 or positive |
| Eligibility Criteria | Multi-select | No | Student/Professional/All |
| Age Restriction | Dropdown | No | None/16+/18+/21+ |
| Experience Level | Checkboxes | No | Beginner/Intermediate/Advanced |
| Required Documents | Checkboxes | No | ID/Resume/Portfolio |
| Custom Questions | Dynamic List | No | Max 10 questions |
| Question Text | Text | Per question | Max 200 characters |
| Question Type | Dropdown | Per question | Text/Dropdown/Checkbox/Radio |
| Required Answer | Toggle | Per question | Boolean |
| Approval Required | Toggle | No | Manual approval needed |
| Waitlist Enabled | Toggle | No | Boolean |
| Waitlist Capacity | Number | Conditional | If waitlist enabled |

---

### Page 10: Organizers & Team

**Purpose:** Add team members and contacts

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Primary Organizer | Display | Yes | Current user |
| Co-Organizers | User Search | No | Max 10 users |
| Speakers | Dynamic List | No | Name/Title/Bio/Topic |
| Mentors | Dynamic List | No | Name/Expertise/Availability |
| Volunteers | User Search | No | Max 50 users |
| Contact Email | Email | Yes | Valid email |
| Support Phone | Phone | Yes | Valid phone format |
| Emergency Contact | Phone | Yes | Valid phone format |

---

### Page 11: Media & Branding

**Purpose:** Upload visual assets

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Event Banner | Image Upload | Yes | Max 5MB, 1920x1080px |
| Event Thumbnail | Image Upload | Yes | Max 2MB, 800x800px |
| Event Logo | Image Upload | No | Max 1MB, PNG |
| Venue Photos | Multi-Upload | No | Max 10 images, 2MB each |
| Promotional Video | URL | No | YouTube/Vimeo link |
| Event Poster | PDF/Image | No | Max 10MB |
| Brand Color | Color Picker | No | Hex code |

---

### Page 12: Rules & Guidelines

**Purpose:** Define hackathon rules

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Code of Conduct | Rich Text | Yes | Min 200 characters |
| Hacking Rules | Rich Text | Yes | Min 200 characters |
| Submission Requirements | Rich Text | Yes | Min 200 characters |
| Intellectual Property | Rich Text | Yes | Min 100 characters |
| Disqualification Rules | Rich Text | No | Max 1000 characters |
| Use of Pre-existing Code | Radio | Yes | Allowed/Not Allowed/Partial |
| Use of AI Tools | Radio | Yes | Allowed/Not Allowed/Disclosed |
| Project Ownership | Radio | Yes | Team/Organizer/Shared |

**Default Rules to Include:**
- Anti-harassment policy
- Pre-written code restrictions
- Commit activity requirements
- Submission format requirements
- Demo requirements

---

### Page 13: Sponsors & Partners (Optional)

**Purpose:** List sponsors and partners

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Sponsorship Tiers | Dynamic List | No | Tier name/benefits |
| Sponsor Details | Dynamic List | No | Per sponsor |
| Sponsor Name | Text | Per sponsor | Max 100 characters |
| Sponsor Logo | Image | Per sponsor | Max 1MB |
| Sponsor Tier | Dropdown | Per sponsor | From defined tiers |
| Sponsor Website | URL | Per sponsor | Valid URL |
| Sponsor Description | Text | Per sponsor | Max 500 characters |
| Partners | Dynamic List | No | Similar to sponsors |

---

### Page 14: Post-Event Details

**Purpose:** Configure post-hackathon activities

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Project Showcase | Toggle | No | Public gallery |
| Recording Access | Dropdown | No | Public/Participants/Organizers |
| Recording Duration | Number | Conditional | Days (7-365) |
| Feedback Survey | Toggle | No | Boolean |
| Survey Link | URL | Conditional | If survey enabled |
| Follow-up Communication | Toggle | No | Email list opt-in |
| Certificate Distribution | Dropdown | Yes | Auto/Manual/None |
| Certificate Template | Upload | Conditional | PDF template |
| Project Continuation | Toggle | No | Incubation opportunity |

---

### Page 15: Review & Publish

**Purpose:** Final review before publishing

**Sections:**
- Summary of all configurations
- Pre-flight validation checklist
- Edit links for each section
- Publish options

**Validation Checklist:**
- All required fields complete
- Dates and times logical
- Venue/platform configured per format
- Prizes total matches prize pool
- Judging criteria weights = 100%
- Contact information provided
- Media assets uploaded

**Publishing Options:**

| Field | Type | Required |
|-------|------|----------|
| Visibility | Radio | Yes |
| Publish Date | DateTime | No |
| Featured | Toggle | No |
| Notifications | Checkboxes | No |

**Visibility Options:**
- Public (searchable)
- Unlisted (direct link only)
- Private (invited users only)

---

## 4. Post-Publishing Features

### 4.1 Participant Management
- Registration approvals
- Team management dashboard
- Communication tools
- Check-in system

### 4.2 During Event
- Live updates
- Mentor queue management
- Submission tracking
- Real-time leaderboard (optional)

### 4.3 Judging Dashboard
- Project review interface
- Scoring system
- Judge collaboration tools
- Results calculation

### 4.4 Post-Event
- Winner announcements
- Certificate generation
- Analytics and reports
- Feedback collection

---

## 5. Technical Requirements

### 5.1 Integrations
- GitHub/GitLab API for repository tracking
- Devpost API for submissions
- Discord/Slack webhooks
- Payment gateway for paid registrations
- Email service provider
- Calendar integration (ics export)

### 5.2 Data Storage
- Participant information
- Team compositions
- Project submissions
- Judge scores
- Communication logs

### 5.3 Security
- Role-based access control
- Data encryption
- API rate limiting
- GDPR compliance

---

## 6. Success Metrics

- Registration conversion rate
- Participant engagement
- Submission completion rate
- Judge satisfaction score
- Participant feedback score
- Time to create event
- Platform stability during event

---

## 7. Future Enhancements

- AI-powered team matching
- Automated code quality analysis
- Live collaboration monitoring
- Virtual reality venue support
- Blockchain-based certificates
- Advanced analytics dashboard