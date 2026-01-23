# Product Requirements Document (PRD): Subscription Management System

| **Document Version** | 1.0 |
| :--- | :--- |
| **Status** | **Draft / Planning** |
| **Project Type** | Subscription Module |
| **Last Updated** | December 30, 2024 |

---

## 1. Executive Summary

A dual-path subscription system enabling users to upgrade to Premium tier through either:
1. **Standard paid subscription** for Google/Email authenticated users
2. **Request-based approval system** for Wikimedia authenticated users (complimentary)

**Core Objective:** Streamline Premium access while providing special pathways for Wikimedia contributors without payment requirements.

---

## 2. Subscription Paths

### 2.1. Standard Users (Google / Email/Password)
- **Flow:** Self-service paid subscription
- **Payment Required:** Yes
- **Activation:** Immediate upon payment success
- **Management:** Automated (renewals, cancellations)

### 2.2. Wikimedia Users
- **Flow:** Request-based with admin approval
- **Payment Required:** No
- **Activation:** After admin approval
- **Management:** Manual by platform admins

---

## 3. Pricing Structure

### 3.1. Plans
- **Monthly Plan:** ₹499/month ($6/month USD)
- **Annual Plan:** ₹4,999/year ($60/year USD) - Save 2 months
- **Wikimedia Complimentary:** Free (upon approval)

### 3.2. Premium Features
- Create unlimited chapters
- Sub-chapter hierarchy management
- Manage multiple communities from single account
- Advanced analytics dashboard
- Financial overview and payment tracking
- Priority support
- Early access to new features

---

## 4. Standard User Subscription Flow

### 4.1. Subscription Initiation
```
Journey:
1. User clicks "Upgrade to Premium"
2. System detects auth provider (Google/Email)
3. Route to Standard Subscription Flow
4. Display pricing options
5. User selects plan (Monthly/Annual)
```

### 4.2. Subscription Form

**Section 1: Account Confirmation**
- User name (pre-filled, read-only)
- Email (pre-filled, read-only)
- Profile picture display

**Section 2: Plan Selection**
- Radio buttons: Monthly vs Annual
- Pricing with savings calculation
- Feature comparison table

**Section 3: Billing Information**
- Full name (as on payment method)
- Billing address (Street, City, State, ZIP, Country)
- GST Number (Optional, India only)

**Section 4: Payment Method**

**India Users (Razorpay):**
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- Net Banking
- Wallets

**International Users (Stripe):**
- Credit/Debit Cards
- Apple Pay, Google Pay
- Bank transfers (ACH, SEPA)

**Section 5: Terms**
- Checkbox: "I agree to Terms of Service and Privacy Policy"
- Checkbox: "I authorize automatic renewal"

### 4.3. Payment Processing
```
Flow:
1. User clicks "Subscribe Now"
2. Client-side validation
3. API call creates subscription (status: pending)
4. Initiate payment gateway
5. Redirect to payment interface
6. User completes payment
7. Webhook receives confirmation
8. Update subscription status → "active"
9. Send confirmation email
10. Redirect to success page
```

### 4.4. Post-Payment Actions
- Update user role → `premium_subscriber`
- Grant access to all premium features
- Send "Welcome to Premium" email
- Display success modal

---

## 5. Wikimedia User Request Flow

### 5.1. Request Initiation
```
Journey:
1. Wikimedia user clicks "Upgrade to Premium"
2. System detects Wikimedia OAuth
3. Route to Wikimedia Request Flow
4. Display: "As a Wikimedia contributor, you're eligible for complimentary Premium access"
```

### 5.2. Request Form

**Section 1: Wikimedia Identity**
- Wikimedia Username (pre-filled, read-only)
- Wikimedia Profile URL (pre-filled, read-only)
- Years Active on Wikimedia (manual input)
- Contribution Type (dropdown):
  - Editor
  - Administrator
  - Bureaucrat
  - Organizer
  - Developer
  - Other

**Section 2: Community Purpose**
- **Required:** "How will you use this platform?" (500 char limit)
- Textarea with examples

**Section 3: Wikimedia Contributions (Optional)**
- Number of edits
- Link to contributions page
- Notable projects (300 char limit)

**Section 4: Contact Verification**
- Email (pre-filled)
- Alternative email (optional)
- Phone number (optional)

**Section 5: Acknowledgment**
- Checkbox: "I confirm I am an active Wikimedia contributor"
- Checkbox: "I understand this requires admin review"

### 5.3. Request Submission
```
Flow:
1. User clicks "Submit Request"
2. Validation
3. Create subscription_request (status: pending)
4. Notify admin queue
5. Send confirmation email: "Request received"
6. Display confirmation (estimated review: 48-72 hours)
```

---

## 6. Admin Review System

### 6.1. Access
- Role: `platform_admin` only
- Location: `/admin/subscription-requests`

### 6.2. Request Queue Interface

**List View Columns:**
- Applicant Name (with avatar)
- Wikimedia Username (clickable link)
- Contribution Type
- Submitted Date
- Days Pending
- Quick Actions (Approve/Reject)

**Filters:**
- Status: Pending / Approved / Rejected / All
- Date Range
- Search by name/username

**Sorting:**
- Oldest first (default)
- Newest first
- By contribution type

### 6.3. Request Detail View
```
Layout:
┌─────────────────────────────────────────────┐
│ Applicant Information                       │
│ - Name, Email, Join Date                    │
├─────────────────────────────────────────────┤
│ Wikimedia Credentials                       │
│ - Username (link), Years Active, Type       │
│ - Edit Count, Contributions URL             │
├─────────────────────────────────────────────┤
│ Purpose Statement                           │
│ [Full text]                                 │
├─────────────────────────────────────────────┤
│ Notable Projects                            │
│ [Full text if provided]                     │
├─────────────────────────────────────────────┤
│ Request Metadata                            │
│ - Submitted, Days Pending                   │
├─────────────────────────────────────────────┤
│ Admin Actions                               │
│ [Approve] [Reject]                          │
│ [Admin Notes Textarea]                      │
└─────────────────────────────────────────────┘
```

### 6.4. Approval Process
```
Flow:
1. Admin clicks "Approve"
2. Optional: Add admin notes
3. Confirmation modal
4. Backend:
   - Update request → "approved"
   - Create subscription (plan: wikimedia_complimentary)
   - Update user role → premium_subscriber
   - Set reviewed_by, reviewed_at
5. Send approval email
6. Send in-app notification
7. Redirect to next request
```

**Approval Email:**
```
Subject: Your Premium Subscription Approved!

Dear [Name],

Your request for complimentary Premium access is approved.

You now have access to:
✓ Create unlimited communities
✓ Manage sub-chapter hierarchies
✓ Access advanced analytics
✓ Priority support

Get started: [Link]
```

### 6.5. Rejection Process
```
Flow:
1. Admin clicks "Reject"
2. Required: Add admin notes (reason)
3. Confirmation modal
4. Backend:
   - Update request → "rejected"
   - Set reviewed_by, reviewed_at
   - Store admin notes
5. Send rejection email
6. Redirect to next request
```

**Rejection Email:**
```
Subject: Update on Your Premium Subscription Request

Dear [Name],

Thank you for your interest. We're unable to approve 
your request at this time.

You can still use the platform or subscribe through 
our standard paid plans.

Questions? Contact support@platform.com
```

---

## 7. Subscription Management

### 7.1. User Dashboard (`/settings/subscription`)

**Active Premium (Paid):**
```
┌─────────────────────────────────────────────┐
│ Premium Subscription                        │
│ Status: Active ✓                            │
│ Plan: Monthly / Annual                      │
│ Next Billing: [Date]                        │
│ Amount: ₹499 / $6                           │
├─────────────────────────────────────────────┤
│ Billing History                             │
│ [Invoice list with downloads]               │
├─────────────────────────────────────────────┤
│ Payment Method                              │
│ [Card XXXX] [Update]                        │
├─────────────────────────────────────────────┤
│ [Change Plan] [Cancel Subscription]         │
└─────────────────────────────────────────────┘
```

**Active Premium (Wikimedia):**
```
┌─────────────────────────────────────────────┐
│ Premium Subscription                        │
│ Status: Active ✓                            │
│ Plan: Wikimedia Complimentary Access        │
│ Granted: [Date]                             │
│ Part of Wikimedia partnership program       │
└─────────────────────────────────────────────┘
```

**Pending Request:**
```
┌─────────────────────────────────────────────┐
│ Subscription Request Pending                │
│ Your request is under review                │
│                                             │
│ Submitted: [Date]                           │
│ Estimated: 48-72 hours                      │
└─────────────────────────────────────────────┘
```

### 7.2. Cancellation (Paid Only)
```
Flow:
1. User clicks "Cancel Subscription"
2. Retention modal: "Are you sure?"
3. Optional feedback: "Why canceling?"
4. If confirmed:
   - Set auto_renew = false
   - Keep active until end_date
   - Send cancellation confirmation
5. On end_date:
   - Update status → "expired"
   - Downgrade role → registered_user
```

### 7.3. Renewal Handling (Paid)

**Auto-Renewal:**
```
7 days before end_date:
  → Send reminder email

On end_date:
  → Attempt payment
  → If success:
    - Extend end_date
    - Send invoice
  → If failed:
    - Retry 3 times (24h intervals)
    - Send failure email
    - Grace period: 7 days
    - If still failed → downgrade
```

---

## 8. Database Schema

### 8.1. Users Table Extension
```sql
ALTER TABLE users ADD COLUMN (
  user_type ENUM(
    'registered_user', 
    'premium_subscriber', 
    'platform_admin'
  ) DEFAULT 'registered_user',
  subscription_id UUID NULLABLE
);
```

### 8.2. Subscriptions Table
```sql
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  plan_type ENUM(
    'monthly', 
    'annual', 
    'wikimedia_complimentary'
  ),
  status ENUM(
    'active', 
    'expired', 
    'cancelled', 
    'payment_failed', 
    'pending'
  ),
  payment_gateway ENUM(
    'razorpay', 
    'stripe', 
    'admin_grant'
  ),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NULLABLE,
  amount_paid DECIMAL(10, 2),
  currency VARCHAR(3),
  transaction_id VARCHAR(255),
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
);
```

### 8.3. Subscription Requests Table
```sql
CREATE TABLE subscription_requests (
  request_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  wikimedia_username VARCHAR(255),
  wikimedia_profile_url VARCHAR(500),
  years_active INT,
  contribution_type ENUM(
    'editor', 
    'administrator', 
    'bureaucrat', 
    'organizer', 
    'developer', 
    'other'
  ),
  purpose_statement TEXT,
  edit_count INT NULLABLE,
  contributions_url VARCHAR(500) NULLABLE,
  notable_projects TEXT NULLABLE,
  alternative_email VARCHAR(255) NULLABLE,
  phone_number VARCHAR(20) NULLABLE,
  status ENUM(
    'pending', 
    'approved', 
    'rejected'
  ) DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULLABLE,
  reviewed_by UUID REFERENCES users(user_id) NULLABLE,
  admin_notes TEXT NULLABLE
);
```

### 8.4. Payment Transactions Table
```sql
CREATE TABLE payment_transactions (
  transaction_id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(subscription_id),
  gateway_transaction_id VARCHAR(255),
  payment_gateway ENUM('razorpay', 'stripe'),
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status ENUM(
    'pending', 
    'success', 
    'failed', 
    'refunded'
  ),
  payment_method VARCHAR(50),
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 9. API Endpoints

### 9.1. Standard Subscription
```
POST /api/subscriptions/create
Body: {
  plan_type: "monthly" | "annual",
  billing_info: {
    full_name: string,
    address: {...},
    gst_number?: string
  }
}
Response: {
  subscription_id: UUID,
  payment_gateway_url: string,
  session_id: string
}

POST /api/webhooks/razorpay
POST /api/webhooks/stripe
```

### 9.2. Wikimedia Requests
```
POST /api/subscriptions/request
Body: {
  wikimedia_username: string,
  wikimedia_profile_url: string,
  years_active: number,
  contribution_type: string,
  purpose_statement: string,
  edit_count?: number,
  contributions_url?: string,
  notable_projects?: string,
  alternative_email?: string,
  phone_number?: string
}

GET /api/subscriptions/request/:request_id
```

### 9.3. Admin Endpoints
```
GET /api/admin/subscription-requests
  ?status=pending&page=1&limit=20

PUT /api/admin/subscription-requests/:request_id/approve
Body: { admin_notes?: string }

PUT /api/admin/subscription-requests/:request_id/reject
Body: { admin_notes: string }
```

### 9.4. Management
```
GET /api/subscriptions/me
PUT /api/subscriptions/cancel
PUT /api/subscriptions/update-payment
```

---

## 10. Payment Integration

### 10.1. Razorpay (India)
```javascript
const options = {
  key: process.env.RAZORPAY_KEY_ID,
  amount: amount * 100, // paise
  currency: "INR",
  name: "Platform Name",
  subscription_id: subscriptionId,
  prefill: {
    email: user.email,
    contact: user.phone
  },
  theme: { color: "#00669A" }
};
```

### 10.2. Stripe (International)
```javascript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: priceId,
    quantity: 1
  }],
  success_url: `${domain}/subscription/success`,
  cancel_url: `${domain}/subscription/cancelled`
});
```

---

## 11. Email Templates

**Required Templates:**
1. Subscription Confirmation (Paid)
2. Request Received (Wikimedia)
3. Request Approved (Wikimedia)
4. Request Rejected (Wikimedia)
5. Payment Failed
6. Renewal Reminder
7. Subscription Cancelled
8. Subscription Expired

**Stack:**
- NodeMailer (SMTP) for sending
- HTML templates with branding

---

## 12. Automated Jobs

**Daily:**
- Check expiring subscriptions (7-day reminders)
- Process failed payment retries
- Expire grace period subscriptions

**Hourly:**
- Process payment webhook queue
- Update subscription statuses

---

## 13. Security & Compliance

### 13.1. Payment Security
- PCI DSS compliance via gateways
- No card storage on platform
- SSL/TLS encryption
- Regular security audits

### 13.2. Data Protection
- GDPR compliance
- Data encryption at rest
- Audit logs for changes
- Secure OAuth token handling

### 13.3. Fraud Prevention
- Email verification required
- Rate limiting on requests
- Admin review for suspicious patterns
- Wikimedia profile verification

---

## 14. Success Metrics

### 14.1. Conversion
- Free to Premium rate (target: 5-10%)
- Wikimedia approval rate (target: >70%)
- Payment success rate (target: >95%)
- Completion rate (target: >80%)

### 14.2. Retention
- Monthly churn (target: <5%)
- Annual plan adoption (target: >30%)
- Payment recovery (target: >60%)

### 14.3. Operations
- Review time (target: <48 hours)
- Dashboard load (target: <2 seconds)
- Gateway uptime (target: 99.9%)

---

## 15. Future Enhancements

- Team/Organization subscriptions
- Enterprise custom tiers
- Referral program
- Wikimedia API verification
- Multi-currency expansion
- Cryptocurrency payments
- Gift subscriptions

---

## Document Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 30, 2024 | Initial subscription system PRD |