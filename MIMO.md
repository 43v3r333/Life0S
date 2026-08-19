# MIMO.md — UI Component States, Styling Decisions, and Frontend Session Management

> **Purpose**: This file tracks UI component states, styling decisions, and frontend session management logic using HttpOnly cookies for the LifeOS frontend. It serves as the authoritative reference for all frontend-related state and styling choices.

## Session 1 — Initial Setup

### Operational Context
- **Worktree**: Isolated Git worktree for UI/UX and Frontend Specialist domain
- **Domain**: `src/`, `index.html`, `vite.config.ts`
- **Avoid**: Modules from `archive/legacy-ui/`
- **Testing**: Run `npm run dev` to test changes locally
- **Mobile Access**: Ensure compatibility with private mobile access tunnel initiated via ngrok
- **Data Integrity**: All user interfaces must accurately reflect transactional data without attempting to bypass the server API

### HttpOnly Cookie Session Management
The frontend uses HttpOnly cookies (named `lifeos_session`) for authentication state, as configured in `server.ts`:
- Cookie name: `lifeos_session`
- Attributes: `Path=/; HttpOnly; SameSite=Lax; Max-Age=<duration>`
- Secure flag: Added when connection is HTTPS (`req.secure`)
- Authentication state is determined server-side via `/api/auth/session` endpoint
- Client-side auth state (`authState` in `App.tsx`) syncs with server session on mount

### Key Directives

| Directive | Description |
|---|---|
| `avoid_legacy_ui` | Do not import or use any components from `archive/legacy-ui/`. All UI components live in `src/components/` or `src/ui/`. |
| `http_only_cookie` | Authentication relies on HttpOnly `lifeos_session` cookie. Never store raw credentials in localStorage or client-side state. |
| `ngrok_mobile_compatible` | Frontend must work behind ngrok tunnel. All API calls use relative paths (`/api/...`) and respect `APP_URL` config. |
| `responsive_design` | UI must be responsive from 320px mobile to 1600px desktop. Tailwind breakpoints are defined in `src/index.css`. |
| `no_api_bypass` | All data fetching must go through the Express server API (`/api/...` endpoints). Direct backend/database access from the frontend is forbidden. |

### UI Component State Tracking

#### App State Variables (in `src/App.tsx`)
- `activeTab` (`LifeOsPage`): Currently selected navigation tab. Updated via `navigateTo()` and URL query param `page`.
- `sidebarCollapsed` (`boolean`): Collapsed state persisted to `localStorage` key `lifeos.sidebar.collapsed`.
- `commandOpen` (`boolean`): CommandPalette open/closed state.
- `authState` (`"checking" | "authenticated" | "required"`): Synced with `/api/auth/session` on mount.
- `authEnabled` (`boolean`): Derived from server auth response.
- `theme` (`"light" | "dark" | "high-contrast"`): Persisted to `localStorage` key `lifeos.theme`.
- `scores` (`SystemScore`): Fetched from `/api/scores` on mount and refreshed periodically.
- `userProfile` (`UserProfile`): Injected from config + backend data.
- `notifications` (`SystemNotification[]`): Polling every 60s from `/api/notifications`.
- `signalREvents` (`string[]`): Local activity feed for concise save confirmations.

#### Navigation & Routing
- `pageFromUrl()`: Reads `page` query param from URL; defaults to `"dashboard"`.
- `updatePageUrl(page, mode)`: Updates URL search param and history state.
- `navigation` array: Defines all LifeOsPage entries with labels, short labels, descriptions, and icons.
- `MobileNavigation` component: Mobile-side navigation drawer for touch devices.

#### Cookie-Dependent Components
- `LoginView`: Renders when `authState === "required"`. Submits credentials to `/api/auth/login`, which sets HttpOnly cookie.
- `SystemCopilot`: Renders only when user is authenticated (`authEnabled && !sidebarCollapsed` conditions).
- `NotificationCenter`: Fetches notifications via `/api/notifications` — requires valid session for auth-required mode.
- `DesktopSidebar`: Toggles `sidebarCollapsed` state; persists to localStorage.

### Styling Decisions

#### Color Tokens (in `src/index.css` — root level)
- `--life-bg`: Light mode `#f7f5f2`, Dark mode `#161513`
- `--life-surface`: `#fffdfb` / `#211f1c`
- `--life-surface-muted`: `#f0ede8` / `#2b2824`
- `--life-border`: `#ded9d2` / `#403b35`
- `--life-text`: `#211f1c` / `#f7f5f2`
- `--life-muted`: `#716b63` / `#b8b0a6`
- `--life-accent`: `#245b4a` / `#69c5a4`
- `--life-accent-soft`: `#e4f0eb` / `#19372d`
- `--life-shadow`: `0 1px 2px rgb(37 32 27/.05), 0 12px 30px rgb(37 32 27/.06)`

#### Theme Classes
- `[data-theme="light"]`: Default (no attribute = light)
- `[data-theme="dark"]`: Activated when `theme === "dark"` saved to localStorage
- `[data-theme="high-contrast"]`: Activated when `theme === "high-contrast"` saved to localStorage

#### Responsive Breakpoints (Tailwind via `index.css` `@media(max-width:767px)`)
- Mobile: Sidebar hidden (`life-sidebar{display:none}`), topbar reduced height (`58px`), mobile navigation bar appears (`life-mobile-nav{display:grid}`), mobile drawer available (`life-mobile-drawer{display:block}`)
- Desktop: Default grid layout (`life-shell{display:grid}`), sidebar visible (`232px`)

#### Component Styling Conventions
- All components use `className` with `life-` prefix (e.g., `life-card`, `life-button-primary`)
- Buttons: `life-button-primary`, `life-button-secondary`, `life-button-danger`
- Cards: `life-card`
- Metrics: `life-metric` with `.life-metric-dot` for status indicators
- Tabs: `life-tabs` with `life-tabs button` for tab items
- Dialogs: `life-dialog-backdrop`, `life-dialog`, `life-dialog-close`
- Notices: `life-notice` with tone-specific styling (success/warning/danger/neutral)

### Frontend Session Management Workflow

1. **App Mount** (`main.tsx` → `App.tsx`):
   - `useEffect` fetches `GET /api/auth/session`
   - On success: sets `authEnabled = result.authRequired === true` and `authState` based on `result.authenticated`
   - On failure: sets `authState = "required"`
   - If `authRequired` is false (not configured), `authState` defaults to `"authenticated"`

2. **Login Flow**:
   - User enters credentials in `LoginView`
   - Form submits to `POST /api/auth/login`
   - Server sets HttpOnly `lifeos_session` cookie via `Set-Cookie` header
   - Response returns `authenticated: true` and username
   - Client sets `authState = "authenticated"` and `authEnabled = true`
   - Page redirects to dashboard (via URL `page` query param)

3. **Session Validation**:
   - Every `/api/` request (except `/auth/` and `/google/oauth/callback`) passes through auth middleware
   - Middleware reads `lifeos_session` cookie via `readCookies(req.headers.cookie)`
   - If no valid session: returns `401 Unauthorized`
   - Valid session attaches user context to `req` object

4. **Logout Flow**:
   - `POST /api/auth/logout` clears server session
   - `clearSessionCookie(res)` sets `lifeos_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
   - Client `authState` set to `"required"`
   - Page shows login view again

5. ** ngrok / Mobile Tunnel Compatibility**:
   - All API calls use relative paths (`/api/...`) — works with ngrok tunnel
   - `APP_URL` env var must be set (e.g., `http://127.0.0.1:3001`)
   - No hardcoded hostnames — all URLs are constructed relative to current origin
   - CORS not required since frontend and backend run on same origin (`127.0.0.1:3001`)

### Known State Persistence Mechanisms

| Mechanism | Scope | Persistence |
|---|---|---|
| `localStorage` | `lifeos.theme`, `lifeos.sidebar.collapsed` | Browser session / local |
| HttpOnly Cookie | `lifeos_session` | Server-side, sent by browser automatically |
| URL Query Params | `page` navigation | Browser URL bar |
| In-memory (`App.tsx` state) | `sidebarCollapsed`, `commandOpen`, `authState`, `theme`, `scores`, `userProfile`, `notifications`, `signalREvents` | React state — lost on page reload (re-fetched from server/API) |

### Recent Decisions & Rationale

- **HttpOnly cookies over localStorage auth**: Chosen for security — HttpOnly cookies cannot be accessed by JavaScript, preventing XSS theft of session tokens. The `lifeos_session` cookie is set by the server on login and sent automatically by the browser on subsequent requests.
- **localStorage for UI preferences**: Theme and sidebar state stored in localStorage because they are cosmetic preferences, not security-sensitive. If compromised, only UI appearance is affected.
- **URL-based page navigation** (`?page=dashboard`): Enables bookmarking and sharing of specific views, and works with ngrok tunnel since it's relative to the current host.
- **No `any` type usage**: Project enforces 100% strict typing (per `AGENTS.md`). All variables use explicit types from `src/types.ts` or inferred from context.
- **Avoid `archive/legacy-ui`**: All new UI components must be built in `src/components/` or `src/ui/`. Legacy archive components exist only for reference/history and are not imported anywhere in the active codebase.

### TODO Items & Open Questions

- [ ] Migrate `sidebarCollapsed` persistence from `localStorage` to HttpOnly cookie for security consistency
- [ ] Add `Secure` flag to `lifeos_session` cookie when behind ngrok HTTPS tunnel
- [ ] Implement token refresh mechanism before cookie expiry
- [ ] Add `XSRF-TOKEN` handling for POST requests (currently not implemented)
- [ ] Verify mobile navigation drawer works correctly behind ngrok (touch events, safe-area insets)
- [ ] Ensure all `/api/...` endpoints properly respect the HttpOnly cookie-based auth flow

### Change Log

| Date | Change | Author |
|---|---|---|
| 2026-08-19 | Initial MIMO.md creation — UI component states, styling decisions, and frontend session management using HttpOnly cookies | UI/UX and Frontend Specialist |