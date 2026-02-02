# Authentication System Documentation

## Overview

The Routine Builder app now includes a complete full-stack authentication system using **NextAuth.js v5** and **Prisma ORM**. This ensures each user's routines, calendar data, and analytics are securely isolated and persisted in the database.

## Features

- ✅ User registration with email and password
- ✅ Secure login with JWT-based sessions
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes requiring authentication
- ✅ Per-user data isolation
- ✅ Session-based user identification
- ✅ Logout functionality
- ✅ Dark mode support on auth pages

## Installation & Setup

### Dependencies Added

```bash
npm install next-auth bcryptjs
```

### Environment Variables

Add the following to your `.env` file:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

**Important:** Change `NEXTAUTH_SECRET` to a secure random string in production. Generate one with:

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Using Node.js (any OS):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Migration

The User model was updated to include a `password` field:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  password  String?  // <- New field for authentication
  timezone  String
  createdAt DateTime @default(now())
  
  templates       RoutineTemplate[]
  calendarDays    CalendarDay[]
  dailyScores     DailyScore[]
  weeklySummaries WeeklySummary[]
  aiLogs          AIGenerationLog[]
}
```

Migration was applied automatically:
```bash
npx prisma migrate dev --name add_password_to_user
```

## Project Structure

### New Files Created

```
lib/
  └── auth.ts                           # NextAuth configuration & credentials provider

app/api/auth/
  ├── [...nextauth]/route.ts           # NextAuth route handler
  └── register/route.ts                # User registration endpoint

app/
  ├── login/page.tsx                   # Login page
  ├── register/page.tsx                # Registration page
  └── page.tsx                         # Updated home page (now redirects authenticated users)

components/
  ├── SessionProvider.tsx              # Wraps app with NextAuth SessionProvider
  ├── ConditionalThemeToggle.tsx       # Updated to show logout button when authenticated
  ├── LogoutButton.tsx                 # Logout functionality
  └── HomeContent.tsx                  # Extracted home page content
```

### Modified Files

```
app/layout.tsx                          # Added SessionProvider wrapper
app/api/templates/route.ts              # Now requires authentication
app/api/calendar/today/route.ts         # Now requires authentication
app/api/calendar/month/route.ts         # Now requires authentication
app/api/analytics/weekly/route.ts       # Now requires authentication
.env                                    # Added NEXTAUTH_SECRET & NEXTAUTH_URL
prisma/schema.prisma                    # Added password field to User model
```

## Authentication Flow

### Registration Flow

1. User visits `/register`
2. Enters email, password, and optional name
3. Password is hashed with bcryptjs (10 rounds)
4. User record is created in database
5. Redirected to `/login` page

**Endpoint:** `POST /api/auth/register`

```typescript
{
  email: string,
  password: string,
  name?: string
}
```

### Login Flow

1. User visits `/login`
2. Enters email and password
3. NextAuth validates credentials against database
4. JWT session token is created
5. User is redirected to requested page or dashboard

**Endpoint:** Uses NextAuth credentials provider (no direct API call)

### Session Management

- Sessions use **JWT strategy** for stateless authentication
- Session includes user `id`, `email`, and `name`
- Sessions persist across page navigations
- Sessions can be cleared with logout

**Home Page Behavior:**
- Unauthenticated users see the landing page
- Authenticated users are automatically redirected to `/today` dashboard

## API Authentication

All protected API routes now require an authenticated session:

### Before (Query Parameter)
```typescript
GET /api/templates?userId=default
GET /api/calendar/today?userId=default
```

### After (Session-Based)
```typescript
GET /api/templates
GET /api/calendar/today
```

Each API route validates the session and uses `session.user.id`:

```typescript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  // ... rest of logic
}
```

### Protected API Routes

- `GET /api/templates` - List user's templates
- `POST /api/templates` - Create new template
- `GET /api/calendar/today` - Get today's routine
- `GET /api/calendar/month` - Get monthly calendar
- `GET /api/analytics/weekly` - Get weekly analytics
- Other calendar and routine endpoints

## Component Integration

### SessionProvider

Wraps the entire app with NextAuth's SessionProvider for session management:

```typescript
// app/layout.tsx
<SessionProvider>
  <ThemeProvider>
    {/* App content */}
  </ThemeProvider>
</SessionProvider>
```

### ConditionalThemeToggle

Updated to show logout button when authenticated:

```typescript
const { data: session } = useSession()
const isHomePage = pathname === '/'

return (
  <div className={`fixed top-4 z-50 flex items-center gap-2 ...`}>
    {session && <LogoutButton />}
    <ThemeToggle />
  </div>
)
```

### Using useSession Hook

In client components, check authentication status:

```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>

  return <div>Welcome, {session.user.name}</div>
}
```

## Security Considerations

### Password Security
- Passwords are hashed with bcryptjs (10 salt rounds)
- Passwords are never stored in plaintext
- Password validation happens server-side only

### Session Security
- JWT tokens are signed with `NEXTAUTH_SECRET`
- Sessions have configurable expiration (default: 30 days)
- Tokens are httpOnly in production

### API Security
- All protected endpoints verify session validity
- Unauthorized requests return 401 status
- User data is filtered by `userId` from session

### CORS & CSRF
- NextAuth handles CSRF protection automatically
- Session cookies are secure and httpOnly

## Testing the Authentication

### Manual Testing

1. **Test Registration:**
   ```
   1. Visit http://localhost:3000
   2. Click "Get Started"
   3. Enter email: test@example.com
   4. Enter password: Password123
   5. Submit
   ```

2. **Test Login:**
   ```
   1. Visit http://localhost:3000/login
   2. Enter registered email
   3. Enter password
   4. Click "Sign In"
   ```

3. **Test Session Persistence:**
   ```
   1. Log in and navigate around the app
   2. Refresh the page - session persists
   3. Close and reopen browser - session persists
   ```

4. **Test Logout:**
   ```
   1. While logged in, look for "Sign Out" button (top-left)
   2. Click it
   3. Redirected to login page
   4. Session is cleared
   ```

5. **Test Data Isolation:**
   ```
   1. Create template as user1
   2. Log out
   3. Register/log in as user2
   4. Verify user2 doesn't see user1's templates
   ```

### API Testing

Test protected endpoints with curl:

```bash
# Without authentication (should fail)
curl http://localhost:3000/api/templates
# Response: { "error": "Unauthorized" }

# With valid session (requires browser cookie)
# Navigate to the app first, then open developer tools
```

## Troubleshooting

### Issue: "Unauthorized" on all API calls
**Solution:** Ensure you're logged in and SessionProvider is wrapping your app in layout.tsx

### Issue: NEXTAUTH_SECRET not set
**Solution:** Add `NEXTAUTH_SECRET` to your `.env` file

### Issue: Sessions not persisting
**Solution:** Verify `NEXTAUTH_URL` matches your app's URL (localhost:3000 for dev)

### Issue: Passwords not being hashed
**Solution:** Ensure bcryptjs is properly imported in `/api/auth/register/route.ts`

## Future Enhancements

Consider adding:
- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Session management dashboard
- [ ] Activity logging
- [ ] Rate limiting on auth endpoints

## Deployment & Production Setup

**CRITICAL: Before deploying to production:**

1. **Generate a new strong NEXTAUTH_SECRET** (never reuse the dev one):
   - **Windows PowerShell:** 
     ```powershell
     [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
     ```
   - **Mac/Linux:** 
     ```bash
     openssl rand -base64 32
     ```
   - **Any OS with Node.js:** 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```

2. **Update environment variables:**
   - Set `NEXTAUTH_URL=https://yourdomain.com` (your actual domain)
   - Set `NEXTAUTH_SECRET=<newly-generated-random-string>`
   - Keep `DATABASE_URL` pointing to production database

3. **Database migration:**
   - Run `npx prisma migrate deploy` on production
   - Ensure database schema is updated with password field

4. **HTTPS enforcement:**
   - All auth routes require HTTPS in production
   - Set secure cookies in production environment

5. **Security checklist:**
   - ✅ Use strong NEXTAUTH_SECRET (32+ random bytes)
   - ✅ Use HTTPS URLs
   - ✅ Set secure environment variables in hosting platform
   - ✅ Never commit `.env` to version control
   - ✅ Regularly rotate secrets
   - ✅ Monitor authentication logs

## Architecture Diagram

```
User Visit
    ↓
[Home Page] → Not authenticated? → [Registration/Login]
    ↓                                    ↓
Authenticated? → [SessionProvider] → Get session
    ↓                                    ↓
[Dashboard] → API Request → [Protected Route]
    ↓                            ↓
[NextAuth] checks session → Validate → Return data
    ↓
[useSession Hook] → Display user data
```

## Reference Files

- **NextAuth Config:** `lib/auth.ts`
- **Auth Routes:** `app/api/auth/`
- **Auth Pages:** `app/login/page.tsx`, `app/register/page.tsx`
- **Session Provider:** `components/SessionProvider.tsx`
- **Logout Component:** `components/LogoutButton.tsx`
- **Environment Config:** `.env`

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth Credentials Provider](https://next-auth.js.org/providers/credentials)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Prisma User Management](https://www.prisma.io/docs/guides/database/seed-database)

---

**Last Updated:** February 2, 2026
**Authentication System Version:** 1.0
**NextAuth Version:** Latest (v5 beta)
**Node Version:** Compatible with Node 16+
