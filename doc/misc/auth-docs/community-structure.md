# Community Event Platform - Architecture Guide

## 1. Overview

This document explains a hierarchical community event platform where communities can have parent-child relationships, and both parent and child communities can organize events.


---

## 2. Database Schema Design

### Table 1: Community

This table stores all communities, whether they are parent communities or child communities. The key insight here is that we use a self-referencing relationship where each community can point to its parent.

```
Community Table:
├── id (Primary Key, Integer)
├── name (String) - e.g., "WikiClub Tech" or "WikiClub Tech SHUATS"
├── description (String)
├── photo (String/URL)
└── parent_community_id (Foreign Key, Integer, NULL for parent communities)
```

**Example Data:**

| id | name | description | photo | parent_community_id |
|----|------|-------------|-------|---------------------|
| 1 | WikiClub Tech | Parent tech community | photo1.jpg | NULL |
| 2 | WikiClub Tech SHUATS | SHUATS chapter | photo2.jpg | 1 |
| 3 | WikiClub Tech UU | UU chapter | photo3.jpg | 1 |
| 4 | WikiClub Tech UIT | UIT chapter | photo4.jpg | 1 |

Notice how the parent community has a NULL value for parent_community_id because it is at the top of the hierarchy. All child communities point back to their parent using the parent_community_id field.

---

### Table 2: Event

This table stores all events created by communities. Each event belongs to exactly one community, but that community could be either a parent or a child in the hierarchy.

```
Event Table:
├── id (Primary Key, Integer)
├── community_id (Foreign Key, Integer) - Which community created this event
├── name (String) - e.g., "Road to Wiki SHUATS"
├── description (String)
├── photo (String/URL)
├── type (Enum: 'virtual', 'in-person', 'hybrid')
└── created_at (Timestamp)
```

**Example:**

| id | community_id | name | description | type |
|----|--------------|------|-------------|------|
| 1 | 2 | Road to Wiki SHUATS | Tech event | virtual |

The community_id links each event to the specific community that created it. This is crucial because we can trace from an event up to its community, and from there to parent communities.

---

### Table 3: Event_Virtual

This table stores additional information specific to virtual events. Each virtual event has a corresponding entry in this table.

```
Event_Virtual Table:
├── id (Primary Key, Integer)
├── event_id (Foreign Key, Integer) - Links to Event table
├── meeting_url (String) - URL for the virtual meeting
└── created_at (Timestamp)
```

**Example:**

| id | event_id | meeting_url |
|----|----------|-------------|
| 1 | 1 | https://meet.example.com/abc |

---

### Table 4: Event_In_Person

This table stores additional information specific to in-person events. Each in-person event has a corresponding entry in this table.

```
Event_In_Person Table:
├── id (Primary Key, Integer)
├── event_id (Foreign Key, Integer) - Links to Event table
├── geo_coordinates (String) - Geographic coordinates for the event location
└── created_at (Timestamp)
```

**Example:**

| id | event_id | geo_coordinates |
|----|----------|----------------|
| 1 | 2 | 40.7128,-74.0060 |

---

### Table 5: Event_Hybrid

This table stores additional information specific to hybrid events (events that have both virtual and in-person components). Each hybrid event has a corresponding entry in this table.

```
Event_Hybrid Table:
├── id (Primary Key, Integer)
├── event_id (Foreign Key, Integer) - Links to Event table
├── meeting_url (String) - URL for the virtual component
├── geo_coordinates (String) - Geographic coordinates for the in-person location
└── created_at (Timestamp)
```

**Example:**

| id | event_id | meeting_url | geo_coordinates |
|----|----------|-------------|----------------|
| 1 | 3 | https://meet.example.com/xyz | 40.7128,-74.0060 |

---

### Table 6: EventMember

This table tracks which users are attending which events. It creates a many-to-many relationship between users and events.

```
EventMember Table:
├── id (Primary Key, Integer)
├── user_id (Foreign Key, Integer)
├── event_id (Foreign Key, Integer)
├── community_id (Foreign Key, Integer) - For tracking purposes
├── joined_at (Timestamp)
```

We include community_id here even though we could find it through the event. This denormalization makes queries faster and helps with analytics about which communities have the most engaged members.

---

### Table 7: CommunityAdmin

This table tracks which users have administrative privileges in which communities. This is separate from event membership because community administration is about governance, not event attendance.

```
CommunityAdmin Table:
├── id (Primary Key, Integer)
├── user_id (Foreign Key, Integer)
├── community_id (Foreign Key, Integer)
├── role (Enum: 'owner', 'organizer', 'coorganizer', 'event_organizer', 'admin', 'moderator', 'mentor')
└── assigned_at (Timestamp)
```

**Role Hierarchy (from highest to lowest permission):**

1. **Owner** - Highest hierarchy with full permissions. Can delete communities, manage all settings, assign any role, and has complete control over the community.

2. **Organizer** - High-level role with extensive permissions. Can manage members, events, content, and most community settings. Cannot delete the community or modify owner role assignments.

3. **Coorganizer** - Assists organizers with community management. Can manage members, events, and content, but has limited access to critical settings.

4. **Event Organizer** - Focused on event management. Can create, edit, and manage events and attendees. Cannot access member management or community settings.

5. **Admin** - General administrative role with moderate permissions. Can assist with community operations but has restrictions on critical actions.

6. **Moderator** - Community health role. Can manage discussions and members (ban/mute) but cannot alter events, settings, or role assignments.

7. **Mentor** - Supportive role focused on guiding and helping community members. Has limited administrative permissions, primarily focused on member engagement and support.

The role field allows for different levels of administrative access. An owner has full control including the ability to delete the community, while lower-level roles like moderator have more restricted permissions focused on specific tasks.

---

## 3. Operations

### Operation 1: Creating a Nested Community

When we create a nested community, we are building the hierarchy. Here is how the process works step by step.

**Steps:**

First, a user creates or joins a parent community (for example, WikiClub Tech). Then the user becomes an owner of that community. Next, the user creates a child community (for example, WikiClub Tech SHUATS). We set parent_community_id equal to one (pointing to WikiClub Tech). Finally, the user automatically becomes an owner of the child community.

**Code Logic:**
<!-- TODO -->
```javascript
function createCommunity(name, description, photo, userId, parentCommunityId = null) {
    // Step 1: If creating a child community, verify parent exists and user has permission
    // For child communities, we need to check the parent is real and user is authorized
    // For parent communities (parentCommunityId is null), skip this validation
    if (parentCommunityId !== null) {
        // Verify parent exists
        // We need to make sure the parent community is real before creating a child
        const parent = getCommunityById(parentCommunityId);
        if (!parent) {
            return error("Parent community not found");
        }
        
        // Verify user is admin of parent
        // Only admins of the parent can create child communities
        // This prevents random users from creating unofficial chapters
        const isOwner = checkIfUserisOwner(userId, parentCommunityId);
        if (!isOwner) {
            return error("You must be admin of parent community");
        }
    }
    
    // Step 2: Create community
    // Create the new community with parent_community_id set appropriately:
    // - NULL for parent communities
    // - parent ID for child communities
    const community = {
        name: name,
        description: description,
        photo: photo,
        parent_community_id: parentCommunityId  // NULL for parent, parent ID for child
    };
    const newCommunityId = insertCommunity(community);
    
    // Step 3: Make user owner of the new community
    // The creator automatically becomes the owner of the new community
    // This applies to both parent and child communities
    addCommunityAdmin(userId, newCommunityId, 'owner');
    
    return newCommunityId;
}
```

This approach means we always know exactly who created what and maintain a clear chain of authority from child to parent communities.

---

### Operation 2: Creating an Event

When creating an event, we start with the specific community that will host it and work our way up to verify permissions.

**Steps:**

The user selects a community (parent or child). The system verifies the user is an admin of that community. The event is created and linked to that specific community. The event creator automatically joins as an organizer.

**Code Logic:**

```javascript
function createEvent(communityId, eventData, userId) {
    // Step 1: Verify community exists
    // We start by checking if this specific community is real
    const community = getCommunityById(communityId);
    if (!community) {
        return error("Community not found");
    }
    
    // Step 2: Verify user is admin
    // Only admins can create events for their community
    // This ensures event quality and prevents spam
    const isOwner = checkIfUserisOwner(userId, communityId);
    if (!isOwner) {
        return error("Only owner can create events");
    }
    
    // Step 3: Create event
    // Now we create the event and link it to the community
    const event = {
        community_id: communityId,
        name: eventData.name,
        description: eventData.description,
        photo: eventData.photo,
        type: eventData.type
    };
    const eventId = insertEvent(event);
    
    // Step 3a: Create event type-specific record
    // Based on the event type, we create a record in the appropriate table
    if (eventData.type === 'virtual') {
        insertEventVirtual(eventId, eventData.meeting_url);
    } else if (eventData.type === 'in-person') {
        insertEventInPerson(eventId, eventData.geo_coordinates);
    } else if (eventData.type === 'hybrid') {
        insertEventHybrid(eventId, eventData.meeting_url, eventData.geo_coordinates);
    }
    
    // Step 4: Add creator as organizer
    // The person who creates the event is automatically the organizer
    // This gives them special permissions for managing attendees
    addEventMember(userId, eventId, communityId, 'organizer');
    
    return eventId;
}
```

By starting from the event level and checking upward to the community level, we ensure that events are always properly authorized and linked to their communities.

---

### Operation 3: User Joining an Event

This is a basic operation where a user joins an individual event.

**Steps:**

The user finds an event (through community browsing or search). The user registers for the event. An entry is added to the EventMember table. The user can now access event details and any special resources.

**Code Logic:**

```javascript
function joinEvent(userId, eventId) {
    // Step 1: Verify event exists
    // Start by making sure the event is real
    const event = getEventById(eventId);
    if (!event) {
        return error("Event not found");
    }
    
    // Step 2: Check if already joined
    // Prevent duplicate registrations which could cause confusion
    const alreadyJoined = checkEventMembership(userId, eventId);
    if (alreadyJoined) {
        return error("Already registered for this event");
    }
    
    // Step 3: Add user to event
    // Create the membership record linking user to event
    // We also store the community_id for faster queries later
    addEventMember(userId, eventId, event.community_id, 'attendee');
    
    return success("Successfully joined event");
}
```

This operation is simple but powerful. By storing the relationship at the event level, we can later aggregate upward to see all events a user has joined, or all users in a community's events.

---

### Operation 4: Finding All Child Communities

We can find all descendants of a parent community by starting at the top and following the parent_community_id links downward.

**SQL Example (MySQL):**

```sql
WITH RECURSIVE community_tree AS (
    -- Base case: Start with the parent community
    -- This is our starting point, the root of the tree we want to explore
    SELECT id, name, parent_community_id, 1 as level
    FROM Community
    WHERE id = 1  -- WikiClub Tech
    
    UNION ALL
    
    -- Find children
    -- This part runs repeatedly, finding children of children of children...
    -- until no more children are found
    SELECT c.id, c.name, c.parent_community_id, ct.level + 1
    FROM Community c
    INNER JOIN community_tree ct ON c.parent_community_id = ct.id
)
SELECT * FROM community_tree ORDER BY level, name;
```

**Result:**

```
id | name                  | parent_community_id | level
---|-----------------------|---------------------|------
1  | WikiClub Tech         | NULL                | 1
2  | WikiClub Tech SHUATS  | 1                   | 2
3  | WikiClub Tech UU      | 1                   | 2
4  | WikiClub Tech UIT     | 1                   | 2
```

The level column shows how deep in the hierarchy each community is. This query starts at the top and works its way down the tree, collecting all communities that are direct or indirect children of the parent.

---

### Operation 5: Finding All Events in a Community Hierarchy

This operation demonstrates how we can aggregate information from the bottom (individual events) up through the entire community tree.

**Code Logic:**

```javascript
function getAllEventsInHierarchy(parentCommunityId) {
    // Step 1: Get all communities in hierarchy
    // First we need to know all the communities involved
    // This uses the query we saw earlier
    const allCommunityIds = getChildCommunities(parentCommunityId);
    allCommunityIds.add(parentCommunityId);  // Include parent too
    
    // Step 2: Get all events from these communities
    // Now we collect events from each community in our list
    // Gathering individual events from each community
    const events = [];
    for (const communityId of allCommunityIds) {
        const communityEvents = getEventsByCommunity(communityId);
        events.extend(communityEvents);
    }
    
    // Step 3: Return aggregated results
    // The user now sees all events from parent and all children
    return events;
}
```

This approach is efficient because we can cache the community hierarchy and only query events when needed. It also makes it easy to add filters like "show me only virtual events in this hierarchy" or "show me events from the last month."

---

## 5. Key Patterns

### Pattern 1: Membership Inheritance

When a user joins a parent community, you could optionally design the system so they automatically gain access to see all child community events. This is an optional feature that depends on your use case.

For example, if someone joins the main WikiClub Tech community, they might want to see events from all the university chapters without manually joining each one. This can be implemented with a query that checks both direct community membership and parent community membership.

### Pattern 2: Permission Bubbling

Admins of parent communities can optionally have permissions in child communities. This is configurable based on your governance model.

For instance, the owner of WikiClub Tech (parent) might want to have admin rights in all university chapters to help with coordination and maintain brand consistency. You would check permissions by looking at both the specific community and all parent communities.

### Pattern 3: Event Aggregation

The parent community dashboard shows events from all child communities. This gives a comprehensive view of all activity in the entire organization.

When you visit the WikiClub Tech dashboard, you see not just events created directly by WikiClub Tech, but also all events from WikiClub Tech SHUATS, WikiClub Tech UU, and WikiClub Tech UIT. This aggregated view is computed using the hierarchy query we discussed earlier.

---