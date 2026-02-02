# Purpose-Driven Routine Builder

A calm, anti-hustle web app that helps you build sustainable daily routines—either with AI guidance or manually from scratch.

**Philosophy**: We don't give motivation. We help users build rhythm.

---

## 🔐 Authentication System

This app now includes **full-stack user authentication** with NextAuth.js. See [AUTHENTICATION.md](./AUTHENTICATION.md) for complete documentation.

**Key Features:**
- Secure user registration and login
- Per-user data isolation
- Password hashing with bcryptjs
- Session-based authentication
- Protected API routes

[Get Started with Authentication →](./AUTHENTICATION.md)

---

## 🎯 Core Features

### 1. **AI-Powered Onboarding** (Optional)
- Answer 12 strategic questions about your goals, energy patterns, and obstacles
- AI generates a personalized daily routine with 7-9 activities
- Includes all your development areas (not just the primary focus)
- Each activity has specific time slots (12-hour format)

### 2. **Manual Template Builder**
- Build routines completely manually, no AI required
- Add activities one by one with title, weight, start/end times
- Save as a template and activate immediately
- Perfect when AI quota is exceeded or you prefer full control

### 3. **Daily Routine Management** (Today Page)
- View today's routine in chronological order
- Mark activities as complete, edit, or delete
- Add new routines on-the-fly
- See completion score and progress
- Time ranges display in readable 12-hour format (e.g., "6:00 AM - 6:30 AM")

### 4. **Calendar View**
- Monthly calendar showing which days have routines
- Click a day to see details and completion status
- Track your consistency over time

### 5. **Analytics & Scoring**
- Daily discipline rating (completion percentage)
- Weekly breakdown of total activities and completions
- Progress visualization
- Average weekly score

### 6. **Template Management** (Settings)
- View all created templates
- Activate/deactivate templates
- Delete templates
- Quick links to create new routines (AI or Manual)

---

## 📋 Tech Stack

- **Framework**: Next.js 14.2.0 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS with calm color palette
- **AI**: OpenAI API (gpt-4o-mini) for routine generation
- **Language**: TypeScript 5.1.6

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features only; manual builder works without it)

### Installation Steps

1. **Clone/Navigate to project**
   ```bash
   cd "Routine Builder"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env
   ```
   Then edit `.env` and add:
   ```
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="your-api-key-here"
   ```

4. **Initialize database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001)

---

## 📖 How to Use

### Option A: AI-Powered Routine Creation

1. Click **"Let AI help me create a routine"** on home page
2. Answer 12 questions about:
   - **What matters**: Primary focus + other development areas + skills
   - **Time & Energy**: Available time, peak energy hours, energy pattern
   - **Obstacles**: What derails you, consistency pattern
   - **Structure**: Preferred routine structure, learning style
   - **Motivation**: Why now, 30-day goal
3. AI generates a personalized routine with time blocks for all your focus areas
4. Routine is saved as active template
5. Go to **Today** page to start your day

### Option B: Manual Routine Builder

1. Click **"I'll build mine manually"** on home page (or Settings → Build Manual Template)
2. Name your routine (e.g., "My Balanced Day")
3. Add activities one by one:
   - **Title**: What you'll do (e.g., "Web development", "Music practice")
   - **Weight**: Importance/difficulty (0.5 = light, 1 = normal, 1.5+ = important)
   - **Start Time**: When to start (24-hour format, converts to 12-hour display)
   - **End Time**: When to finish
4. Click **"Add Activity"** for each item
5. Click **"Save & Activate Template"**
6. You're taken to **Today** page with your routine ready

### Using the Today Page

**View Routines**:
- Activities sorted by start time (morning → day → evening)
- Shows time range in 12-hour format (e.g., "6:00 AM - 6:30 AM")
- Shows weight (importance) and any custom time

**Manage Routines**:
- **Mark done**: Click button to check off completed activities
- **Edit**: Modify title, weight, or time slots
- **Delete**: Remove an activity (can't undo)
- **Add**: Add a new activity on-the-fly with custom times
- **Recreate**: Reload today's routine from active template

**Track Progress**:
- Daily Score card shows discipline rating (% completed)
- Broken down as: Achieved Points / Total Possible Points

### Calendar View

- See which days have routines (filled cells)
- Click any day to see full routine details
- View completion status for past days
- Shows time ranges and weights

### Analytics Page

- **Weekly Summary**: 
  - Total activities this week
  - Completed activities
  - Average discipline score
  - Trend (improving/declining)

- **All-Time Stats**:
  - Total activities logged
  - Overall completion rate
  - Average performance

---

## 🏗️ Architecture & How It Works

### Data Model

The app uses these main entity types:

1. **RoutineTemplate** (Template)
   - Reusable template with multiple activities
   - Marked as `createdByAI` or manual
   - One template can be `isActive` at a time
   - Contains many `DayRoutineTemplateItem`s

2. **DayRoutineTemplateItem** (Template Activity)
   - Individual activity in a template
   - Has: title, description, category, defaultWeight
   - Has time fields: `customStartTime`, `customEndTime` (24-hour format)
   - Has `orderIndex` for ordering
   - Optional: `recommendedTime` (e.g., "30 min")

3. **CalendarDay** (Daily Instance)
   - One per day
   - Links to a template to copy activities from
   - Contains many `DayRoutineInstance`s

4. **DayRoutineInstance** (Daily Activity)
   - Individual activity for a specific day
   - Can override template values: title, weight, times
   - Links to a `DayRoutineCheck` for completion tracking
   - Can be marked as `isSkipped`

5. **DayRoutineCheck** (Completion)
   - Tracks if an activity was completed
   - Records completion time
   - Optional: effort rating, user notes

### Key Flows

**Creating a Template from AI**:
1. User answers 12 onboarding questions
2. POST `/api/ai/onboard` with answers
3. OpenAI generates routine JSON (7-9 items)
4. Time slots calculated: morning (6am+), day (9am+), evening (8pm+)
5. Template + items saved to database
6. Template activated automatically
7. Redirect to Today page

**Creating a Manual Template**:
1. User adds activities on `/manual` page
2. POST `/api/templates/manual` with activities
3. Template created with all items
4. Template activated automatically
5. Redirect to Today page

**Creating Today's Routine**:
1. User visits `/today` page
2. Check if CalendarDay exists for today
3. If not, or if "Recreate" clicked:
   - POST `/api/calendar/create-today`
   - Copy all template items as instances
   - Calculate time slots for each instance
   - Return today's routine
4. Display instances sorted by `customStartTime`

**Daily Management**:
- **Mark Done**: POST `/api/checks/toggle` → calculate daily score
- **Edit Activity**: PATCH `/api/calendar/instances/{id}` → update title/weight/times
- **Delete Activity**: DELETE `/api/calendar/instances/{id}`
- **Add Activity**: POST `/api/calendar/instances` → creates new instance
- **Fetch Today**: GET `/api/calendar/today` → returns CalendarDay with instances

### Time Handling

**Time Storage**: 24-hour format (HH:MM), e.g., "06:00", "14:30"

**Time Display**: 12-hour format with AM/PM
```typescript
const formatTime12h = (time?: string) => {
  if (!time) return ''
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}
// "06:00" → "6:00 AM"
// "14:30" → "2:30 PM"
```

**Time Calculation** (AI routines):
- Morning items start at 6:00 AM (360 minutes)
- Day items start at 9:00 AM (540 minutes)
- Evening items start at 8:00 PM (1200 minutes)
- 5-minute buffer between activities
- End time calculated from start + duration

---

## 🤖 AI Integration

### How AI Routine Generation Works

**The Prompt Strategy**:
1. **Centers on primary focus**: Gets best time slot and most weight
2. **Includes all areas**: Each focus area gets its own activity block
3. **Matches energy**: Places demanding work during peak energy time
4. **Accounts for obstacles**: Adds buffers and flexibility
5. **Respects constraints**: Doesn't overschedule

**AI Response Format** (JSON):
```json
{
  "coreTheme": "Building Web development, Leadership, Music",
  "anchorHabits": ["Web development", "Leadership", "Music", "Reflection"],
  "dailyRoutine": {
    "morning": [...],
    "day": [...],
    "evening": [...]
  },
  "weeklyNotes": "Start small. Build rhythm. Adjust as you grow."
}
```

**Fallback Routine** (When quota exceeded):
- Automatically generates basic routine from your answers
- Includes all focus areas
- Uses default times
- No API call needed

---

## 📁 Project Structure

```
Routine Builder/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── onboarding/page.tsx         # AI onboarding (12 questions)
│   ├── manual/page.tsx             # Manual template builder
│   ├── today/page.tsx              # Daily routine management
│   ├── calendar/page.tsx           # Monthly calendar view
│   ├── analytics/page.tsx          # Weekly/all-time stats
│   ├── settings/page.tsx           # Template management
│   └── api/
│       ├── templates/
│       │   ├── route.ts            # GET all, POST new
│       │   ├── [id]/route.ts       # DELETE template
│       │   ├── activate/route.ts   # POST activate
│       │   └── manual/route.ts     # POST create manual
│       ├── calendar/
│       │   ├── today/route.ts      # GET today's routine
│       │   ├── create-today/route.ts
│       │   └── instances/route.ts  # CRUD operations
│       ├── checks/toggle/route.ts  # Mark complete
│       ├── ai/onboard/route.ts     # AI generation
│       └── analytics/weekly/route.ts
├── lib/
│   ├── ai.ts                       # OpenAI integration
│   ├── prisma.ts                   # DB client
│   └── helpers.ts                  # Utilities
├── styles/globals.css              # Tailwind + colors
├── prisma/schema.prisma            # Database schema
├── .env                            # API keys
└── package.json
```

---

## 🎨 UI/UX Features

### Color Palette (Calm Theme)
- `calm-50`: Very light background
- `calm-100`: Light accents
- `calm-200`: Borders
- `calm-500`: Primary buttons
- `calm-600`: Hover states

### Key Patterns

**Activity Cards**: Show title, time range, weight, action buttons

**Forms**: Clean inputs with labels and placeholders

**Time Inputs**: HTML5 time inputs (24h) display as 12h

**Empty States**: Helpful messages with clear actions

---

## 🔐 Security Notes

- Store `OPENAI_API_KEY` in `.env` only (not in git)
- AI calls happen server-side only
- Default user ID for now (can add auth later)

---

## 🚀 API Endpoints

### Templates
- `GET /api/templates` - List all
- `POST /api/templates/manual` - Create manual
- `POST /api/templates/activate` - Set active
- `DELETE /api/templates/{id}` - Delete

### Calendar
- `GET /api/calendar/today` - Today's routine
- `POST /api/calendar/create-today` - Create from template
- `POST/PATCH/DELETE /api/calendar/instances` - CRUD activities

### Checks
- `POST /api/checks/toggle` - Mark complete, calculate score

### AI
- `POST /api/ai/onboard` - Generate from answers

### Analytics
- `GET /api/analytics/weekly` - Weekly stats

---

## 📝 Onboarding Questions (12)

**Core Discovery**
1. Primary focus
2. Other areas (2-3)
3. Required skills

**Time & Energy**
4. Available daily time
5. Peak energy time
6. Energy pattern throughout day

**Obstacles & Patterns**
7. What derails you
8. Consistency pattern

**Structure & Learning**
9. Preferred routine structure
10. Learning style

**Motivation**
11. Why now
12. 30-day goal

---

## 🐛 Troubleshooting

### "Cannot read properties of undefined"
- Check Prisma model names
- Ensure `userId` is provided
- Run `npx prisma generate`

### "OpenAI quota exceeded"
- Wait for monthly reset (usually 1st of month)
- Use fallback routine (no API needed)
- Use manual builder

### Times not displaying
- Verify `customStartTime` fields exist in DB
- Run `npx prisma db push`
- Check time format is HH:MM

### Routines not showing
- Ensure template is activated
- Click "Create today's routine"
- Check browser console

---

## � Recent Changes

### Version 2.0.0 - Full-Stack Authentication (Feb 2, 2026)

**Major Update: Complete authentication system implemented!**

- ✅ NextAuth.js integration with JWT sessions
- ✅ User registration and login pages
- ✅ Secure password hashing with bcryptjs
- ✅ Protected API routes requiring authentication
- ✅ Per-user data isolation
- ✅ Session persistence across pages
- ✅ Logout functionality
- ✅ Comprehensive documentation

For detailed changes, see [CHANGELOG.md](./CHANGELOG.md)

For authentication setup and usage, see [AUTHENTICATION.md](./AUTHENTICATION.md)

---

## 📚 Future Enhancements

- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Social login (Google, GitHub)
- [ ] Timezone support improvements
- [ ] Weekly variations
- [ ] Template sharing between users
- [ ] Mobile app
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Habit streaks
- [ ] Two-factor authentication

---

## 📖 Documentation

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete authentication system guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **[README.md](./README.md)** - This file

---

## 💡 Philosophy

**No Hustle**: Sustainable rhythm, not grinding

**Purposeful**: All activities tied to your goals

**Flexible**: Easy to adjust, no guilt

**Calm**: Minimal, clean design

---

**Built with intention. No hustle, just rhythm.** 🌙
