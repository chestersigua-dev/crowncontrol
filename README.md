# 👑 Pageant Management System

A production-ready, real-time **Pageant Management System** designed for beauty pageants, talent competitions, school pageants, and large-scale events.

The platform provides secure judge scoring, audience voting, live leaderboards, analytics dashboards, and offline judging capabilities to ensure smooth event operations even in challenging network environments.

---

# ✨ Features

## 👨‍💼 Administration

* Candidate Management (CRUD)
* Judge Management (CRUD)
* Criteria Management (CRUD)
* Pageant Section Management (CRUD)
* System Settings Management
* Pageant Name Configuration
* Logo Upload & Management
* Live Event Monitoring

---

## 👑 Candidate Management

Manage candidate information including:

* Candidate Number
* First Name
* Last Name
* Representation
* Photo
* Height
* Bust
* Waist
* Hips
* Handler
* Makeup Artist
* Manager

---

## ⚖️ Judge Management

Manage judges with:

* Username Login
* System Generated Password
* Role-Based Access
* Chairman Designation 👑
* Profile Photos
* Secure Authentication

### Features

* Judge-only access to scoring modules
* Password reset on first login
* Audit logging

---

## 🏆 Pageant Sections

Fully configurable pageant segments:

* Casual Wear
* Production Number
* Evening Gown
* Swimsuit
* Question & Answer
* Talent Competition
* Special Awards

Administrators may add unlimited custom sections.

---

## 📋 Criteria Management

Each section may have its own judging criteria.

### Example

| Criteria    | Percentage | Max Score |
| ----------- | ---------- | --------- |
| Beauty      | 40%        | 100       |
| Poise       | 30%        | 100       |
| Personality | 30%        | 100       |

### Features

* Percentage-based scoring
* Real-time computation
* Validation against maximum scores
* Section-specific criteria

---

# 🎯 Judge Scoring System

Judges score candidates through a modern card-based interface.

### Features

* Candidate Cards
* Candidate Photos
* Real-time Score Calculation
* Mobile-Friendly Interface
* Auto-save Support
* Edit Tracking
* Section-Based Scoring

### Score Formula

```text
Final Score = Raw Score × Criteria Percentage
```

Example:

```text
Raw Score = 95
Percentage = 0.40

Final Score = 38
```

---

# 📝 Audit Trail

Every score submission is tracked.

### First Save

Records:

* Judge
* Candidate
* Criteria
* Timestamp

### Edit Tracking

Records:

* Original Score
* Updated Score
* Edit Timestamp
* Editor Information

This ensures transparency and accountability.

---

# 📡 Offline Judging Mode

Designed for venues with unstable internet connectivity.

### Features

* Local score storage
* Offline score entry
* Automatic synchronization
* Conflict resolution
* Sync status monitoring

### Workflow

```text
Judge Scores Candidate
        ↓
Internet Available?
      /   \
    Yes    No
     ↓      ↓
 Save      Store Offline
              ↓
      Internet Restored
              ↓
          Auto Sync
```

---

# 🗳️ Audience Voting System

Allows audience members to participate in selecting winners.

### Features

* No account required
* Mobile-Friendly Voting Interface
* Anti-Fraud Controls
* Live Vote Counting

### Voting Rules

* One vote per device per day
* Device fingerprint tracking
* Rate limiting
* Session validation
* Duplicate vote prevention

---

# 📊 Analytics Dashboard

Real-time event monitoring.

### Live Analytics

* Candidate Rankings
* Section Rankings
* Judge Activity
* Audience Votes
* Vote Trends

### Reports

* Overall Rankings
* Section Winners
* Judge Scoring Analysis
* Audience Engagement

### Visualizations

* Leaderboards
* Charts
* Score Trends
* Voting Heatmaps

---

# ⚡ Real-Time Updates

Powered by Socket.io.

### Live Features

* Live Leaderboards
* Vote Counts
* Ranking Updates
* Judge Submissions
* Analytics Refresh

No manual page refresh required.

---

# 🔐 Authentication & Authorization

## Roles

### Admin

Access to:

* Dashboard
* Candidates
* Judges
* Criteria
* Analytics
* Voting
* Settings

### Judge

Access to:

* Scoring Interface
* Candidate Information
* Assigned Sections

Restricted from:

* Administration
* Analytics
* System Settings

---

# 🛡️ Security Features

## Authentication

* JWT Authentication
* Refresh Tokens
* Password Hashing (bcrypt)

## API Security

* Role-Based Access Control
* Request Validation
* Rate Limiting
* Helmet Protection
* CORS Configuration

## Data Protection

* Secure Password Storage
* Input Sanitization
* Audit Logs
* Protected Endpoints

## Audience Voting Security

* Device fingerprint validation
* Daily voting limits
* Rate limiting
* Duplicate vote detection
* IP logging for audit purposes

---

# 🏗️ Technology Stack

## Backend

* Node.js
* TypeScript
* Express.js
* Prisma ORM
* PostgreSQL

## Frontend

* React
* TailwindCSS
* Axios

## Real-Time

* Socket.io

## Authentication

* JWT
* bcrypt

## Storage

* PostgreSQL
* Local Storage (Offline Mode)
* Optional AWS S3

---

# 📁 Project Structure

```text
src/
│
├── config/
│
├── modules/
│   ├── auth/
│   ├── candidates/
│   ├── judges/
│   ├── scoring/
│   ├── voting/
│   ├── analytics/
│   ├── offline-sync/
│   ├── settings/
│
├── middlewares/
│
├── services/
│
├── repositories/
│
├── validations/
│
├── utils/
│
├── app.ts
└── server.ts
```

---

# 🗄️ Database Modules

Core entities include:

* Candidates
* Judges
* Criteria
* Pageant Sections
* Scores
* Audience Votes
* Analytics Snapshots
* Offline Score Queue
* System Settings

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/pageant-management-system.git
```

## Install Dependencies

```bash
npm install
```

## Configure Environment

Create:

```bash
.env
```

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pageant
JWT_SECRET=super-secret-key
FRONTEND_URL=http://localhost:5173
PORT=3000
```

## Run Database Migration

```bash
npx prisma migrate dev
```

## Generate Prisma Client

```bash
npx prisma generate
```

## Start Development Server

```bash
npm run dev
```

---

# 📈 Future Roadmap

### Planned Features

* Multi-Event Support
* Mobile Application
* Event Scheduling
* Livestream Integration
* AI-Powered Insights
* Judge Bias Detection
* Fraud Detection System
* Cloud Deployment Templates
* SaaS Multi-Tenant Architecture

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a Pull Request

---

# 📄 License

MIT License

---

# 👑 Built For

* Beauty Pageants
* School Pageants
* Talent Competitions
* Corporate Events
* Festival Queens
* Tourism Ambassadors
* Modeling Competitions

---

## Reliable Scoring. Transparent Judging. Real-Time Results. 🚀👑
