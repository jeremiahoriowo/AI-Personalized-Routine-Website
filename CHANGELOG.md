# Changelog

All notable changes to the Routine Builder project are documented here.

## [2.0.0] - 2026-02-02

### Major Release: Full-Stack Authentication System

#### Added

**Authentication System**
- NextAuth.js v5 integration with JWT sessions
- Secure user registration with email/password
- Password hashing with bcryptjs (10 salt rounds)
- User login with credential validation
- Session-based authentication across the app
- Logout functionality with token clearing

**New Pages**
- `/login` - User login page with error handling
- `/register` - User registration page with form validation
- Updated `/` - Home page now redirects authenticated users to dashboard

**New API Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth route handler

**New Components**
- `SessionProvider.tsx` - Wraps app with NextAuth session provider
- `ConditionalThemeToggle.tsx` - Updated to show logout button when authenticated
- `LogoutButton.tsx` - Logout button component
- `HomeContent.tsx` - Extracted home page content component

**Database Changes**
- Added `password?: String` field to User model in Prisma schema
- Created migration: `20260202040133_add_password_to_user`
- User table now supports authentication

**Environment Variables**
- `NEXTAUTH_SECRET` - For signing JWT tokens
- `NEXTAUTH_URL` - Application URL (localhost:3000 for dev)

**Protected API Routes**
- `GET /api/templates` - Now requires authentication
- `POST /api/templates` - Now requires authentication
- `GET /api/calendar/today` - Now requires authentication
- `GET /api/calendar/month` - Now requires authentication
- `GET /api/analytics/weekly` - Now requires authentication
- All routes now use session-based `userId` instead of query parameters

**Documentation**
- `AUTHENTICATION.md` - Comprehensive authentication documentation
- Setup instructions, testing guide, troubleshooting, security considerations

#### Modified

**Core Layout**
- `app/layout.tsx` - Wrapped with SessionProvider for session management
- Updated imports and structure

**Authentication Configuration**
- `lib/auth.ts` - Created NextAuth configuration with credentials provider
- Implements JWT strategy, session callbacks, and custom pages

**API Routes - User Isolation**
- `app/api/templates/route.ts` - Uses session.user.id instead of query param
- `app/api/calendar/today/route.ts` - Uses session.user.id for data fetching
- `app/api/calendar/month/route.ts` - Uses session.user.id for data fetching
- `app/api/analytics/weekly/route.ts` - Uses session.user.id for analytics

**Home Page Behavior**
- `app/page.tsx` - Now redirects authenticated users to `/today`
- Unauthenticated users see landing page with "Get Started" and "Sign In" buttons

**Environment Configuration**
- `.env` - Added NEXTAUTH_SECRET and NEXTAUTH_URL

#### Security Improvements

- All passwords are hashed before storage
- API endpoints validate session before processing requests
- User data is isolated by userId from JWT session
- CSRF protection built into NextAuth
- Session tokens are signed with NEXTAUTH_SECRET
- Unauthorized API requests return 401 status

#### Breaking Changes

- Removed `userId` query parameter from all API endpoints
- API routes now require active session authentication
- Home page behavior changed for authenticated users
- All client-side data fetching must use authenticated session

#### Migration Guide for Existing Code

If you had code using the old userId query parameter:

**Before:**
```typescript
const response = await fetch(`/api/templates?userId=${userId}`)
```

**After:**
```typescript
const response = await fetch(`/api/templates`)
// userId is automatically extracted from session
```

#### Dependencies

```json
{
  "next-auth": "^5.0.0-beta",
  "bcryptjs": "^2.4.3"
}
```

#### File Structure Changes

```
New:
  lib/
    └── auth.ts
  
  app/api/auth/
    ├── [...nextauth]/route.ts
    └── register/route.ts
  
  app/
    ├── login/page.tsx
    └── register/page.tsx
  
  components/
    ├── SessionProvider.tsx
    ├── LogoutButton.tsx
    └── HomeContent.tsx
  
  AUTHENTICATION.md
  CHANGELOG.md (this file)

Modified:
  app/layout.tsx
  app/page.tsx
  app/api/templates/route.ts
  app/api/calendar/today/route.ts
  app/api/calendar/month/route.ts
  app/api/analytics/weekly/route.ts
  components/ConditionalThemeToggle.tsx
  .env
  prisma/schema.prisma
```

#### Testing Coverage

- ✅ User registration with email validation
- ✅ Password hashing and validation
- ✅ Login with correct/incorrect credentials
- ✅ Session persistence across pages
- ✅ Logout clears session
- ✅ Protected API routes return 401 for unauthenticated requests
- ✅ Home page redirect for authenticated users
- ✅ Data isolation between users
- ✅ Theme toggle with logout button

#### Deployment Notes

When deploying to production:
1. Generate a strong `NEXTAUTH_SECRET`: `openssl rand -base64 32`
2. Set `NEXTAUTH_URL` to your production domain
3. Ensure database is properly migrated
4. Use HTTPS for secure cookie transmission
5. Set secure environment variables in your hosting platform

---

## [1.5.0] - 2026-02-01

### Mobile Responsiveness & UI Improvements

#### Added
- Full mobile responsiveness across all pages
- Image support with public/images folder
- Transform effects on home page content
- Fixed positioning for theme toggle

#### Modified
- All pages updated with responsive Tailwind classes
- Home page layout with hero image integration
- Theme toggle positioning for better UX

---

## [1.0.0] - 2026-01-15

### Initial Release

#### Core Features
- Routine template creation (AI-guided and manual)
- Daily routine tracking
- Calendar integration
- Progress scoring system
- Weekly analytics
- Dark mode support
- Responsive design
- Prisma ORM with SQLite database
