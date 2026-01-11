# Community & Event Management Platform

A scalable, hierarchy-based community management platform that empowers users to build "Chapters" (communities) and organize diverse "Events." The platform focuses on deep community engagement through advanced profiles, sub-chapter hierarchies (parent-child relationships), and robust event management tools (ticketing, check-ins, feedback).

**Reference Models:** Meetup.com, Bevy.com, Google Developers Groups

---

## 🚀 Features

### User & Identity
- **OAuth Registration:** One-click sign-up/login via Wikimedia, Google, and Email/Password
- **Advanced User Profiles:** Bio, social links, skills & interests tagging
- **Personal Dashboard:** Communities, calendar, inbox, and notifications feed

### Community Management
- **Chapter Creation:** Step-by-step wizard for Premium subscribers
- **Sub-Chapter Hierarchy:** Parent-child relationships with inheritance
- **Privacy Settings:** Public, Private, or Unlisted chapters
- **Member Directory:** Searchable with filters (Name, Skills, Interests)
- **Analytics & Financial Overview:** Track events, members, tickets, and revenue

### Event Management
- **Rich Event Creator:** WYSIWYG/Markdown editor, media uploads, agenda builder
- **Multiple Event Types:** Conference, Workshop, Hackathon, AMA, Panel Discussion, and more
- **Event Modalities:** Online, Hybrid, or In-Person with Google Maps integration
- **Ticketing System:** Free RSVP with waitlist or Paid tickets via Razorpay/Stripe
- **Attendee Management:** Check-in system (browser-based or QR code), email communication
- **Post-Event Automation:** Automated reminders and feedback surveys

### Discovery & Engagement
- **Global Search:** Search across Chapters, Events, and Users
- **Recommendation Engine:** Personalized event suggestions based on skills and location
- **Categorization:** Robust tagging system for discovery
- **Announcements:** Pinned posts with email notifications

---

## 👥 User Roles & Permissions

### Platform Level
- **Registered User:** Join chapters, RSVP to events, manage profile
- **Premium Subscriber:** Create new Chapters (paid subscription)

### Chapter Level
- **Organizer:** Full control (owner)
- **Co-Organizer:** Manage members, events, content (cannot delete chapter)
- **Event Manager:** Create and manage events/attendees only
- **Moderator:** Manage discussions and members (ban/mute)
- **Member:** Standard participant

---

## 🛠️ Tech Stack

- **Package Manager:** [npm](https://www.npmjs.com/)
- **Monorepo:** [Turborepo](https://turbo.build/)
- **Frontend:** [Next.js](https://nextjs.org/) (App Router)
- **Backend:** Next.js API Routes
- **Authentication:** [Auth.js](https://authjs.dev/) (Email, Wikimedia, Google)
- **Database:** MySQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Storage:** Amazon S3
- **Maps:** Google Maps API / Mapbox
- **Payments:** Razorpay (India) & Stripe (Global)
- **Email:** NodeMailer & Resend
- **Styling:** Tailwind CSS

---

## 📋 Prerequisites

- Node.js 18+ 
- npm (comes with Node.js)
- MySQL database
- (Optional) AWS S3 bucket for file storage
- (Optional) Google Maps API key
- (Optional) Payment provider accounts (Razorpay/Stripe)

---

## 🚦 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd community-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# Authentication
AUTH_SECRET="your-auth-secret"
AUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
WIKIMEDIA_CLIENT_ID="your-wikimedia-client-id"
WIKIMEDIA_CLIENT_SECRET="your-wikimedia-client-secret"

# Storage (S3)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-bucket-name"

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Payments
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"

# Email
RESEND_API_KEY="your-resend-api-key"
```

4. Set up the database:
```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
community-management/
├── doc/
│   ├── prd/                          # Product Requirements Document
│   └── additional-doc/               # Additional documentation
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles
│   └── db/
│       ├── index.ts                 # Database connection
│       └── schema/                  # Drizzle ORM schemas
│           └── index.ts
├── public/                           # Static assets
├── drizzle.config.ts                # Drizzle configuration
├── next.config.ts                    # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## 🎨 Design Guidelines

The platform follows a clean, spacious design that evokes trust, growth, and community.

### Color Palette
- **Primary (Calming Blue):** `#00669A` - Headers, Primary Buttons, Branding
- **Secondary (Growth Green):** `#2F9A67` - Success states, Join buttons, Accents
- **Alert/Action (Tint of Red):** `#9B0000` - Delete actions, Errors, Important Notifications
- **Neutral:** White backgrounds, light grey for cards/sections

### Design Principles
- **Clean & Spacious:** Avoid clutter; focus on readability
- **Mobile First:** Seamless experience on mobile browsers

---

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes directly (development)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

---

## 📚 Documentation

- [Product Requirements Document (PRD)](./doc/prd/Product_Requirements_Document_(PRD).md)
- [Drizzle ORM Setup Guide](./doc/additional-doc/drizzle-orm-setup.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

See [LICENSE](./LICENSE) file for details.

---

## 🔗 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Auth.js Documentation](https://authjs.dev/)
