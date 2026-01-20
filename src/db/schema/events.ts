import { mysqlTable, varchar, text, timestamp, int, boolean, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { communities } from "./communities";

/**
 * Events table
 * 
 * Main table storing all events (online, onsite, hybrid, hackathon, editathon, etc.)
 * Each event belongs to a community and has a primary organizer.
 * 
 * Event types:
 * - online: Virtual events (Zoom, Google Meet, etc.)
 * - onsite: In-person events at physical venues
 * - hybrid: Events with both online and onsite components
 * - hackathon: Coding/hacking events
 * - editathon: Wikipedia editing events
 * 
 * Status values:
 * - draft: Event is being created, not yet published
 * - published: Event is live and visible to users
 * - cancelled: Event has been cancelled
 * 
 * Registration types:
 * - free: No payment required
 * - paid: Payment required to register
 */
export const events = mysqlTable("events", {
  // Primary key - UUID string
  eventId: varchar("event_id", { length: 255 }).primaryKey(),

  // Event type: online, onsite, hybrid, hackathon, editathon
  eventType: varchar("event_type", { length: 50 }).notNull(),

  // Event title
  title: varchar("title", { length: 100 }).notNull(),

  // Short description (for previews)
  shortDescription: varchar("short_description", { length: 200 }),

  // Full description (detailed information)
  fullDescription: text("full_description"),

  // Category ID - references a categories table (to be created later)
  // For now, storing as string until categories table is defined
  categoryId: varchar("category_id", { length: 255 }),

  // Language code (e.g., 'en', 'hi', 'es')
  language: varchar("language", { length: 10 }).default("en"),

  // Start date and time
  startDatetime: timestamp("start_datetime", { mode: "date" }).notNull(),

  // End date and time
  endDatetime: timestamp("end_datetime", { mode: "date" }).notNull(),

  // Timezone (IANA timezone name, e.g., "America/Los_Angeles")
  timezone: varchar("timezone", { length: 50 }).default("UTC"),

  // Registration type: free or paid
  registrationType: varchar("registration_type", { length: 20 }).default("free").notNull(),

  // Maximum capacity (null for unlimited)
  capacity: int("capacity"),

  // Event status: draft, published, cancelled
  status: varchar("status", { length: 50 }).default("draft").notNull(),

  // Foreign key to users table - primary organizer
  primaryOrganizerId: varchar("primary_organizer_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  // Foreign key to communities table - which community created this event
  communityId: int("community_id")
    .references(() => communities.id, { onDelete: "restrict" }),

  // Contact email for event inquiries
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),

  // Contact phone (optional, mainly for onsite events)
  contactPhone: varchar("contact_phone", { length: 20 }),

  // Banner image URL
  bannerUrl: varchar("banner_url", { length: 500 }),

  // Thumbnail image URL
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),

  // URL-friendly slug (unique)
  slug: varchar("slug", { length: 200 }).unique(),

  // Accessibility features (JSON string for onsite events)
  accessibilityFeatures: text("accessibility_features"),

  // Doors open time (for onsite events, optional)
  doorsOpenTime: varchar("doors_open_time", { length: 10 }),

  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  publishedAt: timestamp("published_at", { mode: "date" }),

  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Online Event Metadata table
 * 
 * Stores additional information specific to online/virtual events.
 * Each online event has one corresponding entry in this table.
 */
export const onlineEventMetadata = mysqlTable("online_event_metadata", {
  // Primary key - UUID string
  metadataId: varchar("metadata_id", { length: 255 }).primaryKey(),

  // Foreign key to events table
  eventId: varchar("event_id", { length: 255 })
    .notNull()
    .references(() => events.eventId, { onDelete: "cascade" }),

  // Platform type: zoom, google_meet, microsoft_teams, etc.
  platformType: varchar("platform_type", { length: 50 }),

  // Meeting link URL
  meetingLink: varchar("meeting_link", { length: 500 }),

  // Meeting ID (platform-specific identifier)
  meetingId: varchar("meeting_id", { length: 100 }),

  // Passcode for meeting (if required)
  passcode: varchar("passcode", { length: 50 }),

  // Access control: open, registered_only, approved_only
  accessControl: varchar("access_control", { length: 50 }),

  // Whether waiting room is enabled
  waitingRoomEnabled: boolean("waiting_room_enabled").default(false),

  // Maximum participants (platform-specific limit)
  maxParticipants: int("max_participants"),

  // Whether recording is enabled
  recordingEnabled: boolean("recording_enabled").default(false),

  // Recording availability: immediate, after_event, on_demand
  recordingAvailability: varchar("recording_availability", { length: 50 }),

  // Recording URL (if available)
  recordingUrl: varchar("recording_url", { length: 500 }),

  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Onsite Event Metadata table
 * 
 * Stores additional information specific to onsite/in-person events.
 * Each onsite event has one corresponding entry in this table.
 */
export const onsiteEventMetadata = mysqlTable("onsite_event_metadata", {
  // Primary key - UUID string
  metadataId: varchar("metadata_id", { length: 255 }).primaryKey(),

  // Foreign key to events table
  eventId: varchar("event_id", { length: 255 })
    .notNull()
    .references(() => events.eventId, { onDelete: "cascade" }),

  // Venue name
  venueName: varchar("venue_name", { length: 100 }),

  // Venue type: conference_center, university, co_working_space, etc.
  venueType: varchar("venue_type", { length: 50 }),

  // Address line 1
  addressLine1: varchar("address_line1", { length: 200 }),

  // Address line 2 (optional)
  addressLine2: varchar("address_line2", { length: 200 }),

  // City
  city: varchar("city", { length: 100 }),

  // State/Province
  state: varchar("state", { length: 100 }),

  // Postal/ZIP code
  postalCode: varchar("postal_code", { length: 20 }),

  // Country
  country: varchar("country", { length: 50 }),

  // Room name (optional)
  roomName: varchar("room_name", { length: 100 }),

  // Floor number (optional)
  floorNumber: varchar("floor_number", { length: 20 }),

  // Latitude (for mapping)
  latitude: decimal("latitude", { precision: 10, scale: 8 }),

  // Longitude (for mapping)
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Google Maps link
  googleMapsLink: varchar("google_maps_link", { length: 500 }),

  // Nearby landmark (for directions)
  landmark: varchar("landmark", { length: 100 }),

  // Whether parking is available
  parkingAvailable: boolean("parking_available").default(false),

  // Parking instructions
  parkingInstructions: text("parking_instructions"),

  // Public transport information
  publicTransport: text("public_transport"),

  // Venue capacity
  venueCapacity: int("venue_capacity"),

  // Seating arrangement: theater, classroom, round_table, etc.
  seatingArrangement: varchar("seating_arrangement", { length: 50 }),

  // Whether check-in is required
  checkInRequired: boolean("check_in_required").default(false),

  // Check-in method: qr_code, manual, app_based
  checkInMethod: varchar("check_in_method", { length: 50 }),

  // Whether ID verification is required
  idVerification: boolean("id_verification").default(false),

  // Age restriction: all_ages, 18+, 21+, etc.
  ageRestriction: varchar("age_restriction", { length: 20 }),

  // Minimum age (if applicable)
  minimumAge: int("minimum_age"),

  // Dress code (optional)
  dressCode: varchar("dress_code", { length: 50 }),

  // Items not allowed (e.g., "No outside food")
  itemsNotAllowed: text("items_not_allowed"),

  // Whether first aid is available
  firstAidAvailable: boolean("first_aid_available").default(false),

  // Emergency contact number
  emergencyContact: varchar("emergency_contact", { length: 20 }),

  // Timestamps
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/**
 * Event Tags table
 * 
 * Stores tags associated with events (many-to-many relationship).
 * Tags help with categorization and search.
 */
export const eventTags = mysqlTable("event_tags", {
  // Primary key - auto-incrementing integer
  id: int("id").primaryKey().autoincrement(),

  // Foreign key to events table
  eventId: varchar("event_id", { length: 255 })
    .notNull()
    .references(() => events.eventId, { onDelete: "cascade" }),

  // Tag name
  tag: varchar("tag", { length: 100 }).notNull(),

  // Timestamp
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Event Registrations table
 * 
 * Stores user registrations for events.
 * Tracks who has registered for which events.
 * 
 * Required fields (compulsory):
 * - user_id: The user who registered (foreign key to users table)
 * - event_id: The event they registered for (foreign key to events table)
 * - community_id: The community that owns the event (foreign key to communities table)
 * - joined_at: Timestamp when the user joined/registered for the event
 */
export const eventRegistrations = mysqlTable("event_registrations", {
  // Primary key - UUID string
  registrationId: varchar("registration_id", { length: 255 }).primaryKey(),

  // Foreign key to events table - REQUIRED (compulsory)
  eventId: varchar("event_id", { length: 255 })
    .notNull()
    .references(() => events.eventId, { onDelete: "cascade" }),

  // Foreign key to users table - REQUIRED (compulsory)
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Foreign key to communities table - REQUIRED (compulsory)
  // Links the registration to the community that owns the event
  communityId: int("community_id")
    .notNull()
    .references(() => communities.id, { onDelete: "restrict" }),

  // Timestamp when user joined/registered - REQUIRED (compulsory)
  // This is the primary timestamp for when the user registered
  joinedAt: timestamp("joined_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // Registration status: confirmed, cancelled, waitlisted
  status: varchar("status", { length: 50 }).default("confirmed").notNull(),

  // Guest count (for events that allow bringing guests)
  guestCount: int("guest_count").default(0),

  // Legacy field - kept for backward compatibility
  // Use joinedAt as the primary timestamp
  registeredAt: timestamp("registered_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  cancelledAt: timestamp("cancelled_at", { mode: "date" }),

  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
