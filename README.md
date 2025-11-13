# Decigo MVP - Plan Together, Decide Together

A full-stack React app with Supabase backend for collaborative group planning and decision-making.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + React Router
- **Backend**: Lovable Cloud (Supabase) + Edge Functions
- **Analytics**: Mixpanel
- **Maps**: Mapbox
- **Messaging**: Twilio (SMS), Resend (Email)
- **PWA**: Service Worker + Manifest

## Environment Variables

### Required Secrets (Supabase Edge Functions)
Already configured via Lovable:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SID`
- `RESEND_API_KEY`
- `MAPBOX_TOKEN`
- `MIXPANEL_TOKEN`
- `BASE_URL`

### Frontend Environment Variables (VITE_*)
Add to `.env` file:
```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
VITE_MAPBOX_TOKEN=<your-mapbox-public-token>
VITE_MIXPANEL_TOKEN=<your-mixpanel-token>
VITE_BASE_URL=<your-production-url>
```

## Edge Functions

All edge functions are deployed automatically:

### Core Functions
- **POST /functions/plans-create** - Create a new plan with options
- **GET /functions/plans-get** - Retrieve plan details
- **GET /functions/options-list** - Get options (top3 or full20 mode)
- **POST /functions/votes-cast** - Cast a vote for an option
- **POST /functions/lock-attempt** - Check if plan should lock

### Management Functions
- **POST /functions/plans-reroll** - Regenerate 3 new options (once per plan)
- **POST /functions/plans-cancel** - Cancel a plan
- **POST /functions/invites-add** - Add contacts to invite list
- **POST /functions/invites-send** - Send invites via SMS/email

### Utility Functions
- **GET /functions/ics?planId=...** - Download ICS calendar file
- **GET /functions/og/plan?id=...** - Generate OG image for sharing

### Webhooks
- **POST /functions/webhooks/twilio** - Handle SMS delivery status and STOP/HELP
- **POST /functions/webhooks/email** - Handle email bounces and unsubscribes

## Features

### ✅ Intake Form (/new)
- Date/time picker
- Neighborhood typeahead (Mapbox Places API)
- Headcount, budget band, daypart selection
- Two-stop toggle
- AI-powered chips from free text
- Result mode selector (Top 3 vs Full List)

### ✅ Plan View (/p/:planId)
- Top 3 cards with maps, details, tips
- Voting with lock detection
- Progress tracker with countdown
- Expand to full list (~20 options)
- Static map thumbnails
- Deep links to Apple Maps / Google Maps

### ✅ Locked View (/p/:planId/locked)
- Winner announcement
- Add to Calendar (ICS download)
- Map links
- Share link
- PWA install prompt

### ✅ Management (/p/:planId/manage?token=...)
- Edit plan details
- Send invites (SMS/email)
- View delivery status
- Cancel plan

### ✅ PWA Features
- Service worker caching
- Install prompt after first lock or 2nd session
- Offline shell support
- Static map image caching

### ✅ Analytics (Mixpanel)
All events tracked:
- `lp_view`, `intake_start`, `intake_complete`
- `options_shown_3`, `options_shown_list`
- `vote_cast`, `lock_reached`
- `calendar_added`, `map_open`
- `invite_step_shown`, `contact_added`, `invite_sent`

## Safety & Caps

### Messaging Limits
- **Max 8 SMS recipients per plan**
- **Max 3 messages per person per plan** (includes invites + reminders)
- **Quiet hours**: 22:00–08:00 (messages queued)
- **STOP/HELP compliance**: Automatic opt-out handling

### Privacy
- No address book sync
- Contact Picker API used when available
- Only selected contacts stored with consent timestamp

### COGS
- Static map thumbnails cached by service worker
- Lazy-loaded Leaflet for interactive maps
- Target: ≤$0.02 per plan

## Testing

### Smoke Tests
```bash
# 1. Create plan
curl -X POST $BASE_URL/functions/v1/plans-create \
  -H "Content-Type: application/json" \
  -d '{...plan data...}'

# 2. Get plan
curl "$BASE_URL/functions/v1/plans-get?id=PLAN_ID"

# 3. Vote
curl -X POST $BASE_URL/functions/v1/votes-cast \
  -H "Content-Type: application/json" \
  -d '{"planId":"...","optionId":"...","voterHash":"..."}'

# 4. Lock check
curl -X POST $BASE_URL/functions/v1/lock-attempt \
  -H "Content-Type: application/json" \
  -d '{"planId":"..."}'

# 5. Download ICS
curl "$BASE_URL/functions/v1/ics?planId=..."

# 6. Get OG image
curl "$BASE_URL/functions/v1/og/plan?id=..."
```

### Acceptance Criteria
- ✅ Intake P50 ≤ 45s
- ✅ Neighborhood typeahead works
- ✅ AI chips from free text
- ✅ Top 3 cards render above fold
- ✅ Voting + lock detection
- ✅ Progress & countdown visible
- ✅ Static maps ≤ 50KB
- ✅ Deep links to Apple Maps (iOS) / Google (Android)
- ✅ Max 8 SMS, 3 msgs/person enforced
- ✅ Quiet hours respected
- ✅ STOP/HELP handled
- ✅ ICS downloads and imports
- ✅ OG image renders in WhatsApp/iMessage
- ✅ PWA install prompt appears correctly

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment

Frontend changes require clicking "Update" in Lovable publish dialog.
Backend (edge functions) deploy automatically.

## BASE_URL Reference

Your production URL: `https://gomkcwfxbwtnxlgmvjjp.supabase.co`

Example function URLs:
- Plans Create: `${BASE_URL}/functions/v1/plans-create`
- Plans Get: `${BASE_URL}/functions/v1/plans-get`
- Vote Cast: `${BASE_URL}/functions/v1/votes-cast`
- Lock Attempt: `${BASE_URL}/functions/v1/lock-attempt`
- ICS: `${BASE_URL}/functions/v1/ics`
- OG Image: `${BASE_URL}/functions/v1/og/plan`

## Architecture

```
Frontend (React + Vite)
  ├─ Pages: Index, NewPlan, PlanView, PlanLocked, PlanManage
  ├─ Components: PlacesAutocomplete, CountdownTimer, InstallPrompt
  ├─ Hooks: usePWA
  └─ Lib: analytics

Backend (Supabase Edge Functions)
  ├─ plans-create, plans-get, plans-cancel, plans-reroll
  ├─ options-list, votes-cast, lock-attempt
  ├─ invites-add, invites-send
  ├─ ics, og-plan
  └─ webhooks-twilio, webhooks-email

Database (Supabase Postgres)
  ├─ plans, options, votes
  ├─ invites, reminders
  └─ flags

Analytics (Mixpanel)
PWA (Service Worker + Manifest)
Maps (Mapbox Static + Leaflet)
Messaging (Twilio + Resend)
```

## License

MIT
